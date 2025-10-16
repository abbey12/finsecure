export declare enum UserRole {
    ADMIN = "admin",
    ANALYST = "analyst",
    REGULAR = "regular"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
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
    password?: string;
}
export declare enum TransactionChannel {
    MOBILE_APP = "mobile_app",
    WEB = "web",
    API = "api",
    ATM = "atm",
    POS = "pos"
}
export declare enum TransactionDecision {
    ALLOW = "allow",
    CHALLENGE = "challenge",
    DENY = "deny"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare enum LocationSource {
    GPS = "gps",
    IP = "ip",
    MANUAL = "manual"
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
export declare enum AlertSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum AlertType {
    SUSPICIOUS_TRANSACTION = "suspicious_transaction",
    LOCATION_ANOMALY = "location_anomaly",
    AMOUNT_ANOMALY = "amount_anomaly",
    VELOCITY_EXCEEDED = "velocity_exceeded",
    NEW_DEVICE = "new_device",
    UNUSUAL_TIME = "unusual_time"
}
export declare enum AlertStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    CLOSED = "closed"
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
export declare enum RuleType {
    AMOUNT_THRESHOLD = "amount_threshold",
    VELOCITY_LIMIT = "velocity_limit",
    LOCATION_ANOMALY = "location_anomaly",
    DEVICE_CHANGE = "device_change",
    NEW_PAYEE = "new_payee",
    TIME_ANOMALY = "time_anomaly"
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
export declare enum VerificationMethod {
    ID_SCAN = "id_scan",
    LIVENESS = "liveness",
    SELFIE = "selfie",
    FINGERPRINT = "fingerprint",
    FACE_RECOGNITION = "face_recognition",
    SMS_CODE = "sms_code",
    EMAIL_CODE = "email_code",
    SECURITY_QUESTIONS = "security_questions",
    VOICE_VERIFICATION = "voice_verification",
    DOCUMENT_SCAN = "document_scan",
    BIOMETRIC = "biometric",
    PIN_VERIFICATION = "pin_verification",
    OTP = "otp"
}
export declare enum VerificationResult {
    SUCCESS = "success",
    PENDING = "pending",
    FAILED = "failed",
    EXPIRED = "expired"
}
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
//# sourceMappingURL=index.d.ts.map