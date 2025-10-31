import mongoose, { Schema, Document, Model } from 'mongoose';

export type RewardType = 'percent_off' | 'free_delivery' | 'fixed_amount';
export type TriggerType = 'nth_order' | 'nth_refill';

export interface LoyaltyRule {
  id: string;
  name?: string;
  triggerType: TriggerType;
  nth: number; // e.g. 2 => second refill
  rewardType: RewardType;
  value?: number; // percent (for percent_off) or amount for fixed_amount
  active?: boolean;
}

export interface LoyaltyDocument extends Document {
  supplierId: string;
  rules: LoyaltyRule[];
  // points divisor: e.g., 10 means 1 point per 10 currency units
  pointsDivisor?: number;
  // tiers: ascending by minPoints
  tiers?: Array<{ id: string; name?: string; minPoints: number; benefitType: RewardType; benefitValue?: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String },
    triggerType: { type: String, enum: ['nth_order', 'nth_refill'], required: true },
    nth: { type: Number, required: true },
    rewardType: { type: String, enum: ['percent_off', 'free_delivery', 'fixed_amount'], required: true },
    value: { type: Number },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const LoyaltySchema = new Schema<LoyaltyDocument>(
  {
    supplierId: { type: String, required: true, index: true, unique: true },
    rules: { type: [RewardSchema], default: [] },
    pointsDivisor: { type: Number, default: 10 },
    tiers: { type: [{ id: String, name: String, minPoints: Number, benefitType: String, benefitValue: Number }], default: [] },
  },
  { timestamps: true }
);

export const Loyalty: Model<LoyaltyDocument> = mongoose.models.Loyalty || mongoose.model<LoyaltyDocument>('Loyalty', LoyaltySchema);

export default Loyalty;
