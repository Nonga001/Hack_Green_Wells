import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus = 'Pending' | 'Approved' | 'Rejected' | 'Assigned' | 'In Transit' | 'At Supplier' | 'Delivered';

export interface OrderDocument extends Document {
  customerId: string;
  supplierId: string;
  cylinder: { id?: string; size: string; brand: string; price?: number };
  delivery: { date: string; time?: string; distanceKm?: number; fee?: number };
  type?: 'order' | 'refill';
  total: number;
  notes?: string;
  status: OrderStatus;
  assignedAgentId?: string;
  otpHash?: string;
  otpExpiresAt?: Date | null;
  pickupAt?: Date | null;
  pickupCoords?: { lat: number; lon: number } | null;
  deliveredAt?: Date | null;
  refilledAt?: Date | null;
  deliveryCoords?: { lat: number; lon: number } | null;
  events?: Array<{ type: string; by?: string; at: Date; meta?: any }>;
  createdAt: Date;
  updatedAt: Date;
}

const CylinderInfo = new Schema({
  id: { type: String },
  size: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number },
}, { _id: false });

const DeliveryInfo = new Schema({
  date: { type: String, required: true },
  time: { type: String },
  distanceKm: { type: Number },
  fee: { type: Number },
}, { _id: false });

const EventSchema = new Schema({
  type: { type: String },
  by: { type: String },
  at: { type: Date },
  meta: { type: Schema.Types.Mixed },
}, { _id: false });

const OrderSchema = new Schema<OrderDocument>({
  customerId: { type: String, required: true, index: true },
  supplierId: { type: String, required: true, index: true },
  cylinder: { type: CylinderInfo, required: true },
  delivery: { type: DeliveryInfo, required: true },
  type: { type: String, enum: ['order', 'refill'], default: 'order', index: true },
  total: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Assigned', 'In Transit', 'At Supplier', 'Delivered'], default: 'Pending', index: true },
  assignedAgentId: { type: String },
  otpHash: { type: String },
  otpExpiresAt: { type: Date },
  pickupAt: { type: Date },
  pickupCoords: { type: new Schema({ lat: Number, lon: Number }, { _id: false }) },
  deliveredAt: { type: Date },
  refilledAt: { type: Date },
  deliveryCoords: { type: new Schema({ lat: Number, lon: Number }, { _id: false }) },
  events: { type: [EventSchema], default: [] },
}, { timestamps: true });

export const Order: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);


