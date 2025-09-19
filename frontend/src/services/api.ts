import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse,
  User,
  Transaction,
  Alert,
  DashboardStats,
  TransactionFilters,
  AlertFilters,
  RuleConfig,
  VerificationAttempt,
  BehaviorProfile,
  Device,
  UserRole,
  CreateTransactionRequest
} from '../types';
import { 
  mockTransactions, 
  mockAlerts, 
  mockDashboardStats, 
  mockChartData, 
  mockRiskDistribution 
} from './mockData';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data flag - set to false to use real backend data
const USE_MOCK_DATA = false;

// Auth API
export const authAPI = {
  signup: async (email: string, password: string, firstName: string, lastName: string, role?: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/signup', { 
      email, 
      password, 
      firstName, 
      lastName, 
      role: role || 'regular' 
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  verifyMfa: async (code: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await api.post('/auth/mfa/verify', { code });
    return response.data;
  },

  setupMfa: async (): Promise<ApiResponse<{ qrCode: string; secret: string }>> => {
    const response = await api.post('/auth/mfa/setup');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// Transactions API
export const transactionsAPI = {
  getTransactions: async (filters?: TransactionFilters, page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> => {
    const params = { page, limit, ...filters };
    const response = await api.get('/transactions', { params });
    return response.data.data;
  },

  getTransaction: async (id: string): Promise<ApiResponse<Transaction>> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  getTransactionEvents: async (id: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/transactions/${id}/events`);
    return response.data;
  },

  createTransaction: async (transactionData: CreateTransactionRequest): Promise<ApiResponse<Transaction>> => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
};

// Alerts API
export const alertsAPI = {
  getAlerts: async (filters?: AlertFilters, page = 1, limit = 20): Promise<PaginatedResponse<Alert>> => {
    const params = { page, limit, ...filters };
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  getAlert: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  updateAlert: async (id: string, updates: Partial<Alert>): Promise<ApiResponse<Alert>> => {
    const response = await api.patch(`/alerts/${id}`, updates);
    return response.data;
  },

  assignAlert: async (id: string, assignee: string): Promise<ApiResponse<Alert>> => {
    const response = await api.patch(`/alerts/${id}`, { assignee });
    return response.data;
  },

  addNote: async (id: string, note: string): Promise<ApiResponse<Alert>> => {
    const response = await api.post(`/alerts/${id}/notes`, { note });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params: { page, limit } });
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/users/${id}`, updates);
    return response.data;
  },

  lockUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.post(`/users/${id}/lock`);
    return response.data;
  },

  unlockUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.post(`/users/${id}/unlock`);
    return response.data;
  },

  resetMfa: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/users/${id}/reset-mfa`);
    return response.data;
  },

  getUserDevices: async (id: string): Promise<ApiResponse<Device[]>> => {
    const response = await api.get(`/users/${id}/devices`);
    return response.data;
  },

  getUserBehavior: async (id: string): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await api.get(`/users/${id}/behavior`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getTransactionChart: async (days = 7): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/chart/transactions', { params: { days } });
    return response.data;
  },

  getRiskDistribution: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/chart/risk-distribution');
    return response.data;
  },

  getTopAlerts: async (limit = 10): Promise<ApiResponse<Alert[]>> => {
    const response = await api.get(`/alerts/top/${limit}`);
    return response.data;
  },
};

// Rules API
export const rulesAPI = {
  getRules: async (): Promise<ApiResponse<RuleConfig[]>> => {
    const response = await api.get('/rules');
    return response.data;
  },

  getRule: async (id: string): Promise<ApiResponse<RuleConfig>> => {
    const response = await api.get(`/rules/${id}`);
    return response.data;
  },

  createRule: async (rule: Omit<RuleConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<RuleConfig>> => {
    const response = await api.post('/rules', rule);
    return response.data;
  },

  updateRule: async (id: string, updates: Partial<RuleConfig>): Promise<ApiResponse<RuleConfig>> => {
    const response = await api.put(`/rules/${id}`, updates);
    return response.data;
  },

  deleteRule: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/rules/${id}`);
    return response.data;
  },

  toggleRule: async (id: string, isActive: boolean): Promise<ApiResponse<RuleConfig>> => {
    const response = await api.patch(`/rules/${id}`, { isActive });
    return response.data;
  },
};

// Verification API
export const verificationAPI = {
  startVerification: async (transactionId: string): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post('/verification/start', { transactionId });
    return response.data;
  },

  submitVerification: async (attemptId: string, data: any): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/submit`, data);
    return response.data;
  },

  getVerificationStatus: async (attemptId: string): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.get(`/verification/${attemptId}/status`);
    return response.data;
  },

  getVerificationHistory: async (userId: string): Promise<ApiResponse<VerificationAttempt[]>> => {
    const response = await api.get(`/users/${userId}/verifications`);
    return response.data;
  },
};

export default api; 