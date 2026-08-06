// Unified data access layer.
// This has been migrated to use Next.js API Routes which connect to MongoDB Atlas.

import { Product, CartItem, Order, OrderStatus, DeliverySlot } from './types';
import * as demo from './store';

const isDemo = false; // Set to true if you want to force local demo mode without MongoDB

// Helper for API calls
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API request failed');
  }
  return res.json();
}

// ---------- Products ----------
export async function getProducts(): Promise<Product[]> {
  if (isDemo) return demo.demoGetProducts();
  return fetchAPI('/products');
}

export async function getProduct(id: string): Promise<Product | null> {
  if (isDemo) return demo.demoGetProduct(id) || null;
  try {
    // We don't have a specific get by id route yet, so we fetch all and find, or we can just add a route.
    const products = await getProducts();
    return products.find(p => p.id === id) || null;
  } catch (e) {
    return null;
  }
}

export async function saveProduct(product: Product) {
  if (isDemo) {
    demo.demoSaveProduct(product);
    return;
  }
  if (product.id && !product.id.startsWith('temp_')) {
    await fetchAPI(`/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  } else {
    await fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }
}

export async function deleteProduct(id: string) {
  if (isDemo) {
    demo.demoDeleteProduct(id);
    return;
  }
  await fetchAPI(`/products/${id}`, { method: 'DELETE' });
}

// ---------- Image upload (Cloudinary) ----------
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  if (isDemo) {
    return demo.demoGetProducts()[0]?.imageUrl || '';
  }
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error('Image upload failed');
  }
  
  const data = await res.json();
  return data.url;
}

// ---------- Delivery Slots ----------
export async function getSlots(): Promise<DeliverySlot[]> {
  if (isDemo) return demo.demoGetSlots();
  return fetchAPI('/slots');
}

export async function saveSlot(slot: DeliverySlot) {
  if (isDemo) {
    demo.demoSaveSlot(slot);
    return;
  }
  if (slot.id && !slot.id.startsWith('temp_')) {
    await fetchAPI(`/slots/${slot.id}`, {
      method: 'PUT',
      body: JSON.stringify(slot),
    });
  } else {
    await fetchAPI('/slots', {
      method: 'POST',
      body: JSON.stringify(slot),
    });
  }
}

export async function deleteSlot(id: string) {
  if (isDemo) {
    demo.demoDeleteSlot(id);
    return;
  }
  await fetchAPI(`/slots/${id}`, { method: 'DELETE' });
}

// ---------- Cart ----------
// Cart is kept in demo local storage for now to keep things fast and simple without requiring auth
export async function getCart(userId: string): Promise<CartItem[]> {
  return demo.demoGetCart();
}

export async function saveCart(userId: string, items: CartItem[]) {
  demo.demoSaveCart(items);
}

export async function clearCart(userId: string) {
  demo.demoClearCart();
}

// ---------- Orders ----------
export async function createOrder(order: Order): Promise<string> {
  if (isDemo) {
    demo.demoCreateOrder(order);
    return order.id;
  }
  const { id, ...data } = order;
  const res = await fetchAPI('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.id;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (isDemo) return demo.demoGetOrder(id) || null;
  try {
    return fetchAPI(`/orders/${id}`);
  } catch (e) {
    return null;
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (isDemo) return demo.demoGetUserOrders(userId);
  return fetchAPI(`/orders?userId=${userId}`);
}

export async function getAllOrders(): Promise<Order[]> {
  if (isDemo) return demo.demoGetOrders();
  return fetchAPI('/orders');
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (isDemo) {
    demo.demoUpdateOrderStatus(id, status);
    return;
  }
  await fetchAPI(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ---------- Real-time subscriptions (Converted to polling for MongoDB) ----------
export function subscribeToOrder(id: string, cb: (order: Order | null) => void): () => void {
  if (isDemo) {
    cb(demo.demoGetOrder(id) || null);
    return () => {};
  }
  
  // Initial fetch
  getOrder(id).then(cb);
  
  // Poll every 5 seconds
  const interval = setInterval(async () => {
    const order = await getOrder(id);
    cb(order);
  }, 5000);
  
  return () => clearInterval(interval);
}

export function subscribeToAllOrders(cb: (orders: Order[]) => void): () => void {
  if (isDemo) {
    cb(demo.demoGetOrders());
    return () => {};
  }
  
  getAllOrders().then(cb);
  
  const interval = setInterval(async () => {
    const orders = await getAllOrders();
    cb(orders);
  }, 5000);
  
  return () => clearInterval(interval);
}

export function subscribeToProducts(cb: (products: Product[]) => void): () => void {
  if (isDemo) {
    cb(demo.demoGetProducts());
    return () => {};
  }
  
  getProducts().then(cb);
  
  const interval = setInterval(async () => {
    const products = await getProducts();
    cb(products);
  }, 5000);
  
  return () => clearInterval(interval);
}

// ---------- Timestamp helper ----------
export function toMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (ts.seconds) return ts.seconds * 1000;
  // Handle ISO strings from MongoDB
  if (typeof ts === 'string') return new Date(ts).getTime();
  return 0;
}
