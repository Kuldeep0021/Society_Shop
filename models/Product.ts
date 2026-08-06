import mongoose, { Schema, Document } from 'mongoose';
import { Category, CATEGORIES } from '@/lib/types';

export interface IProduct extends Document {
  name: string;
  category: Category;
  price: number;
  unit: string;
  imageUrl: string;
  inStock: boolean;
  stockCount: number;
  description?: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    imageUrl: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 0 },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Format id to use string representation of _id
ProductSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
