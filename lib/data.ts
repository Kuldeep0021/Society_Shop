// Unified data access layer.
// When Firebase is configured (env vars present), operations go to Firestore.
// Otherwise they fall back to the in-browser demo store (lib/store.ts).
//
// Firestore collections used:
//   products/{productId}
//   orders/{orderId}
//   carts/{userId}
//   deliverySlots/{slotId}
//   users/{userId}

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  DeliverySlot,
} from './types';
import * as demo from './store';
import { sampleProducts, sampleSlots } from '@/data/sampleProducts';

function notConfigured() {
  return !isFirebaseConfigured || !db;
}

// ---------- Products ----------
export async function getProducts(): Promise<Product[]> {
  if (notConfigured()) return demo.demoGetProducts();
  const snap = await getDocs(collection(db!, 'products'));
  if (snap.empty) {
    // Seed Firestore with sample products on first run.
    await Promise.all(
      sampleProducts.map((p) => setDoc(doc(db!, 'products', p.id), p)),
    );
    return sampleProducts;
  }
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
}

export async function getProduct(id: string): Promise<Product | null> {
  if (notConfigured()) return demo.demoGetProduct(id) || null;
  const snap = await getDoc(doc(db!, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
}

export async function saveProduct(product: Product) {
  if (notConfigured()) {
    demo.demoSaveProduct(product);
    return;
  }
  await setDoc(doc(db!, 'products', product.id), product, { merge: true });
}

export async function deleteProduct(id: string) {
  if (notConfigured()) {
    demo.demoDeleteProduct(id);
    return;
  }
  await deleteDoc(doc(db!, 'products', id));
}

// ---------- Image upload (Firebase Storage) ----------
export async function uploadProductImage(
  file: File,
  productId: string,
): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    // Demo mode: return a placeholder URL.
    return sampleProducts[0].imageUrl;
  }
  const fileRef = ref(storage, `products/${productId}/${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

// ---------- Delivery Slots ----------
export async function getSlots(): Promise<DeliverySlot[]> {
  if (notConfigured()) return demo.demoGetSlots();
  const snap = await getDocs(collection(db!, 'deliverySlots'));
  if (snap.empty) {
    await Promise.all(
      sampleSlots.map((s) => setDoc(doc(db!, 'deliverySlots', s.id), s)),
    );
    return sampleSlots;
  }
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DeliverySlot, 'id'>) }));
}

export async function saveSlot(slot: DeliverySlot) {
  if (notConfigured()) {
    demo.demoSaveSlot(slot);
    return;
  }
  await setDoc(doc(db!, 'deliverySlots', slot.id), slot, { merge: true });
}

export async function deleteSlot(id: string) {
  if (notConfigured()) {
    demo.demoDeleteSlot(id);
    return;
  }
  await deleteDoc(doc(db!, 'deliverySlots', id));
}

// ---------- Cart ----------
export async function getCart(userId: string): Promise<CartItem[]> {
  if (notConfigured()) return demo.demoGetCart();
  const snap = await getDoc(doc(db!, 'carts', userId));
  if (!snap.exists()) return [];
  return (snap.data().items as CartItem[]) || [];
}

export async function saveCart(userId: string, items: CartItem[]) {
  if (notConfigured()) {
    demo.demoSaveCart(items);
    return;
  }
  await setDoc(doc(db!, 'carts', userId), { items });
}

export async function clearCart(userId: string) {
  if (notConfigured()) {
    demo.demoClearCart();
    return;
  }
  await setDoc(doc(db!, 'carts', userId), { items: [] });
}

// ---------- Orders ----------
export async function createOrder(order: Order): Promise<string> {
  if (notConfigured()) {
    demo.demoCreateOrder(order);
    return order.id;
  }
  const { id: _id, ...data } = order;
  void _id;
  const ref = await addDoc(collection(db!, 'orders'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (notConfigured()) return demo.demoGetOrder(id) || null;
  const snap = await getDoc(doc(db!, 'orders', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (notConfigured()) return demo.demoGetUserOrders(userId);
  const q = query(
    collection(db!, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
}

export async function getAllOrders(): Promise<Order[]> {
  if (notConfigured()) return demo.demoGetOrders();
  const q = query(collection(db!, 'orders'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (notConfigured()) {
    demo.demoUpdateOrderStatus(id, status);
    return;
  }
  await updateDoc(doc(db!, 'orders', id), {
    status,
    statusHistory: [...(await getOrder(id))?.statusHistory || [], { status, timestamp: Date.now() }],
    paymentStatus: status === 'delivered' ? 'paid' : (await getOrder(id))?.paymentStatus,
  });
}

// ---------- Real-time order subscription ----------
export function subscribeToOrder(
  id: string,
  cb: (order: Order | null) => void,
): () => void {
  if (notConfigured()) {
    cb(demo.demoGetOrder(id) || null);
    // No real-time in demo mode; return no-op unsubscribe.
    return () => {};
  }
  return onSnapshot(doc(db!, 'orders', id), (snap) => {
    if (!snap.exists()) cb(null);
    else cb({ id: snap.id, ...(snap.data() as Omit<Order, 'id'>) });
  });
}

export function subscribeToAllOrders(cb: (orders: Order[]) => void): () => void {
  if (notConfigured()) {
    cb(demo.demoGetOrders());
    return () => {};
  }
  const q = query(collection(db!, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) })));
  });
}

export function subscribeToProducts(cb: (products: Product[]) => void): () => void {
  if (notConfigured()) {
    cb(demo.demoGetProducts());
    return () => {};
  }
  return onSnapshot(collection(db!, 'products'), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) })));
  });
}

// ---------- Timestamp helper ----------
export function toMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === 'number') return ts;
  if (ts instanceof Timestamp) return ts.toMillis();
  if (ts.seconds) return ts.seconds * 1000;
  return 0;
}
