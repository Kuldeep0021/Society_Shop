import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional because Google OAuth users won't have a password
  role: 'customer' | 'admin';
  phone?: string;
  image?: string; // For Google profile picture
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
