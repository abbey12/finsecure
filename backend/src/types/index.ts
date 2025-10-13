// User Types
export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  REGULAR = 'regular'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  mfaEnabled: boolean;
  lastLogin: string;
  createdAt: string;
  status: UserStatus;
  password?: string; // Only for internal use
}

// Transaction Types
export enum TransactionChannel {
  MOBILE_APP = 'mobile_app',
  WEB = 'web',
  API = 'api',
  ATM = 'atm',
  POS = 'pos'
}

export enum TransactionDecision {
  ALLOW = 'allow',
  CHALLENGE = 'challenge',
  DENY = 'deny'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum LocationSource {
  GPS = 'gps',
  IP = 'ip',
  MANUAL = 'manual'
}

export interface Location {
  latitude: number;
  longitude: number;
  source: LocationSource;
  country: string;
  city: string;
  region: string;
}

export interface Transaction {
  id: string;
  userId: string;
  deviceId: string;
  amount: number;
  currency: string;
  merchant?: string;
  payee?: string;
  timestamp: string;
  channel: TransactionChannel;
  ipAddress?: string;
  location?: Location;
  decision: TransactionDecision;
  riskScore: number;
  reasons: string[];
  status: TransactionStatus;
}

// Alert Types
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertType {
  SUSPICIOUS_TRANSACTION = 'suspicious_transaction',
  LOCATION_ANOMALY = 'location_anomaly',
  AMOUNT_ANOMALY = 'amount_anomaly',
  VELOCITY_EXCEEDED = 'velocity_exceeded',
  NEW_DEVICE = 'new_device',
  UNUSUAL_TIME = 'unusual_time'
}

export enum AlertStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface Alert {
  id: string;
  userId: string;
  transactionId?: string;
  severity: AlertSeverity;
  type: AlertType;
  status: AlertStatus;
  title: string;
  description: string;
  assignee?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

// Rule Configuration Types
export enum RuleType {
  AMOUNT_THRESHOLD = 'amount_threshold',
  VELOCITY_LIMIT = 'velocity_limit',
  LOCATION_ANOMALY = 'location_anomaly',
  DEVICE_CHANGE = 'device_change',
  NEW_PAYEE = 'new_payee',
  TIME_ANOMALY = 'time_anomaly',
}

export interface RuleConfig {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  parameters: Record<string, any>;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalTransactions: number;
  totalUsers: number;
  totalAlerts: number;
  fraudPrevented: number;
  riskScore: {
    low: number;
    medium: number;
    high: number;
  };
  decisions: {
    allow: number;
    challenge: number;
    deny: number;
  };
  alertsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// Verification Types
export enum VerificationMethod {
  ID_SCAN = 'id_scan',
  LIVENESS = 'liveness',
  SELFIE = 'selfie',
}

export enum VerificationResult {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export interface VerificationAttempt {
  id: string;
  userId: string;
  method: VerificationMethod;
  result: VerificationResult;
  attemptsCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface TransactionFilters {
  decision?: TransactionDecision;
  riskScore?: {
    min: number;
    max: number;
  };
  userId?: string;
  merchant?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AlertFilters {
  severity?: AlertSeverity;
  status?: AlertStatus;
  type?: AlertType;
  userId?: string;
  assignee?: string;
}

// Ghana-specific Types
export interface GhanaLocation {
  latitude: number;
  longitude: number;
  source: LocationSource;
  country: 'GH';
  city: string;
  region: string;
}

export interface GhanaTransaction extends Omit<Transaction, 'location'> {
  location?: GhanaLocation;
  currency: 'GHS';
}

// Request/Response DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface SignupResponse {
  token: string;
  user: Omit<User, 'password'>;
  message: string;
}

export interface CreateTransactionRequest {
  userId: string;
  deviceId: string;
  amount: number;
  currency: string;
  merchant?: string;
  payee?: string;
  channel: TransactionChannel;
  ipAddress?: string;
  location?: Location;
}

export interface UpdateTransactionDecisionRequest {
  decision: TransactionDecision;
  reasons: string[];
  notes?: string;
}
