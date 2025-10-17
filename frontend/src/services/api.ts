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
  CreateTransactionRequest,
  UserFilters,
  VerificationMethod,
  VerificationResult
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
  getTransactions: async (filters?: TransactionFilters, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    const params = { page, limit, ...filters };
    const response = await api.get('/transactions', { params });
    return response.data;
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

  clearAllTransactions: async (): Promise<ApiResponse<{
    clearedCount: number;
    message: string;
  }>> => {
    const response = await api.delete('/transactions/clear-all');
    return response.data;
  },
};

// Alerts API
export const alertsAPI = {
  getAlerts: async (filters?: AlertFilters, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Alert>>> => {
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
  getUsers: async (page = 1, limit = 20, filters?: UserFilters): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const params = { page, limit, ...filters };
    const response = await api.get('/users', { params });
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
    const response = await api.get(`/dashboard/top-alerts?limit=${limit}`);
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

// Enhanced Verification API with Multiple Verification Methods
export const verificationAPI = {
  // Basic verification methods
  startVerification: async (transactionId: string, requiredMethods?: VerificationMethod[]): Promise<ApiResponse<{
    attemptId: string;
    requiredMethods: VerificationMethod[];
    expiresAt: string;
    instructions: string;
  }>> => {
    const response = await api.post('/verification/start', { transactionId, requiredMethods });
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

  getVerificationHistory: async (userId: string, page = 1, limit = 10, filters?: { method?: VerificationMethod, result?: VerificationResult }): Promise<ApiResponse<PaginatedResponse<VerificationAttempt>>> => {
    const params = { page, limit, ...filters };
    const response = await api.get(`/verification/users/${userId}/verifications`, { params });
    return response.data;
  },

  // Enhanced verification methods for suspicious transactions
  requestReVerification: async (transactionId: string, reason: string, riskLevel: 'low' | 'medium' | 'high' | 'critical'): Promise<ApiResponse<{
    attemptId: string;
    requiredMethods: VerificationMethod[];
    expiresAt: string;
    riskLevel: string;
  }>> => {
    const response = await api.post('/verification/request-reverification', { transactionId, reason, riskLevel });
    return response.data;
  },

  // Biometric verification methods
  submitBiometricVerification: async (attemptId: string, biometricData: {
    type: 'fingerprint' | 'face' | 'voice';
    data: string;
    confidence?: number;
  }): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/biometric`, biometricData);
    return response.data;
  },

  // Document verification
  submitDocumentVerification: async (attemptId: string, documentData: {
    type: 'id_scan' | 'document_scan';
    documentImage: string;
    documentType: string;
    extractedData?: any;
  }): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/document`, documentData);
    return response.data;
  },

  // SMS/Email verification
  sendSMSVerification: async (attemptId: string, phoneNumber: string): Promise<ApiResponse<{
    messageId: string;
    expiresAt: string;
  }>> => {
    const response = await api.post(`/verification/${attemptId}/sms`, { phoneNumber });
    return response.data;
  },

  sendEmailVerification: async (attemptId: string, email: string): Promise<ApiResponse<{
    messageId: string;
    expiresAt: string;
  }>> => {
    const response = await api.post(`/verification/${attemptId}/email`, { email });
    return response.data;
  },

  verifySMSCode: async (attemptId: string, code: string): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/verify-sms`, { code });
    return response.data;
  },

  verifyEmailCode: async (attemptId: string, code: string): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/verify-email`, { code });
    return response.data;
  },

  // Security questions verification
  getSecurityQuestions: async (attemptId: string): Promise<ApiResponse<Array<{
    id: string;
    question: string;
    type: 'multiple_choice' | 'text';
    options?: string[];
  }>>> => {
    const response = await api.get(`/verification/${attemptId}/security-questions`);
    return response.data;
  },

  submitSecurityAnswers: async (attemptId: string, answers: Array<{
    questionId: string;
    answer: string;
  }>): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/security-answers`, { answers });
    return response.data;
  },

  // PIN verification
  verifyPIN: async (attemptId: string, pin: string): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/pin`, { pin });
    return response.data;
  },

  // OTP verification
  generateOTP: async (attemptId: string, method: 'sms' | 'email' | 'app'): Promise<ApiResponse<{
    otpId: string;
    expiresAt: string;
    maskedDestination: string;
  }>> => {
    const response = await api.post(`/verification/${attemptId}/otp`, { method });
    return response.data;
  },

  verifyOTP: async (attemptId: string, otp: string, otpId: string): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/verify-otp`, { otp, otpId });
    return response.data;
  },

  // Voice verification
  submitVoiceVerification: async (attemptId: string, voiceData: {
    audioBlob: string;
    duration: number;
    language?: string;
  }): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/voice`, voiceData);
    return response.data;
  },

  // Liveness detection
  submitLivenessCheck: async (attemptId: string, livenessData: {
    videoBlob: string;
    challengeType: string;
    response: any;
  }): Promise<ApiResponse<VerificationAttempt>> => {
    const response = await api.post(`/verification/${attemptId}/liveness`, livenessData);
    return response.data;
  },

  // Multi-factor verification orchestration
  getRequiredVerificationMethods: async (transactionId: string, riskScore: number): Promise<ApiResponse<{
    methods: VerificationMethod[];
    priority: number[];
    timeout: number;
  }>> => {
    const response = await api.get(`/verification/required-methods`, { 
      params: { transactionId, riskScore } 
    });
    return response.data;
  },

  // Verification status and progress
  getVerificationProgress: async (attemptId: string): Promise<ApiResponse<{
    completedMethods: VerificationMethod[];
    remainingMethods: VerificationMethod[];
    progress: number;
    canProceed: boolean;
  }>> => {
    const response = await api.get(`/verification/${attemptId}/progress`);
    return response.data;
  },

  // Cancel verification
  cancelVerification: async (attemptId: string, reason?: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/verification/${attemptId}/cancel`, { reason });
    return response.data;
  },

  // Get available verification methods for user
  getAvailableMethods: async (userId: string): Promise<ApiResponse<{
    available: VerificationMethod[];
    preferred: VerificationMethod[];
    setupRequired: VerificationMethod[];
  }>> => {
    const response = await api.get(`/verification/users/${userId}/available-methods`);
    return response.data;
  },

  // Setup verification method
  setupVerificationMethod: async (userId: string, method: VerificationMethod, setupData: any): Promise<ApiResponse<{
    setupId: string;
    instructions: string;
    expiresAt: string;
  }>> => {
    const response = await api.post(`/verification/users/${userId}/setup/${method}`, setupData);
    return response.data;
  },

  // Get verification methods
  getVerificationMethods: async (): Promise<ApiResponse<VerificationMethod[]>> => {
    const response = await api.get('/verification/methods');
    return response.data;
  },
};

// Behavioral Analysis API
export const behavioralAnalysisAPI = {
  getUserBehaviorProfile: async (userId: string): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await api.get(`/behavioral-analysis/users/${userId}/profile`);
    return response.data;
  },

  analyzeTransactionBehavior: async (transactionId: string): Promise<ApiResponse<{
    isAnomalous: boolean;
    confidence: number;
    factors: string[];
    riskScore: number;
  }>> => {
    const response = await api.post('/behavioral-analysis/analyze', { transactionId });
    return response.data;
  },

  updateBehaviorProfile: async (userId: string, transactionData: any): Promise<ApiResponse<BehaviorProfile>> => {
    const response = await api.post(`/behavioral-analysis/users/${userId}/update`, transactionData);
    return response.data;
  },

  getBehavioralInsights: async (userId: string, timeframe?: string): Promise<ApiResponse<{
    spendingPatterns: any;
    timePatterns: any;
    locationPatterns: any;
    merchantPatterns: any;
  }>> => {
    const params = timeframe ? { timeframe } : {};
    const response = await api.get(`/behavioral-analysis/users/${userId}/insights`, { params });
    return response.data;
  },

  detectAnomalies: async (userId: string, transactionData: any): Promise<ApiResponse<{
    anomalies: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      confidence: number;
    }>;
    overallRisk: number;
  }>> => {
    const response = await api.post(`/behavioral-analysis/users/${userId}/detect-anomalies`, transactionData);
    return response.data;
  },
};

// Location Security API
export const locationSecurityAPI = {
  validateLocation: async (userId: string, location: any): Promise<ApiResponse<{
    isTrusted: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    distanceFromLastTransaction?: number;
    timeSinceLastTransaction?: number;
  }>> => {
    const response = await api.post('/location-security/validate', { userId, location });
    return response.data;
  },

  getUserLocationHistory: async (userId: string, days = 30): Promise<ApiResponse<Array<{
    location: any;
    timestamp: string;
    transactionId?: string;
    riskScore: number;
  }>>> => {
    const response = await api.get(`/location-security/users/${userId}/history`, { params: { days } });
    return response.data;
  },

  setLocationTrust: async (userId: string, location: any, isTrusted: boolean): Promise<ApiResponse<void>> => {
    const response = await api.post('/location-security/trust', { userId, location, isTrusted });
    return response.data;
  },

  getGeofencingRules: async (userId: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    center: any;
    radius: number;
    isActive: boolean;
    allowedHours?: Array<{ start: number; end: number }>;
  }>>> => {
    const response = await api.get(`/location-security/users/${userId}/geofencing`);
    return response.data;
  },

  createGeofencingRule: async (userId: string, rule: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/location-security/users/${userId}/geofencing`, rule);
    return response.data;
  },
};

// Security Evaluation API
export const securityEvaluationAPI = {
  getSecurityMetrics: async (timeframe?: string): Promise<ApiResponse<{
    fraudPreventionRate: number;
    falsePositiveRate: number;
    truePositiveRate: number;
    systemAccuracy: number;
    behavioralAnalysisEffectiveness: number;
    locationDetectionAccuracy: number;
    verificationSuccessRate: number;
    averageResponseTime: number;
  }>> => {
    const params = timeframe ? { timeframe } : {};
    const response = await api.get('/security-evaluation/metrics', { params });
    return response.data;
  },

  getSecurityReport: async (startDate: string, endDate: string): Promise<ApiResponse<{
    summary: any;
    behavioralAnalysis: any;
    locationSecurity: any;
    verificationEffectiveness: any;
    recommendations: string[];
  }>> => {
    const response = await api.get('/security-evaluation/report', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  runSecurityTest: async (testType: 'behavioral' | 'location' | 'verification' | 'full'): Promise<ApiResponse<{
    testId: string;
    status: 'running' | 'completed' | 'failed';
    results?: any;
  }>> => {
    const response = await api.post('/security-evaluation/test', { testType });
    return response.data;
  },

  getTestResults: async (testId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/security-evaluation/test/${testId}/results`);
    return response.data;
  },
};

export default api; 