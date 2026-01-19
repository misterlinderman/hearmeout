// User Types
export interface User {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  ideas: Idea[];
  contributions: Contribution[];
  badges: Badge[];
}

// Idea Types
export type IdeaCategory = 
  | 'invention'
  | 'business'
  | 'creative'
  | 'social'
  | 'research'
  | 'technology';

export type IdeaStage = 
  | 'concept'
  | 'development'
  | 'prototype'
  | 'market-ready'
  | 'launched';

export type IdeaStatus = 
  | 'draft'
  | 'pending-review'
  | 'active'
  | 'funded'
  | 'completed'
  | 'archived'
  | 'rejected';

export type ResourceType = 
  | 'funding'
  | 'expertise'
  | 'labor'
  | 'equipment'
  | 'partnership'
  | 'mentorship';

export interface ResourceRequest {
  type: ResourceType;
  description: string;
  amount?: number;
  currency?: string;
  equity?: number;
  fulfilled: boolean;
}

export interface Idea {
  _id: string;
  title: string;
  tagline: string;
  description: string;
  category: IdeaCategory;
  stage: IdeaStage;
  status: IdeaStatus;
  creator: User;
  coverImage?: string;
  images: string[];
  documents: Document[];
  resources: ResourceRequest[];
  ipFilings: IPFiling[];
  tags: string[];
  viewCount: number;
  likeCount: number;
  contributionCount: number;
  likedBy?: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaSubmission {
  title: string;
  tagline: string;
  description: string;
  category: IdeaCategory;
  stage: IdeaStage;
  resources: Omit<ResourceRequest, 'fulfilled'>[];
  tags: string[];
  isPublic: boolean;
}

// Contribution Types
export type ContributionStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface Contribution {
  _id: string;
  idea: Idea;
  contributor: User;
  type: ResourceType;
  description: string;
  amount?: number;
  currency?: string;
  equityOffered?: number;
  status: ContributionStatus;
  message: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionOffer {
  ideaId: string;
  type: ResourceType;
  description: string;
  amount?: number;
  currency?: string;
  message: string;
  terms?: string;
}

// IP Filing Types
export type IPType = 
  | 'trademark'
  | 'copyright'
  | 'patent'
  | 'nda';

export type IPStatus = 
  | 'draft'
  | 'submitted'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface IPFiling {
  _id: string;
  idea: string;
  type: IPType;
  status: IPStatus;
  applicationNumber?: string;
  filingDate?: string;
  approvalDate?: string;
  documents: Document[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Document Types
export interface Document {
  _id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// Comment Types
export interface Comment {
  _id: string;
  idea: string;
  author: User;
  content: string;
  parentComment?: string;
  replies: Comment[];
  likeCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Badge Types
export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter Types
export interface IdeaFilters {
  category?: IdeaCategory;
  stage?: IdeaStage;
  status?: IdeaStatus;
  resourceType?: ResourceType;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'funded' | 'trending';
  page?: number;
  limit?: number;
}

// Notification Types
export type NotificationType = 
  | 'contribution_received'
  | 'contribution_accepted'
  | 'contribution_rejected'
  | 'idea_approved'
  | 'idea_rejected'
  | 'comment_received'
  | 'milestone_reached';

export interface Notification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// Statistics Types
export interface UserStats {
  totalIdeas: number;
  activeIdeas: number;
  totalContributions: number;
  fundingRaised: number;
  reputation: number;
}

export interface PlatformStats {
  totalIdeas: number;
  totalUsers: number;
  totalFunding: number;
  successfulProjects: number;
}
