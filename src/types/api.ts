/**
 * Standard successful API response wrapper
 * Generic type T represents the data payload
 */
export type ApiResponse<T = unknown> = {
  message: string;
  status: true; // Always true for successful responses
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
    timestamp?: number;
    version?: string;
  };
};

/**
 * Error codes enum for better type safety
 */
export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Standard API error response
 */
export type ApiError = {
  error: string; // Error identifier/code
  status: false; // Always false for error responses
  message: string; // User-friendly error message
  statusCode: ErrorCode | number; // HTTP status code
  details?: Record<string, string[]> | string[]; // Detailed error information, often for validation errors
  timestamp?: number;
};

/**
 * Type for raw/unintercepted API errors from the backend
 * This is useful when you need to handle raw error responses before transforming them
 */
export type UninterceptedApiError = {
  code: number;
  status: false;
  message: string | Record<string, string[]>;
  timestamp?: number;
};

/**
 * Union type representing all possible API responses
 */
export type ApiResult<T> = ApiResponse<T> | ApiError;

/**
 * Helper type guard to check if the response is an error
 */
export function isApiError(response: ApiResult<unknown>): response is ApiError {
  return response.status === false;
}

/**
 * Helper type guard to check if the response is successful
 */
export function isApiSuccess<T>(
  response: ApiResult<T>,
): response is ApiResponse<T> {
  return response.status === true;
}
