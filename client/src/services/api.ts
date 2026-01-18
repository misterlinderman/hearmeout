import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Idea,
  IdeaSubmission,
  IdeaFilters,
  Contribution,
  ContributionOffer,
  Comment,
  IPFiling,
  Notification,
  ApiResponse,
  PaginatedResponse,
  UserStats,
  PlatformStats,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized access');
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // ============ Health ============
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // ============ Users ============
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateUser(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put('/users/me', data);
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async getUserStats(id: string): Promise<ApiResponse<UserStats>> {
    const response = await this.client.get(`/users/${id}/stats`);
    return response.data;
  }

  async getUserByAuth0Id(auth0Id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get(`/users/auth0/${auth0Id}`);
    return response.data;
  }

  // ============ Ideas ============
  async getIdeas(filters?: IdeaFilters): Promise<PaginatedResponse<Idea>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const response = await this.client.get(`/ideas?${params.toString()}`);
    return response.data;
  }

  async getIdeaById(id: string): Promise<ApiResponse<Idea>> {
    const response = await this.client.get(`/ideas/${id}`);
    return response.data;
  }

  async createIdea(idea: IdeaSubmission): Promise<ApiResponse<Idea>> {
    const response = await this.client.post('/ideas', idea);
    return response.data;
  }

  async updateIdea(id: string, idea: Partial<IdeaSubmission>): Promise<ApiResponse<Idea>> {
    const response = await this.client.put(`/ideas/${id}`, idea);
    return response.data;
  }

  async deleteIdea(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/ideas/${id}`);
    return response.data;
  }

  async likeIdea(id: string): Promise<ApiResponse<{ liked: boolean }>> {
    const response = await this.client.post(`/ideas/${id}/like`);
    return response.data;
  }

  async getMyIdeas(): Promise<ApiResponse<Idea[]>> {
    const response = await this.client.get('/ideas/my-ideas');
    return response.data;
  }

  async getTrendingIdeas(): Promise<ApiResponse<Idea[]>> {
    const response = await this.client.get('/ideas/trending');
    return response.data;
  }

  async getFeaturedIdeas(): Promise<ApiResponse<Idea[]>> {
    const response = await this.client.get('/ideas/featured');
    return response.data;
  }

  // ============ Contributions ============
  async getContributionsForIdea(ideaId: string): Promise<ApiResponse<Contribution[]>> {
    const response = await this.client.get(`/ideas/${ideaId}/contributions`);
    return response.data;
  }

  async createContribution(contribution: ContributionOffer): Promise<ApiResponse<Contribution>> {
    const response = await this.client.post('/contributions', contribution);
    return response.data;
  }

  async getMyContributions(): Promise<ApiResponse<Contribution[]>> {
    const response = await this.client.get('/contributions/my-contributions');
    return response.data;
  }

  async getReceivedContributions(): Promise<ApiResponse<Contribution[]>> {
    const response = await this.client.get('/contributions/received');
    return response.data;
  }

  async updateContributionStatus(
    id: string, 
    status: 'accepted' | 'rejected'
  ): Promise<ApiResponse<Contribution>> {
    const response = await this.client.put(`/contributions/${id}/status`, { status });
    return response.data;
  }

  // ============ Comments ============
  async getCommentsForIdea(ideaId: string): Promise<ApiResponse<Comment[]>> {
    const response = await this.client.get(`/ideas/${ideaId}/comments`);
    return response.data;
  }

  async createComment(ideaId: string, content: string, parentId?: string): Promise<ApiResponse<Comment>> {
    const response = await this.client.post(`/ideas/${ideaId}/comments`, { 
      content, 
      parentComment: parentId 
    });
    return response.data;
  }

  async updateComment(id: string, content: string): Promise<ApiResponse<Comment>> {
    const response = await this.client.put(`/comments/${id}`, { content });
    return response.data;
  }

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/comments/${id}`);
    return response.data;
  }

  // ============ IP Filings ============
  async getIPFilingsForIdea(ideaId: string): Promise<ApiResponse<IPFiling[]>> {
    const response = await this.client.get(`/ideas/${ideaId}/ip-filings`);
    return response.data;
  }

  async createIPFiling(ideaId: string, filing: Partial<IPFiling>): Promise<ApiResponse<IPFiling>> {
    const response = await this.client.post(`/ideas/${ideaId}/ip-filings`, filing);
    return response.data;
  }

  async updateIPFiling(id: string, filing: Partial<IPFiling>): Promise<ApiResponse<IPFiling>> {
    const response = await this.client.put(`/ip-filings/${id}`, filing);
    return response.data;
  }

  // ============ Notifications ============
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.put(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    const response = await this.client.put('/notifications/read-all');
    return response.data;
  }

  // ============ Admin/Moderation ============
  async getPendingIdeas(): Promise<PaginatedResponse<Idea>> {
    const response = await this.client.get('/admin/ideas/pending');
    return response.data;
  }

  async approveIdea(id: string): Promise<ApiResponse<Idea>> {
    const response = await this.client.put(`/admin/ideas/${id}/approve`);
    return response.data;
  }

  async rejectIdea(id: string, reason: string): Promise<ApiResponse<Idea>> {
    const response = await this.client.put(`/admin/ideas/${id}/reject`, { reason });
    return response.data;
  }

  async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  // ============ Search ============
  async searchIdeas(query: string): Promise<PaginatedResponse<Idea>> {
    const response = await this.client.get(`/search/ideas?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async searchUsers(query: string): Promise<PaginatedResponse<User>> {
    const response = await this.client.get(`/search/users?q=${encodeURIComponent(query)}`);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
