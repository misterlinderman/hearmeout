import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  name: string;
  picture?: string;
  bio?: string;
  location?: string;
  website?: string;
  expertise: string[];
  role: 'user' | 'moderator' | 'admin';
  reputation: number;
  ideasCount: number;
  contributionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      maxlength: 100,
    },
    website: {
      type: String,
    },
    expertise: [{
      type: String,
      trim: true,
    }],
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    reputation: {
      type: Number,
      default: 0,
    },
    ideasCount: {
      type: Number,
      default: 0,
    },
    contributionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ name: 'text', bio: 'text' });

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
