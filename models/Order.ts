import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus, PaymentMethod, PaymentStatus, ORDER_STATUSES } from '@/lib/types';

export interface IOrder extends Document {
  userId: string;
  items: any[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: {
    tower: string;
    flatNumber: string;
  };
  deliverySlot: string;
  statusHistory: { status: OrderStatus; timestamp: number }[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  customerPhone?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    items: [{ type: Schema.Types.Mixed, required: true }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    deliveryAddress: {
      tower: { type: String, required: true },
      flatNumber: { type: String, required: true },
    },
    deliverySlot: { type: String, required: true },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        timestamp: { type: Number },
      },
    ],
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    customerPhone: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
OrderSchema.virtual('createdAt').get(function () {
  return new Date(this.get('createdAt')).getTime();
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
