import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { GetServerSidePropsContext } from 'next/types';
import Cookies from 'universal-cookie';

import { cookiesName } from '@/constant/cookies';
import { getToken } from '@/lib/cookies';
import {
  ApiError,
  ApiResponse,
  ErrorCode,
  UninterceptedApiError,
} from '@/types/api';

/**
 * Menentukan base URL API berdasarkan environment.
 */
export const baseURL =
  process.env.NEXT_PUBLIC_RUN_MODE === 'development'
    ? process.env.NEXT_PUBLIC_API_URL_DEV
    : process.env.NEXT_PUBLIC_API_URL_PROD;

/**
 * Instance Axios untuk melakukan request ke API.
 */
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Pastikan dengan eksplisit bahwa withCredentials adalah false.
api.defaults.withCredentials = false;

/**
 * Variabel untuk menyimpan konteks server-side.
 */
let ssrContext: GetServerSidePropsContext | undefined;

/**
 * Mengatur konteks API (SSR) untuk pengambilan cookie pada sisi server.
 *
 * @param context - Konteks Next.js dari getServerSideProps atau sejenisnya.
 */
export function setApiContext(context: GetServerSidePropsContext) {
  ssrContext = context;
}

/**
 * Menentukan apakah kode berjalan di lingkungan browser.
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Interceptor request untuk menambahkan header Authorization jika token tersedia.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Pastikan headers selalu terdefinisi.
    config.headers = config.headers ?? {};

    let token: string | undefined;

    if (!isBrowser) {
      // Server-side: pastikan ssrContext telah diatur.
      if (!ssrContext || !ssrContext.req) {
        throw new Error(
          'API context not found. Please call setApiContext(context) in your server-side code before making API calls.',
        );
      }
      const cookies = new Cookies(ssrContext.req.headers.cookie);
      token = cookies.get(cookiesName);
    } else {
      // Client-side: ambil token menggunakan helper getToken().
      token = getToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Format error details dari berbagai bentuk pesan error
 *
 * @param message - Pesan error dari API yang bisa berbentuk string atau object
 * @returns Detail error yang sudah diformat
 */
function formatErrorDetails(
  message: string | Record<string, string[]> | unknown,
): {
  message: string;
  details?: Record<string, string[]> | string[];
} {
  let formattedMessage = 'Unknown error occurred';
  let details: Record<string, string[]> | string[] | undefined = undefined;

  if (typeof message === 'string') {
    formattedMessage = message;
  } else if (Array.isArray(message)) {
    formattedMessage = message[0] || formattedMessage;
    details = message;
  } else if (message && typeof message === 'object') {
    const objMessage = message as Record<string, string[]>;
    const firstKey = Object.keys(objMessage)[0];

    if (firstKey && Array.isArray(objMessage[firstKey])) {
      formattedMessage = objMessage[firstKey][0] || formattedMessage;
      details = objMessage;
    } else {
      formattedMessage = JSON.stringify(message);
    }
  }

  return { message: formattedMessage, details };
}

/**
 * Interceptor response untuk merapikan pesan error yang diterima dari API.
 */
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  (error: AxiosError<UninterceptedApiError>) => {
    if (error.response?.data) {
      const { message, code } = error.response.data;
      const { message: formattedMessage, details } =
        formatErrorDetails(message);

      // Buat ApiError yang sesuai dengan tipe yang telah didefinisikan
      const apiError: ApiError = {
        error: error.name || 'ApiError',
        status: false,
        message: formattedMessage,
        statusCode:
          code || error.response.status || ErrorCode.INTERNAL_SERVER_ERROR,
        details,
        timestamp: Date.now(),
      };

      // Override error response dengan format yang konsisten
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: apiError,
        },
      });
    }

    // Fallback untuk error tanpa response
    const fallbackError: ApiError = {
      error: error.name || 'NetworkError',
      status: false,
      message: error.message || 'Network error occurred',
      statusCode: ErrorCode.INTERNAL_SERVER_ERROR,
      timestamp: Date.now(),
    };

    return Promise.reject({
      ...error,
      response: {
        ...error.response,
        data: fallbackError,
      },
    });
  },
);

/**
 * Type untuk parameter query options
 */
export type QueryOptions = {
  /** Apakah ingin mendapatkan response asli dari axios (untuk TanStack Query) */
  rawResponse?: boolean;
  /** Flag untuk mendapatkan hanya data (tanpa wrapper ApiResponse) */
  dataOnly?: boolean;
  /** Fungsi untuk mentransformasi data sebelum dikembalikan */
  transformer?: (data: any) => any;
};

/**
 * Fungsi untuk memproses response berdasarkan options
 */
function processResponse<T>(
  response: AxiosResponse<ApiResponse<T>>,
  options?: QueryOptions,
): ApiResponse<T> | T | AxiosResponse<ApiResponse<T>> {
  if (options?.rawResponse) {
    return response;
  }

  if (options?.transformer) {
    response.data.data = options.transformer(response.data.data);
  }

  return options?.dataOnly ? response.data.data : response.data;
}

/**
 * Helper method untuk melakukan GET request dengan tipe generic
 * Mendukung integrasi dengan TanStack Query
 */
export async function apiGet<T = unknown>(
  url: string,
  config = {},
  options?: QueryOptions,
): Promise<ApiResponse<T> | T | AxiosResponse<ApiResponse<T>>> {
  const response = await api.get<ApiResponse<T>>(url, config);
  return processResponse<T>(response, options);
}

/**
 * Helper method untuk melakukan POST request dengan tipe generic
 * Mendukung integrasi dengan TanStack Query
 */
export async function apiPost<T = unknown>(
  url: string,
  data = {},
  config = {},
  options?: QueryOptions,
): Promise<ApiResponse<T> | T | AxiosResponse<ApiResponse<T>>> {
  const response = await api.post<ApiResponse<T>>(url, data, config);
  return processResponse<T>(response, options);
}

/**
 * Helper method untuk melakukan PUT request dengan tipe generic
 * Mendukung integrasi dengan TanStack Query
 */
export async function apiPut<T = unknown>(
  url: string,
  data = {},
  config = {},
  options?: QueryOptions,
): Promise<ApiResponse<T> | T | AxiosResponse<ApiResponse<T>>> {
  const response = await api.put<ApiResponse<T>>(url, data, config);
  return processResponse<T>(response, options);
}

/**
 * Helper method untuk melakukan DELETE request dengan tipe generic
 * Mendukung integrasi dengan TanStack Query
 */
export async function apiDelete<T = unknown>(
  url: string,
  config = {},
  options?: QueryOptions,
): Promise<ApiResponse<T> | T | AxiosResponse<ApiResponse<T>>> {
  const response = await api.delete<ApiResponse<T>>(url, config);
  return processResponse<T>(response, options);
}

/**
 * Fungsi helper untuk membuat query key untuk TanStack Query
 */
export function createQueryKey(
  endpoint: string,
  params?: Record<string, any>,
): unknown[] {
  return params ? [endpoint, params] : [endpoint];
}

/**
 * Factory function untuk membuat query client untuk TanStack Query
 */
export function createQueryFn<T = unknown>(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  data?: any,
  axiosConfig?: any,
) {
  return async () => {
    switch (method) {
      case 'get':
        return apiGet<T>(endpoint, axiosConfig, { rawResponse: true });
      case 'post':
        return apiPost<T>(endpoint, data, axiosConfig, { rawResponse: true });
      case 'put':
        return apiPut<T>(endpoint, data, axiosConfig, { rawResponse: true });
      case 'delete':
        return apiDelete<T>(endpoint, axiosConfig, { rawResponse: true });
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  };
}

export default api;
