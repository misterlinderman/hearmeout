import mongoose, { Document, Schema } from 'mongoose';

export type IdeaCategory = 'invention' | 'business' | 'creative' | 'social' | 'research' | 'technology';
export type IdeaStage = 'concept' | 'development' | 'prototype' | 'market-ready' | 'launched';
export type IdeaStatus = 'draft' | 'pending-review' | 'active' | 'funded' | 'completed' | 'archived' | 'rejected';
export type ResourceType = 'funding' | 'expertise' | 'labor' | 'equipment' | 'partnership' | 'mentorship';

interface IResourceRequest {
  type: ResourceType;
  description: string;
  amount?: number;
  currency?: string;
  equity?: number;
  fulfilled: boolean;
}

interface IDocument {
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface IIdea extends Document {
  title: string;
  tagline: string;
  description: string;
  category: IdeaCategory;
  stage: IdeaStage;
  status: IdeaStatus;
  creator: mongoose.Types.ObjectId;
  coverImage?: string;
  images: string[];
  documents: IDocument[];
  resources: IResourceRequest[];
  tags: string[];
  viewCount: number;
  likeCount: number;
  contributionCount: number;
  likedBy: string[];
  isPublic: boolean;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const resourceRequestSchema = new Schema<IResourceRequest>(
  {
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
    equity: {
      type: Number,
      min: 0,
      max: 100,
    },
    fulfilled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ideaSchema = new Schema<IIdea>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['invention', 'business', 'creative', 'social', 'research', 'technology'],
      required: true,
    },
    stage: {
      type: String,
      enum: ['concept', 'development', 'prototype', 'market-ready', 'launched'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending-review', 'active', 'funded', 'completed', 'archived', 'rejected'],
      default: 'pending-review',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverImage: String,
    images: [String],
    documents: [documentSchema],
    resources: [resourceRequestSchema],
    tags: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    contributionCount: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: String,
    }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
ideaSchema.index({ creator: 1, status: 1 });
ideaSchema.index({ category: 1, status: 1 });
ideaSchema.index({ stage: 1, status: 1 });
ideaSchema.index({ tags: 1 });
ideaSchema.index({ createdAt: -1 });
ideaSchema.index({ likeCount: -1 });
ideaSchema.index({ title: 'text', tagline: 'text', description: 'text', tags: 'text' });

export const Idea = mongoose.model<IIdea>('Idea', ideaSchema);
export default Idea;
