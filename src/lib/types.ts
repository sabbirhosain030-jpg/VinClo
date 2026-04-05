export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: OrderItem[];
  total: number;
  source: 'store' | 'pos';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}
