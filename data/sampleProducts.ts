import { Product, DeliverySlot } from '../lib/types';

// Sample products used to seed Firestore (if empty) and as a demo fallback
// so the app works without a database. Images use Pexels stock photo URLs.
export const sampleProducts: Product[] = [
  {
    id: 'p-amul-butter',
    name: 'Amul Salted Butter',
    category: 'Dairy',
    price: 56,
    unit: '500 g',
    imageUrl:
      'https://images.pexels.com/photos/2460495/pexels-photo-2460495.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 20,
    description:
      'Pasteurised salted butter from Amul. Smooth and creamy, perfect for spreading, cooking, or baking.',
  },
  {
    id: 'p-amul-milk',
    name: 'Amul Toned Milk',
    category: 'Dairy',
    price: 28,
    unit: '1 L',
    imageUrl:
      'https://images.pexels.com/photos/2460495/pexels-photo-2460495.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 40,
    description: 'Fresh toned milk, pasteurised and homogenised. 1 litre pouch.',
  },
  {
    id: 's-basmati-rice',
    name: 'India Gate Basmati Rice',
    category: 'Grains',
    price: 120,
    unit: '1 kg',
    imageUrl:
      'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 15,
    description:
      'Premium long-grain aged basmati rice. Ideal for biryani and pulao. 1 kg pack.',
  },
  {
    id: 'g-wheat-flour',
    name: 'Aashirvaad Wheat Flour',
    category: 'Grains',
    price: 65,
    unit: '1 kg',
    imageUrl:
      'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 25,
    description: 'Whole wheat atta for soft rotis. Stone-ground and hygienically packed.',
  },
  {
    id: 'n-mixture',
    name: 'Haldiram Bhujia',
    category: 'Snacks',
    price: 35,
    unit: '200 g',
    imageUrl:
      'https://images.pexels.com/photos/1312530/pexels-photo-1312530.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 30,
    description: 'Crispy and spicy bhujia namkeen. 200 g pack.',
  },
  {
    id: 'n-chips',
    name: 'Lay\'s Classic Salted',
    category: 'Snacks',
    price: 20,
    unit: '52 g',
    imageUrl:
      'https://images.pexels.com/photos/1312530/pexels-photo-1312530.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 50,
    description: 'Classic salted potato chips. Crispy and light.',
  },
  {
    id: 'h-detergent',
    name: 'Surf Excel Detergent',
    category: 'Household',
    price: 85,
    unit: '1 kg',
    imageUrl:
      'https://images.pexels.com/photos/5650041/pexels-photo-5650041.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 12,
    description: 'Powerful stain removal detergent powder. 1 kg pack.',
  },
  {
    id: 'h-soap',
    name: 'Dettol Bath Soap',
    category: 'Household',
    price: 30,
    unit: '75 g x 3',
    imageUrl:
      'https://images.pexels.com/photos/5650041/pexels-photo-5650041.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 24,
    description: 'Antibacterial bathing soap. Pack of 3 bars.',
  },
  {
    id: 'b-coca-cola',
    name: 'Coca-Cola',
    category: 'Beverages',
    price: 40,
    unit: '750 ml',
    imageUrl:
      'https://images.pexels.com/photos/1292294/pexels-photo-1292294.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 18,
    description: 'Chilled refreshing cola drink. 750 ml bottle.',
  },
  {
    id: 'b-tea',
    name: 'Tata Tea Premium',
    category: 'Beverages',
    price: 95,
    unit: '500 g',
    imageUrl:
      'https://images.pexels.com/photos/1292294/pexels-photo-1292294.jpeg?auto=compress&cs=tinysrgb&w=800',
    inStock: true,
    stockCount: 16,
    description: 'Premium quality black tea leaves. Strong and refreshing.',
  },
];

export const sampleSlots: DeliverySlot[] = [
  { id: 'slot-30min', label: 'Within 30 mins', isActive: true },
  { id: 'slot-evening', label: 'Evening (5-7 PM)', isActive: true },
  { id: 'slot-tomorrow', label: 'Tomorrow Morning', isActive: true },
];

export const TOWERS = ['A', 'B', 'C', 'D'] as const;
