import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import LoadingPage from '@/components/Loading';
import { ADMIN_ROUTE, LOGIN_ROUTE, USER_ROUTE } from '@/constant/withAuth';
import api from '@/lib/api';
import useAuthStore from '@/lib/Auth/useAuthStore';
import { getToken, removeToken } from '@/lib/cookies';
import { ApiResponse } from '@/types/api';
import { Role, User } from '@/types/entities/user';

/**
 * Check if the current user has permission based on their role.
 * @param user - The current user.
 * @param routeRole - The required roles to access the route.
 * @returns Boolean indicating whether the user has permission.
 */
const hasPermission = (user: User | null, routeRole: Role[]): boolean => {
  return routeRole.some((role) => user?.role.includes(role));
};

/**
 * Higher-order component to add authentication and role-based access control.
 * @param Component - The component to wrap with authentication.
 * @param routeRole - Either 'auth' for public routes or an array of roles for protected routes.
 */
export default function withAuth<T>(
  Component: React.ComponentType<T>,
  routeRole: 'auth' | Role[], // Allow 'auth' string or an array of roles
) {
  function ComponentWithAuth(props: T) {
    const router = useRouter();
    const redirect = useSearchParams().get('redirect');
    const pathname = usePathname();

    //#region  //*=========== STORE ===========
    const isAuthenticated = useAuthStore.useIsAuthenticated();
    const isLoading = useAuthStore.useIsLoading();
    const login = useAuthStore.useLogin();
    const logout = useAuthStore.useLogout();
    const stopLoading = useAuthStore.useStopLoading();
    const user = useAuthStore.useUser();
    //#endregion  //*=========== STORE ===========

    /**
     * Handles authentication checking.
     * If no token is present, logs out the user.
     * Fetches user data if token exists and logs them in.
     */
    const checkAuth = React.useCallback(async () => {
      const token = getToken();
      if (!token) {
        if (isAuthenticated) logout();
        stopLoading();
        return;
      }

      try {
        const res = await api.get<ApiResponse<User>>('/user/me');
        const userData = res.data.data;

        if (!userData) {
          throw new Error('Invalid login session');
        }

        login({
          ...userData,
          token: token + '',
        });
        // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (error) {
        removeToken(); // Clear token on error
        logout(); // Log out user if the session is invalid
      } finally {
        stopLoading();
      }
    }, [isAuthenticated, login, logout, stopLoading]);

    // Run auth check on component mount and when window focus changes
    React.useEffect(() => {
      checkAuth(); // Run on page visit

      const handleFocus = () => checkAuth();
      window.addEventListener('focus', handleFocus);

      return () => {
        window.removeEventListener('focus', handleFocus); // Cleanup on unmount
      };
    }, [checkAuth]);

    // Handle redirection based on user authentication status and route roles
    React.useEffect(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          // Prevent authenticated users from accessing public/auth routes
          if (
            routeRole === 'auth' || // Handle 'auth' as a special case
            (Array.isArray(routeRole) && !hasPermission(user, routeRole))
          ) {
            const targetRoute =
              redirect ||
              (user?.role.includes('admin') ? ADMIN_ROUTE : USER_ROUTE);
            router.replace(targetRoute);
          }
        } else {
          // Prevent unauthenticated users from accessing protected routes
          if (routeRole !== 'auth') {
            router.replace(`${LOGIN_ROUTE}?redirect=${pathname}`);
          }
        }
      }
    }, [isAuthenticated, isLoading, pathname, redirect, router, user]);

    // If loading or user doesn't have permission, show a loading page
    if (
      ((isLoading || !isAuthenticated) && routeRole !== 'auth') ||
      (isAuthenticated &&
        Array.isArray(routeRole) &&
        !hasPermission(user, routeRole))
    ) {
      return <LoadingPage />;
    }

    // Render the wrapped component with user props
    return <Component {...(props as T)} user={user} />;
  }

  return ComponentWithAuth;
}
