import { 
  User, 
  Transaction, 
  Alert, 
  DashboardStats, 
  TransactionDecision, 
  TransactionChannel,
  AlertSeverity,
  AlertType,
  AlertStatus,
  UserRole,
  UserStatus,
  LocationSource,
  TransactionStatus
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@finsecure.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    mfaEnabled: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date('2024-01-01').toISOString(),
    status: UserStatus.ACTIVE,
  },
  {
    id: '2',
    email: 'analyst@finsecure.com',
    firstName: 'Analyst',
    lastName: 'User',
    role: UserRole.ANALYST,
    mfaEnabled: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date('2024-01-15').toISOString(),
    status: UserStatus.ACTIVE,
  },
  {
    id: '3',
    email: 'user@finsecure.com',
    firstName: 'Regular',
    lastName: 'User',
    role: UserRole.REGULAR,
    mfaEnabled: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date('2024-01-10').toISOString(),
    status: UserStatus.ACTIVE,
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    userId: 'user_001',
    deviceId: 'device_001',
    amount: 450.00,
    currency: 'GHS',
    merchant: 'Shoprite Ghana',
    timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
    channel: TransactionChannel.MOBILE_APP,
    ipAddress: '192.168.1.100',
    location: {
      latitude: 5.6037,
      longitude: -0.1870,
      source: LocationSource.GPS,
      country: 'GH',
      city: 'Accra',
      region: 'Greater Accra'
    },
    decision: TransactionDecision.ALLOW,
    riskScore: 25,
    reasons: ['normal_amount', 'known_merchant'],
    status: TransactionStatus.COMPLETED
  },
  {
    id: 'txn_002',
    userId: 'user_002',
    deviceId: 'device_002',
    amount: 7500.00,
    currency: 'GHS',
    merchant: 'Unknown Merchant',
    timestamp: new Date('2024-01-15T02:15:00Z').toISOString(),
    channel: TransactionChannel.WEB,
    ipAddress: '203.0.113.1',
    location: {
      latitude: 6.6885,
      longitude: -1.6244,
      source: LocationSource.IP,
      country: 'GH',
      city: 'Kumasi',
      region: 'Ashanti'
    },
    decision: TransactionDecision.CHALLENGE,
    riskScore: 75,
    reasons: ['high_amount', 'unusual_time', 'new_merchant'],
    status: TransactionStatus.PENDING
  },
  {
    id: 'txn_003',
    userId: 'user_003',
    deviceId: 'device_003',
    amount: 15000.00,
    currency: 'GHS',
    payee: 'Kwame Asante',
    timestamp: new Date('2024-01-15T14:45:00Z').toISOString(),
    channel: TransactionChannel.API,
    ipAddress: '198.51.100.1',
    location: {
      latitude: 4.8667,
      longitude: -2.2400,
      source: LocationSource.GPS,
      country: 'GH',
      city: 'Takoradi',
      region: 'Western'
    },
    decision: TransactionDecision.DENY,
    riskScore: 95,
    reasons: ['suspicious_amount', 'location_mismatch', 'velocity_exceeded'],
    status: TransactionStatus.FAILED
  },
  {
    id: 'txn_004',
    userId: 'user_001',
    deviceId: 'device_004',
    amount: 25.50,
    currency: 'GHS',
    merchant: 'KFC Ghana',
    timestamp: new Date('2024-01-15T08:00:00Z').toISOString(),
    channel: TransactionChannel.MOBILE_APP,
    ipAddress: '192.168.1.100',
    location: {
      latitude: 5.6037,
      longitude: -0.1870,
      source: LocationSource.GPS,
      country: 'GH',
      city: 'Accra',
      region: 'Greater Accra'
    },
    decision: TransactionDecision.ALLOW,
    riskScore: 15,
    reasons: ['normal_amount', 'usual_location'],
    status: TransactionStatus.COMPLETED
  },
  {
    id: 'txn_005',
    userId: 'user_002',
    deviceId: 'device_002',
    amount: 3600.00,
    currency: 'GHS',
    merchant: 'Melcom Ghana',
    timestamp: new Date('2024-01-15T16:20:00Z').toISOString(),
    channel: TransactionChannel.WEB,
    ipAddress: '203.0.113.1',
    location: {
      latitude: 6.6885,
      longitude: -1.6244,
      source: LocationSource.IP,
      country: 'GH',
      city: 'Kumasi',
      region: 'Ashanti'
    },
    decision: TransactionDecision.CHALLENGE,
    riskScore: 60,
    reasons: ['medium_amount', 'new_merchant'],
    status: TransactionStatus.PENDING
  }
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    userId: 'user_002',
    transactionId: 'txn_002',
    severity: AlertSeverity.HIGH,
    type: AlertType.SUSPICIOUS_TRANSACTION,
    status: AlertStatus.OPEN,
    title: 'High-value transaction at unusual time',
    description: 'Transaction of ₵7,500 at 2:15 AM from unknown merchant',
    assignee: 'analyst@finsecure.com',
    notes: ['Requires immediate review'],
    createdAt: new Date('2024-01-15T02:20:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T02:20:00Z').toISOString(),
  },
  {
    id: 'alert_002',
    userId: 'user_003',
    transactionId: 'txn_003',
    severity: AlertSeverity.CRITICAL,
    type: AlertType.LOCATION_ANOMALY,
    status: AlertStatus.IN_PROGRESS,
    title: 'Location anomaly detected',
    description: 'Transaction from Chicago while user typically in New York',
    assignee: 'admin@finsecure.com',
    notes: ['Impossible travel detected', 'Account temporarily locked'],
    createdAt: new Date('2024-01-15T14:50:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T15:00:00Z').toISOString(),
  },
  {
    id: 'alert_003',
    userId: 'user_001',
    transactionId: 'txn_004',
    severity: AlertSeverity.LOW,
    type: AlertType.AMOUNT_ANOMALY,
    status: AlertStatus.RESOLVED,
    title: 'Minor amount anomaly',
    description: 'Slightly higher than usual transaction amount',
    assignee: 'analyst@finsecure.com',
    notes: ['False positive - user confirmed legitimate'],
    createdAt: new Date('2024-01-15T08:05:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T08:30:00Z').toISOString(),
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalTransactions: 15420,
  totalUsers: 1250,
  totalAlerts: 89,
  fraudPrevented: 3750000, // GHS equivalent
  riskScore: {
    low: 12000,
    medium: 2800,
    high: 620
  },
  decisions: {
    allow: 14200,
    challenge: 980,
    deny: 240
  },
  alertsBySeverity: {
    low: 45,
    medium: 25,
    high: 15,
    critical: 4
  }
};

// Mock Chart Data
export const mockChartData = {
  transactions: [
    { date: '2024-01-09', value: 120 },
    { date: '2024-01-10', value: 135 },
    { date: '2024-01-11', value: 98 },
    { date: '2024-01-12', value: 156 },
    { date: '2024-01-13', value: 142 },
    { date: '2024-01-14', value: 178 },
    { date: '2024-01-15', value: 165 }
  ],
  decisions: [
    { date: '2024-01-09', value: 110 },
    { date: '2024-01-10', value: 125 },
    { date: '2024-01-11', value: 90 },
    { date: '2024-01-12', value: 145 },
    { date: '2024-01-13', value: 130 },
    { date: '2024-01-14', value: 165 },
    { date: '2024-01-15', value: 150 }
  ],
  riskScores: [
    { date: '2024-01-09', value: 25 },
    { date: '2024-01-10', value: 28 },
    { date: '2024-01-11', value: 22 },
    { date: '2024-01-12', value: 35 },
    { date: '2024-01-13', value: 30 },
    { date: '2024-01-14', value: 42 },
    { date: '2024-01-15', value: 38 }
  ]
};

export const mockRiskDistribution = [
  { name: 'Low Risk', value: 12000 },
  { name: 'Medium Risk', value: 2800 },
  { name: 'High Risk', value: 620 }
]; 