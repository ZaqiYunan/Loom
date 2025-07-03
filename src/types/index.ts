// Common types used across the application

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl?: string | null;
  sellerId: number;
  createdAt: Date;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
}

export interface Order {
  id: number;
  userId: number;
  sellerId: number;
  totalAmount: number;
  status: string;
  orderDate: Date;
  items: OrderItem[];
}

export interface Seller {
  id: number;
  userId: number;
  storeName: string;
  description?: string;
  user: {
    fullName: string;
  };
}

export interface ProductWithSeller extends Product {
  seller: Seller;
}
