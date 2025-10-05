import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'customer' | 'supplier' | 'agent' | 'admin';

export interface UserDocument extends Document {
  role: UserRole;
  fullName?: string;
  businessName?: string;
  contactPersonName?: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  deliveryAddress?: {
    addressLine?: string;
    city?: string;
    postalCode?: string;
  };
  businessAddress?: string;
  businessRegistrationNumber?: string;
  vehicleType?: string;
  vehicleRegistrationNumber?: string;
  nationalIdOrLicense?: string;
  baseArea?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryAddressSchema = new Schema(
  {
    addressLine: { type: String },
    city: { type: String },
    postalCode: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    role: { type: String, enum: ['customer', 'supplier', 'agent', 'admin'], required: true },
    fullName: { type: String },
    businessName: { type: String },
    contactPersonName: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String, required: true },
    passwordHash: { type: String, required: true },
    deliveryAddress: { type: DeliveryAddressSchema },
    businessAddress: { type: String },
    businessRegistrationNumber: { type: String },
    vehicleType: { type: String },
    vehicleRegistrationNumber: { type: String },
    nationalIdOrLicense: { type: String },
    baseArea: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
