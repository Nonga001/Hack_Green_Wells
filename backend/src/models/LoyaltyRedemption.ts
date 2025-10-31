import mongoose, { Schema, Document, Model } from 'mongoose';

export type RedemptionStatus = 'pending' | 'approved' | 'rejected';

export interface LoyaltyRedemptionDocument extends Document {
  supplierId: string;
  customerId: string;
  orderId?: string;
  ruleId: string;
  status: RedemptionStatus;
  eligible: boolean;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date | null;
  processedBy?: string | null;
}

const LoyaltyRedemptionSchema = new Schema<LoyaltyRedemptionDocument>(
  {
    supplierId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    orderId: { type: String },
    ruleId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    eligible: { type: Boolean, default: false },
    processedAt: { type: Date },
    processedBy: { type: String },
  },
  { timestamps: true }
);

export const LoyaltyRedemption: Model<LoyaltyRedemptionDocument> = mongoose.models.LoyaltyRedemption || mongoose.model<LoyaltyRedemptionDocument>('LoyaltyRedemption', LoyaltyRedemptionSchema);

export default LoyaltyRedemption;
