export type Page =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'success'
  | 'account'
  | 'about'
  | 'contact'
  | 'login';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  material: string;
  weight: string;
  sizes?: string[];
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

export interface CartItem {
  cartId: string;
  productId: number;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}
