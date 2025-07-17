import { User, withToken } from '@/types/entities/user';

/**
 * Authentication Store Type Definition
 *
 * Defines the structure and functionality of the authentication store,
 * including user state management, authentication status, and actions.
 *
 * @typedef {Object} AuthStoreType
 * @property {User | null} user - The currently authenticated user, or null if not authenticated
 * @property {boolean} isAuthenticated - Indicates if a user is currently authenticated
 * @property {boolean} isLoading - Indicates if authentication state is being processed
 * @property {(user: User & withToken) => void} login - Function to authenticate a user and store their data
 * @property {() => void} logout - Function to log out the current user and clear their data
 * @property {() => void} stopLoading - Function to mark authentication loading as complete
 */
export type AuthStoreType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User & withToken) => void;
  logout: () => void;
  stopLoading: () => void;
};
