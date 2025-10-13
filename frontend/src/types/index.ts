// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  mfaEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
  status: UserStatus;
}

export enum UserRole {
  REGULAR = 'regular',
  ADMIN = 'admin',
  ANALYST = 'analyst',
}

export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  SUSPENDED = 'suspended',
}

// Transaction Types
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

export enum TransactionChannel {
  MOBILE_APP = 'mobile_app',
  WEB = 'web',
  API = 'api',
  POS = 'pos',
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

export enum TransactionDecision {
  ALLOW = 'allow',
  CHALLENGE = 'challenge',
  DENY = 'deny',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: LocationSource;
  country?: string;
  city?: string;
  region?: string;
}

export enum LocationSource {
  GPS = 'gps',
  IP = 'ip',
}

// Device Types
export interface Device {
  id: string;
  userId: string;
  fingerprint: string;
  os: string;
  browser?: string;
  firstSeen: string;
  lastSeen: string;
  trustLevel: DeviceTrustLevel;
  isCompromised: boolean;
}

export enum DeviceTrustLevel {
  UNKNOWN = 'unknown',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Alert Types
export interface Alert {
  id: string;
  userId?: string;
  transactionId?: string;
  severity: AlertSeverity;
  type: AlertType;
  status: AlertStatus;
  title: string;
  description: string;
  assignee?: string;
  notes?: string[];
  createdAt: string;
  updatedAt: string;
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertType {
  SUSPICIOUS_TRANSACTION = 'suspicious_transaction',
  LOCATION_ANOMALY = 'location_anomaly',
  DEVICE_COMPROMISE = 'device_compromise',
  MULTIPLE_FAILED_VERIFICATIONS = 'multiple_failed_verifications',
  VELOCITY_ANOMALY = 'velocity_anomaly',
  AMOUNT_ANOMALY = 'amount_anomaly',
}

export enum AlertStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// Verification Types
export interface VerificationAttempt {
  id: string;
  userId: string;
  transactionId: string;
  method: VerificationMethod;
  result: VerificationResult;
  reasons: string[];
  attemptsCount: number;
  createdAt: string;
  completedAt?: string;
}

export enum VerificationMethod {
  ID_SCAN = 'id_scan',
  LIVENESS = 'liveness',
  SELFIE = 'selfie',
}

export enum VerificationResult {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

// Behavior Profile Types
export interface BehaviorProfile {
  userId: string;
  amountStats: AmountStats;
  timeOfDayDistribution: TimeOfDayDistribution;
  merchantVectors: MerchantVector[];
  velocityStats: VelocityStats;
  locationClusters: LocationCluster[];
  lastUpdated: string;
}

export interface AmountStats {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  percentile95: number;
}

export interface TimeOfDayDistribution {
  [hour: string]: number;
}

export interface MerchantVector {
  merchant: string;
  frequency: number;
  totalAmount: number;
  averageAmount: number;
  lastSeen: string;
}

export interface VelocityStats {
  transactionsPerHour: number;
  transactionsPerDay: number;
  maxAmountPerHour: number;
  maxAmountPerDay: number;
}

export interface LocationCluster {
  center: Location;
  radius: number;
  frequency: number;
  lastSeen: string;
}

// Rule Configuration Types
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

export enum RuleType {
  AMOUNT_THRESHOLD = 'amount_threshold',
  VELOCITY_LIMIT = 'velocity_limit',
  LOCATION_ANOMALY = 'location_anomaly',
  DEVICE_CHANGE = 'device_change',
  NEW_PAYEE = 'new_payee',
  TIME_ANOMALY = 'time_anomaly',
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
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

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface MfaForm {
  code: string;
}

export interface VerificationForm {
  idImage?: File;
  selfieImage?: File;
  livenessData?: any;
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

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TransactionChartData {
  transactions: ChartDataPoint[];
  decisions: ChartDataPoint[];
  riskScores: ChartDataPoint[];
}

// Filter Types
export interface TransactionFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  decision?: TransactionDecision;
  riskScore?: {
    min: number;
    max: number;
  };
  amount?: {
    min: number;
    max: number;
  };
  userId?: string;
  deviceId?: string;
}

export interface AlertFilters {
  severity?: AlertSeverity;
  status?: AlertStatus;
  type?: AlertType;
  userId?: string; // Add userId to filter alerts by user
  dateRange?: {
    start: string;
    end: string;
  };
  assignee?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string; // Optional: for searching by name or email
} 