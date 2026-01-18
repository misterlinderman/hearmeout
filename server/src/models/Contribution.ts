import mongoose, { Document, Schema } from 'mongoose';
import { ResourceType } from './Idea';

export type ContributionStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface IContribution extends Document {
  idea: mongoose.Types.ObjectId;
  contributor: mongoose.Types.ObjectId;
  type: ResourceType;
  description: string;
  amount?: number;
  currency?: string;
  equityOffered?: number;
  status: ContributionStatus;
  message: string;
  terms?: string;
  responseMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contributionSchema = new Schema<IContribution>(
  {
    idea: {
      type: Schema.Types.ObjectId,
      ref: 'Idea',
      required: true,
    },
    contributor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['funding', 'expertise', 'labor', 'equipment', 'partnership', 'mentorship'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: Number,
    currency: {
      type: String,
      default: '$',
    },
    equityOffered: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    message: {
      type: String,
      required: true,
    },
    terms: String,
    responseMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
contributionSchema.index({ idea: 1, status: 1 });
contributionSchema.index({ contributor: 1, status: 1 });
contributionSchema.index({ createdAt: -1 });

// Prevent duplicate pending contributions
contributionSchema.index(
  { idea: 1, contributor: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

export const Contribution = mongoose.model<IContribution>('Contribution', contributionSchema);
export default Contribution;
