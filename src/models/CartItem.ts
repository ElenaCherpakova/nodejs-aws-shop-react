import { Product } from "~/models/Product";

export type CartItem = {
  product: Product;
  count: number;
};

export type Cart = {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
};
