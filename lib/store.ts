// In-browser demo store.
// When Firebase is not configured, the app uses this lightweight localStorage-backed
// store so the entire UI (cart, checkout, orders, admin) works without a backend.
// When Firebase IS configured, the real Firestore paths are used instead (lib/data.ts).

import { Product, CartItem, Order, OrderStatus, DeliverySlot, AppUser } from './types';
import { sampleProducts, sampleSlots } from '@/data/sampleProducts';

const PREFIX = 'kirana_';
const K_PRODUCTS = PREFIX + 'products';
const K_ORDERS = PREFIX + 'orders';
const K_SLOTS = PREFIX + 'slots';
const K_CART = PREFIX + 'cart';
const K_USER = PREFIX + 'user';

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function seedDemoProducts() {
  const existing = read<Product[]>(K_PRODUCTS, []);
  if (existing.length === 0) {
    write(K_PRODUCTS, sampleProducts);
  }
  const slots = read<DeliverySlot[]>(K_SLOTS, []);
  if (slots.length === 0) {
    write(K_SLOTS, sampleSlots);
  }
}

// Products
export function demoGetProducts(): Product[] {
  return read<Product[]>(K_PRODUCTS, sampleProducts);
}

export function demoGetProduct(id: string): Product | undefined {
  return demoGetProducts().find((p) => p.id === id);
}

export function demoSaveProduct(product: Product) {
  const products = demoGetProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) products[idx] = product;
  else products.push(product);
  write(K_PRODUCTS, products);
}

export function demoDeleteProduct(id: string) {
  write(
    K_PRODUCTS,
    demoGetProducts().filter((p) => p.id !== id),
  );
}

// Slots
export function demoGetSlots(): DeliverySlot[] {
  return read<DeliverySlot[]>(K_SLOTS, sampleSlots);
}

export function demoSaveSlot(slot: DeliverySlot) {
  const slots = demoGetSlots();
  const idx = slots.findIndex((s) => s.id === slot.id);
  if (idx >= 0) slots[idx] = slot;
  else slots.push(slot);
  write(K_SLOTS, slots);
}

export function demoDeleteSlot(id: string) {
  write(
    K_SLOTS,
    demoGetSlots().filter((s) => s.id !== id),
  );
}

// Cart
export function demoGetCart(): CartItem[] {
  return read<CartItem[]>(K_CART, []);
}

export function demoSaveCart(items: CartItem[]) {
  write(K_CART, items);
}

export function demoClearCart() {
  write(K_CART, []);
}

// Orders
export function demoGetOrders(): Order[] {
  return read<Order[]>(K_ORDERS, []);
}

export function demoGetOrder(id: string): Order | undefined {
  return demoGetOrders().find((o) => o.id === id);
}

export function demoGetUserOrders(userId: string): Order[] {
  return demoGetOrders().filter((o) => o.userId === userId);
}

export function demoCreateOrder(order: Order) {
  const orders = demoGetOrders();
  orders.unshift(order);
  write(K_ORDERS, orders);
}

export function demoUpdateOrderStatus(id: string, status: OrderStatus) {
  const orders = demoGetOrders();
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    order.statusHistory.push({ status, timestamp: Date.now() });
    if (status === 'delivered') order.paymentStatus = 'paid';
    write(K_ORDERS, orders);
  }
}

// User (demo auth)
export function demoGetUser(): AppUser | null {
  return read<AppUser | null>(K_USER, null);
}

export function demoSetUser(user: AppUser | null) {
  write(K_USER, user);
}
