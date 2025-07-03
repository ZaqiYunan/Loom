// Common types used across the application

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  sellerId: number;
  createdAt: Date;
  updatedAt: Date;
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
    id: number;
    name: string;
    imageUrl?: string;
  };
}

export interface Order {
  id: number;
  userId: number;
  sellerId: number;
  totalAmount: number;
  status: string;
  orderDate: Date;
  createdAt: Date;
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
