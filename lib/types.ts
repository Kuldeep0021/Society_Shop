export type Category =
  | 'Dairy'
  | 'Grains'
  | 'Snacks'
  | 'Household'
  | 'Beverages';

export const CATEGORIES: Category[] = [
  'Dairy',
  'Grains',
  'Snacks',
  'Household',
  'Beverages',
];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: string;
  imageUrl: string;
  inStock: boolean;
  stockCount: number;
  description?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  unit: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_PROGRESS: Record<OrderStatus, number> = {
  pending: 0,
  accepted: 25,
  preparing: 50,
  out_for_delivery: 75,
  delivered: 100,
  cancelled: 0,
};

export type PaymentMethod = 'cod' | 'online';
export type PaymentStatus = 'paid' | 'unpaid';

export interface DeliveryAddress {
  tower: string;
  flatNumber: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: DeliveryAddress;
  deliverySlot: string;
  createdAt: number;
  statusHistory: { status: OrderStatus; timestamp: number }[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  customerPhone?: string;
}

export interface DeliverySlot {
  id: string;
  label: string;
  isActive: boolean;
}

export interface AppUser {
  uid: string;
  name: string;
  phone: string;
  email?: string;
}
