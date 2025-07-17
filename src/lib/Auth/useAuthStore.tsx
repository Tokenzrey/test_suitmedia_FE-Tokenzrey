import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import { produce } from 'immer';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { cookiesName } from '@/constant/cookies';
import { removeToken, setToken } from '@/lib/cookies';
import { AuthStoreType } from '@/types/auth';
import { User, withToken } from '@/types/entities/user';

/**
 * Create the base authentication store with Zustand
 * Uses Immer for immutable state updates and persist middleware for state persistence
 */
const useAuthStoreBase = create<AuthStoreType>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      /**
       * Authenticates a user by:
       * 1. Setting the JWT token in cookies
       * 2. Updating the store with user information
       * 3. Setting authentication status to true
       *
       * @param {User & withToken} user - User object with authentication token
       */
      login: (user: User & withToken) => {
        try {
          // Set the token securely in cookies
          setToken(user.token);

          // Update store state immutably with Immer
          set(
            produce((state: AuthStoreType) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
            }),
          );
        } catch (error) {
          // Use a more production-friendly error handling approach
          // that doesn't leak to console in production
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error('Authentication error:', error);
          }
          // Could integrate with error tracking service here
        }
      },

      /**
       * Logs out the current user by:
       * 1. Removing the token from cookies
       * 2. Clearing user data from the store
       * 3. Setting authentication status to false
       */
      logout: () => {
        try {
          // Remove authentication token
          removeToken();

          // Update store state immutably
          set(
            produce((state: AuthStoreType) => {
              state.user = null;
              state.isAuthenticated = false;
            }),
          );
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error('Logout error:', error);
          }
          // Could integrate with error tracking service here
        }
      },

      /**
       * Marks the authentication loading process as complete
       * Useful after checking token validity on app initialization
       */
      stopLoading: () => {
        set(
          produce((state: AuthStoreType) => {
            state.isLoading = false;
          }),
        );
      },
    }),
    {
      name: cookiesName, // Custom storage key name
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (state) => ({
        // Only persist minimal user data needed for session restoration
        user: state.user
          ? {
              id: state.user.id,
              username: state.user.username,
              email: state.user.email,
              // Exclude token and other sensitive fields
            }
          : null,
        isAuthenticated: state.isAuthenticated,
        // Exclude functions and transient state like isLoading
      }),
    },
  ),
);

/**
 * Enhanced auth store with selector hooks for optimized component subscriptions
 * Allows components to subscribe only to the specific state slices they need
 */
const useAuthStore = createSelectorHooks(useAuthStoreBase);

export default useAuthStore;
