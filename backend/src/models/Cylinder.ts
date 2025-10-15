import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CylinderDocument extends Document {
  supplierId: string;
  cylId: string;
  size: string;
  brand: string;
  price?: number;
  refillPrice?: number;
  manufactureDate?: string;
  condition?: 'New' | 'Used' | 'Damaged';
  status: 'Available' | 'In Transit' | 'Delivered' | 'Lost' | 'Damaged';
  owner: string; // Supplier / Agent / Customer
  locationText?: string;
  coords?: { lat: number; lon: number } | null;
  createdAt: Date;
  updatedAt: Date;
}

const CoordsSchema = new Schema(
  {
    lat: { type: Number },
    lon: { type: Number },
  },
  { _id: false }
);

const CylinderSchema = new Schema<CylinderDocument>(
  {
    supplierId: { type: String, index: true, required: true },
    cylId: { type: String, required: true },
    size: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number },
    refillPrice: { type: Number },
    manufactureDate: { type: String },
    condition: { type: String, enum: ['New', 'Used', 'Damaged'], default: 'New' },
    status: { type: String, enum: ['Available', 'Booked', 'In Transit', 'Delivered', 'Lost', 'Damaged'], default: 'Available' },
    owner: { type: String, default: 'Supplier' },
    locationText: { type: String },
    coords: { type: CoordsSchema, default: null },
  },
  { timestamps: true }
);

CylinderSchema.index({ supplierId: 1, cylId: 1 }, { unique: true });

export const Cylinder: Model<CylinderDocument> =
  mongoose.models.Cylinder || mongoose.model<CylinderDocument>('Cylinder', CylinderSchema);


