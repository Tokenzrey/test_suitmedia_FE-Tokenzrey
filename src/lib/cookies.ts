import Cookies from 'universal-cookie';

import { cookiesName } from '@/constant/cookies';

const cookies = new Cookies();

/**
 * Mengambil token dari cookie.
 *
 * @returns {string | undefined} Token jika ada, atau undefined jika tidak ditemukan.
 */
export const getToken = (): string | undefined => {
  const token = cookies.get(cookiesName);
  return typeof token === 'string' ? token : undefined;
};

/**
 * Menyimpan token ke dalam cookie.
 *
 * Opsi cookie telah disesuaikan untuk environment production.
 *
 * @param {string} token - Token yang akan disimpan.
 */
export const setToken = (token: string): void => {
  cookies.set(cookiesName, token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: 'lax',
  });
};

/**
 * Menghapus token dari cookie.
 */
export const removeToken = (): void => {
  cookies.remove(cookiesName, { path: '/' });
};
