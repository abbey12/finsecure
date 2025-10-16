"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTransaction = exports.addTransaction = exports.getTransactionCount = exports.clearAllTransactions = exports.mockVerificationAttempts = exports.mockRiskDistribution = exports.mockChartData = exports.mockDashboardStats = exports.mockAlerts = exports.mockTransactions = exports.mockUsers = void 0;
const types_1 = require("../types");
exports.mockUsers = [
    {
        id: '1',
        email: 'admin@finsecure.com',
        firstName: 'Admin',
        lastName: 'User',
        role: types_1.UserRole.ADMIN,
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date('2024-01-01').toISOString(),
        status: types_1.UserStatus.ACTIVE,
        password: '$2b$12$X/qFASgzhdcMzMzyD8MYo..RdgZ8zbcE/GOCg/FA47favIXViOKDG',
    },
    {
        id: '2',
        email: 'analyst@finsecure.com',
        firstName: 'Analyst',
        lastName: 'User',
        role: types_1.UserRole.ANALYST,
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date('2024-01-15').toISOString(),
        status: types_1.UserStatus.ACTIVE,
        password: '$2b$12$X/qFASgzhdcMzMzyD8MYo..RdgZ8zbcE/GOCg/FA47favIXViOKDG',
    },
    {
        id: '3',
        email: 'user@finsecure.com',
        firstName: 'Regular',
        lastName: 'User',
        role: types_1.UserRole.REGULAR,
        mfaEnabled: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date('2024-01-10').toISOString(),
        status: types_1.UserStatus.ACTIVE,
        password: '$2b$12$X/qFASgzhdcMzMzyD8MYo..RdgZ8zbcE/GOCg/FA47favIXViOKDG',
    },
];
exports.mockTransactions = [
    {
        id: 'txn_001',
        userId: 'user_001',
        deviceId: 'device_001',
        amount: 450.00,
        currency: 'GHS',
        merchant: 'Shoprite Ghana',
        timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
        channel: types_1.TransactionChannel.MOBILE_APP,
        ipAddress: '192.168.1.100',
        location: {
            latitude: 5.6037,
            longitude: -0.1870,
            source: types_1.LocationSource.GPS,
            country: 'GH',
            city: 'Accra',
            region: 'Greater Accra'
        },
        decision: types_1.TransactionDecision.ALLOW,
        riskScore: 25,
        reasons: ['normal_amount', 'known_merchant'],
        status: types_1.TransactionStatus.COMPLETED
    },
    {
        id: 'txn_002',
        userId: 'user_002',
        deviceId: 'device_002',
        amount: 7500.00,
        currency: 'GHS',
        merchant: 'Unknown Merchant',
        timestamp: new Date('2024-01-15T02:15:00Z').toISOString(),
        channel: types_1.TransactionChannel.WEB,
        ipAddress: '203.0.113.1',
        location: {
            latitude: 6.6885,
            longitude: -1.6244,
            source: types_1.LocationSource.IP,
            country: 'GH',
            city: 'Kumasi',
            region: 'Ashanti'
        },
        decision: types_1.TransactionDecision.CHALLENGE,
        riskScore: 75,
        reasons: ['high_amount', 'unusual_time', 'new_merchant'],
        status: types_1.TransactionStatus.PENDING
    },
    {
        id: 'txn_003',
        userId: 'user_003',
        deviceId: 'device_003',
        amount: 15000.00,
        currency: 'GHS',
        payee: 'Kwame Asante',
        timestamp: new Date('2024-01-15T14:45:00Z').toISOString(),
        channel: types_1.TransactionChannel.API,
        ipAddress: '198.51.100.1',
        location: {
            latitude: 4.8667,
            longitude: -2.2400,
            source: types_1.LocationSource.GPS,
            country: 'GH',
            city: 'Takoradi',
            region: 'Western'
        },
        decision: types_1.TransactionDecision.DENY,
        riskScore: 95,
        reasons: ['suspicious_amount', 'location_mismatch', 'velocity_exceeded'],
        status: types_1.TransactionStatus.FAILED
    },
    {
        id: 'txn_004',
        userId: 'user_001',
        deviceId: 'device_004',
        amount: 25.50,
        currency: 'GHS',
        merchant: 'KFC Ghana',
        timestamp: new Date('2024-01-15T08:00:00Z').toISOString(),
        channel: types_1.TransactionChannel.MOBILE_APP,
        ipAddress: '192.168.1.100',
        location: {
            latitude: 5.6037,
            longitude: -0.1870,
            source: types_1.LocationSource.GPS,
            country: 'GH',
            city: 'Accra',
            region: 'Greater Accra'
        },
        decision: types_1.TransactionDecision.ALLOW,
        riskScore: 15,
        reasons: ['normal_amount', 'usual_location'],
        status: types_1.TransactionStatus.COMPLETED
    },
    {
        id: 'txn_005',
        userId: 'user_002',
        deviceId: 'device_002',
        amount: 3600.00,
        currency: 'GHS',
        merchant: 'Melcom Ghana',
        timestamp: new Date('2024-01-15T16:20:00Z').toISOString(),
        channel: types_1.TransactionChannel.WEB,
        ipAddress: '203.0.113.1',
        location: {
            latitude: 6.6885,
            longitude: -1.6244,
            source: types_1.LocationSource.IP,
            country: 'GH',
            city: 'Kumasi',
            region: 'Ashanti'
        },
        decision: types_1.TransactionDecision.CHALLENGE,
        riskScore: 60,
        reasons: ['medium_amount', 'new_merchant'],
        status: types_1.TransactionStatus.PENDING
    }
];
exports.mockAlerts = [
    {
        id: 'alert_001',
        userId: 'user_002',
        transactionId: 'txn_002',
        severity: types_1.AlertSeverity.HIGH,
        type: types_1.AlertType.SUSPICIOUS_TRANSACTION,
        status: types_1.AlertStatus.OPEN,
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
        severity: types_1.AlertSeverity.CRITICAL,
        type: types_1.AlertType.LOCATION_ANOMALY,
        status: types_1.AlertStatus.IN_PROGRESS,
        title: 'Location anomaly detected',
        description: 'Transaction from Takoradi while user typically in Accra',
        assignee: 'admin@finsecure.com',
        notes: ['Impossible travel detected', 'Account temporarily locked'],
        createdAt: new Date('2024-01-15T14:50:00Z').toISOString(),
        updatedAt: new Date('2024-01-15T15:00:00Z').toISOString(),
    },
    {
        id: 'alert_003',
        userId: 'user_001',
        transactionId: 'txn_004',
        severity: types_1.AlertSeverity.LOW,
        type: types_1.AlertType.AMOUNT_ANOMALY,
        status: types_1.AlertStatus.RESOLVED,
        title: 'Minor amount anomaly',
        description: 'Slightly higher than usual transaction amount',
        assignee: 'analyst@finsecure.com',
        notes: ['False positive - user confirmed legitimate'],
        createdAt: new Date('2024-01-15T08:05:00Z').toISOString(),
        updatedAt: new Date('2024-01-15T08:30:00Z').toISOString(),
    }
];
exports.mockDashboardStats = {
    totalTransactions: 15420,
    totalUsers: 1250,
    totalAlerts: 89,
    fraudPrevented: 3750000,
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
exports.mockChartData = {
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
exports.mockRiskDistribution = [
    { name: 'Low Risk', value: 12000 },
    { name: 'Medium Risk', value: 2800 },
    { name: 'High Risk', value: 620 }
];
exports.mockVerificationAttempts = [
    {
        id: 'ver_001',
        userId: '1',
        transactionId: 'txn_001',
        method: types_1.VerificationMethod.ID_SCAN,
        result: types_1.VerificationResult.SUCCESS,
        reasons: ['ID verification successful'],
        attemptsCount: 1,
        createdAt: new Date('2024-01-20T10:00:00Z').toISOString(),
        completedAt: new Date('2024-01-20T10:05:00Z').toISOString(),
    },
    {
        id: 'ver_002',
        userId: '2',
        transactionId: 'txn_002',
        method: types_1.VerificationMethod.LIVENESS,
        result: types_1.VerificationResult.PENDING,
        reasons: ['Liveness check in progress'],
        attemptsCount: 1,
        createdAt: new Date('2024-01-20T11:00:00Z').toISOString(),
    },
    {
        id: 'ver_003',
        userId: '3',
        transactionId: 'txn_003',
        method: types_1.VerificationMethod.SELFIE,
        result: types_1.VerificationResult.FAILED,
        reasons: ['Selfie verification failed', 'Poor image quality'],
        attemptsCount: 2,
        createdAt: new Date('2024-01-20T12:00:00Z').toISOString(),
        completedAt: new Date('2024-01-20T12:10:00Z').toISOString(),
    },
    {
        id: 'ver_004',
        userId: '1',
        transactionId: 'txn_004',
        method: types_1.VerificationMethod.LIVENESS,
        result: types_1.VerificationResult.EXPIRED,
        reasons: ['Verification session expired'],
        attemptsCount: 1,
        createdAt: new Date('2024-01-21T09:00:00Z').toISOString(),
        completedAt: new Date('2024-01-21T09:05:00Z').toISOString(),
    },
    {
        id: 'ver_005',
        userId: '2',
        transactionId: 'txn_005',
        method: types_1.VerificationMethod.ID_SCAN,
        result: types_1.VerificationResult.SUCCESS,
        reasons: ['ID verification successful'],
        attemptsCount: 1,
        createdAt: new Date('2024-01-21T14:00:00Z').toISOString(),
        completedAt: new Date('2024-01-21T14:02:00Z').toISOString(),
    },
];
const clearAllTransactions = () => {
    exports.mockTransactions = [];
    console.log('All transactions have been cleared from the database');
};
exports.clearAllTransactions = clearAllTransactions;
const getTransactionCount = () => {
    return exports.mockTransactions.length;
};
exports.getTransactionCount = getTransactionCount;
const addTransaction = (transaction) => {
    exports.mockTransactions.push(transaction);
};
exports.addTransaction = addTransaction;
const removeTransaction = (transactionId) => {
    const index = exports.mockTransactions.findIndex(t => t.id === transactionId);
    if (index !== -1) {
        exports.mockTransactions.splice(index, 1);
        return true;
    }
    return false;
};
exports.removeTransaction = removeTransaction;
//# sourceMappingURL=mockData.js.map