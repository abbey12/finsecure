"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const mockData_1 = require("../services/mockData");
const types_1 = require("../types");
const router = express_1.default.Router();
router.post('/', [
    (0, express_validator_1.body)('userId').isString().withMessage('User ID is required'),
    (0, express_validator_1.body)('deviceId').isString().withMessage('Device ID is required'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    (0, express_validator_1.body)('currency').isString().withMessage('Currency is required'),
    (0, express_validator_1.body)('merchant').optional().isString().withMessage('Merchant must be a string'),
    (0, express_validator_1.body)('payee').optional().isString().withMessage('Payee must be a string'),
    (0, express_validator_1.body)('channel').isIn(['mobile_app', 'web', 'api', 'pos']).withMessage('Invalid channel'),
    (0, express_validator_1.body)('ipAddress').optional().isIP().withMessage('Invalid IP address'),
    (0, express_validator_1.body)('location.latitude').optional().isFloat().withMessage('Invalid latitude'),
    (0, express_validator_1.body)('location.longitude').optional().isFloat().withMessage('Invalid longitude'),
    (0, express_validator_1.body)('location.country').optional().isString().withMessage('Country must be a string'),
    (0, express_validator_1.body)('location.city').optional().isString().withMessage('City must be a string'),
    (0, express_validator_1.body)('location.region').optional().isString().withMessage('Region must be a string')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const transactionData = req.body;
        const transactionId = `txn_${(0, uuid_1.v4)().substring(0, 8)}`;
        const ipAddress = transactionData.ipAddress || req.ip || '127.0.0.1';
        const location = transactionData.location || {
            latitude: 5.6037,
            longitude: -0.1870,
            source: types_1.LocationSource.GPS,
            country: 'GH',
            city: 'Accra',
            region: 'Greater Accra'
        };
        let riskScore = 0;
        const reasons = [];
        if (transactionData.amount > 10000) {
            riskScore += 40;
            reasons.push('high_amount');
        }
        else if (transactionData.amount > 5000) {
            riskScore += 20;
            reasons.push('medium_amount');
        }
        else {
            reasons.push('normal_amount');
        }
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 6) {
            riskScore += 25;
            reasons.push('unusual_time');
        }
        if (!transactionData.merchant || transactionData.merchant.toLowerCase().includes('unknown')) {
            riskScore += 30;
            reasons.push('new_merchant');
        }
        else {
            reasons.push('known_merchant');
        }
        if (location.country !== 'GH') {
            riskScore += 35;
            reasons.push('foreign_location');
        }
        else {
            reasons.push('local_location');
        }
        if (transactionData.channel === types_1.TransactionChannel.API) {
            riskScore += 15;
            reasons.push('api_channel');
        }
        const userRecentTransactions = mockData_1.mockTransactions.filter(t => t.userId === transactionData.userId &&
            new Date(t.timestamp) > new Date(Date.now() - 3600000));
        if (userRecentTransactions.length > 5) {
            riskScore += 20;
            reasons.push('velocity_exceeded');
        }
        let decision;
        let status;
        if (riskScore >= 80) {
            decision = types_1.TransactionDecision.DENY;
            status = types_1.TransactionStatus.FAILED;
        }
        else if (riskScore >= 50) {
            decision = types_1.TransactionDecision.CHALLENGE;
            status = types_1.TransactionStatus.PENDING;
        }
        else {
            decision = types_1.TransactionDecision.ALLOW;
            status = types_1.TransactionStatus.COMPLETED;
        }
        const newTransaction = {
            id: transactionId,
            userId: transactionData.userId,
            deviceId: transactionData.deviceId,
            amount: transactionData.amount,
            currency: transactionData.currency,
            merchant: transactionData.merchant,
            payee: transactionData.payee,
            timestamp: new Date().toISOString(),
            channel: transactionData.channel,
            ipAddress,
            location,
            decision,
            riskScore: Math.min(riskScore, 100),
            reasons,
            status
        };
        mockData_1.mockTransactions.unshift(newTransaction);
        const response = {
            success: true,
            data: newTransaction,
            message: 'Transaction created successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('decision').optional().isIn(['allow', 'challenge', 'deny']).withMessage('Invalid decision value'),
    (0, express_validator_1.query)('riskScoreMin').optional().isInt({ min: 0, max: 100 }).withMessage('Risk score min must be between 0 and 100'),
    (0, express_validator_1.query)('riskScoreMax').optional().isInt({ min: 0, max: 100 }).withMessage('Risk score max must be between 0 and 100'),
    (0, express_validator_1.query)('userId').optional().isString().withMessage('User ID must be a string'),
    (0, express_validator_1.query)('merchant').optional().isString().withMessage('Merchant must be a string')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const filters = {};
        if (req.query.decision)
            filters.decision = req.query.decision;
        if (req.query.riskScoreMin || req.query.riskScoreMax) {
            filters.riskScore = {
                min: parseInt(req.query.riskScoreMin) || 0,
                max: parseInt(req.query.riskScoreMax) || 100
            };
        }
        if (req.query.userId)
            filters.userId = req.query.userId;
        if (req.query.merchant)
            filters.merchant = req.query.merchant;
        let filteredTransactions = [...mockData_1.mockTransactions];
        if (filters.decision) {
            filteredTransactions = filteredTransactions.filter(t => t.decision === filters.decision);
        }
        if (filters.riskScore) {
            filteredTransactions = filteredTransactions.filter(t => t.riskScore >= filters.riskScore.min &&
                t.riskScore <= filters.riskScore.max);
        }
        if (filters.userId) {
            filteredTransactions = filteredTransactions.filter(t => t.userId === filters.userId);
        }
        if (filters.merchant) {
            filteredTransactions = filteredTransactions.filter(t => t.merchant?.toLowerCase().includes(filters.merchant.toLowerCase()));
        }
        const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);
        const totalPages = Math.ceil(filteredTransactions.length / limit);
        const response = {
            success: true,
            data: {
                data: paginatedTransactions,
                pagination: {
                    page,
                    limit,
                    total: filteredTransactions.length,
                    totalPages
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:id', [
    (0, express_validator_1.param)('id').isString().withMessage('Transaction ID is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { id } = req.params;
        const transaction = mockData_1.mockTransactions.find(t => t.id === id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        const response = {
            success: true,
            data: transaction
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.patch('/:id/decision', [
    (0, express_validator_1.param)('id').isString().withMessage('Transaction ID is required'),
    (0, express_validator_1.body)('decision').isIn(['allow', 'challenge', 'deny']).withMessage('Invalid decision value'),
    (0, express_validator_1.body)('reasons').isArray().withMessage('Reasons must be an array'),
    (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { id } = req.params;
        const { decision, reasons, notes } = req.body;
        const transactionIndex = mockData_1.mockTransactions.findIndex(t => t.id === id);
        if (transactionIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        mockData_1.mockTransactions[transactionIndex].decision = decision;
        mockData_1.mockTransactions[transactionIndex].reasons = reasons;
        mockData_1.mockTransactions[transactionIndex].status = decision === 'allow' ? types_1.TransactionStatus.COMPLETED :
            decision === 'deny' ? types_1.TransactionStatus.FAILED : types_1.TransactionStatus.PENDING;
        const response = {
            success: true,
            data: mockData_1.mockTransactions[transactionIndex],
            message: 'Transaction decision updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update transaction decision error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:id/events', [
    (0, express_validator_1.param)('id').isString().withMessage('Transaction ID is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { id } = req.params;
        const transaction = mockData_1.mockTransactions.find(t => t.id === id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        const events = [
            {
                id: 'event_001',
                timestamp: transaction.timestamp,
                type: 'transaction_created',
                description: 'Transaction initiated',
                data: { amount: transaction.amount, currency: transaction.currency }
            },
            {
                id: 'event_002',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                type: 'risk_assessment',
                description: 'Risk assessment completed',
                data: { riskScore: transaction.riskScore, reasons: transaction.reasons }
            },
            {
                id: 'event_003',
                timestamp: new Date(Date.now() - 60000).toISOString(),
                type: 'decision_made',
                description: `Decision: ${transaction.decision}`,
                data: { decision: transaction.decision, status: transaction.status }
            }
        ];
        const response = {
            success: true,
            data: events
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get transaction events error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.delete('/clear-all', async (req, res) => {
    try {
        const { clearAllTransactions, getTransactionCount } = await Promise.resolve().then(() => __importStar(require('../services/mockData')));
        const countBefore = getTransactionCount();
        clearAllTransactions();
        const response = {
            success: true,
            data: {
                clearedCount: countBefore,
                message: `Successfully cleared ${countBefore} transactions from the database`
            },
            message: 'All transactions have been cleared'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Clear all transactions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map