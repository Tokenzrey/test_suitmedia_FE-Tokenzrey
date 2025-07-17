import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { PRODUCTS_ENDPOINT, USERS_ENDPOINT } from '@/constant/sandbox/api';
import {
  api,
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  createQueryKey,
} from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { FormattedProduct, Product, User } from '@/types/sandbox/api';

/**
 * Custom hook untuk mengambil daftar user
 */
export function useUsers(params?: Record<string, any>) {
  return useQuery({
    queryKey: createQueryKey(USERS_ENDPOINT, params),
    queryFn: async () => {
      const response = await apiGet<User[]>(
        USERS_ENDPOINT,
        { params },
        { dataOnly: true },
      );
      return response;
    },
  });
}

/**
 * Custom hook untuk mengambil detail user berdasarkan ID
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: createQueryKey(`${USERS_ENDPOINT}/${id}`, {}),
    queryFn: async () => {
      const response = await apiGet<User>(
        `${USERS_ENDPOINT}/${id}`,
        {},
        { dataOnly: true },
      );
      return response;
    },
    enabled: !!id, // Query hanya dijalankan jika ID tersedia
  });
}

/**
 * Custom hook untuk mengambil daftar product dengan advanced options
 */
export function useProducts(params?: Record<string, any>) {
  // Menggunakan createQueryFn untuk membuat query function yang mengembalikan AxiosResponse
  return useQuery<
    AxiosResponse<ApiResponse<Product[]>>,
    Error,
    FormattedProduct[]
  >({
    queryKey: createQueryKey(PRODUCTS_ENDPOINT, params),
    queryFn: () => {
      // Pastikan fungsi hanya mengembalikan AxiosResponse<ApiResponse<Product[]>>
      return api.get<ApiResponse<Product[]>>(PRODUCTS_ENDPOINT, { params });
    },
    select: (response: AxiosResponse<ApiResponse<Product[]>>) => {
      // Custom transformer untuk response data (dari axios response mentah)
      const products = response.data.data;

      // Tambahkan formatting atau logic lain
      return products.map(
        (product: Product): FormattedProduct => ({
          ...product,
          formattedPrice: `Rp ${product.price.toLocaleString('id-ID')}`,
        }),
      );
    },
  });
}

/**
 * Custom hook untuk membuat product baru
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: Omit<Product, 'id'>) => {
      const response = await apiPost<Product>(
        PRODUCTS_ENDPOINT,
        newProduct,
        {},
        { dataOnly: true },
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate dan refetch
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_ENDPOINT] });
    },
  });
}

/**
 * Custom hook untuk update product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Product>;
    }) => {
      const response = await apiPut<Product>(
        `${PRODUCTS_ENDPOINT}/${id}`,
        data,
        {},
        { dataOnly: true },
      );
      return response;
    },
    onSuccess: (data, variables) => {
      // Update cache dengan data terbaru
      queryClient.setQueryData(
        createQueryKey(`${PRODUCTS_ENDPOINT}/${variables.id}`, {}),
        data,
      );

      // Invalidate product list queries
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_ENDPOINT] });
    },
  });
}

/**
 * Custom hook untuk menghapus product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiDelete(`${PRODUCTS_ENDPOINT}/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate query list
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_ENDPOINT] });

      // Remove detail query dari cache
      queryClient.removeQueries({
        queryKey: createQueryKey(`${PRODUCTS_ENDPOINT}/${id}`, {}),
      });
    },
  });
}
