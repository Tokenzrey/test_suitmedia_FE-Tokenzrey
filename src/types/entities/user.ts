export const ROLE = ['admin', 'user'] as const;

export type Role = (typeof ROLE)[number];

export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
};

export type withToken = {
  token: string;
};
