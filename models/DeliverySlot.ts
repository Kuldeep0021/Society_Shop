import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliverySlot extends Document {
  label: string;
  isActive: boolean;
}

const DeliverySlotSchema = new Schema<IDeliverySlot>(
  {
    label: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

DeliverySlotSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default mongoose.models.DeliverySlot || mongoose.model<IDeliverySlot>('DeliverySlot', DeliverySlotSchema);
