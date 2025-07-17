// Tipe untuk data user
export type User = {
  id: number;
  name: string;
  email: string;
};

// Tipe untuk data product
export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

// Extended Product type with formatting
export type FormattedProduct = Product & {
  formattedPrice: string;
};
