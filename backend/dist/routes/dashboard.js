"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const mockData_1 = require("../services/mockData");
const router = express_1.default.Router();
router.get('/stats', async (req, res) => {
    try {
        const response = {
            success: true,
            data: mockData_1.mockDashboardStats
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/chart/transactions', [
    (0, express_validator_1.query)('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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
        const days = parseInt(req.query.days) || 7;
        const chartData = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            chartData.push({
                date: date.toISOString().split('T')[0],
                value: Math.floor(Math.random() * 200) + 50
            });
        }
        const response = {
            success: true,
            data: {
                transactions: chartData
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get transaction chart error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/chart/risk-distribution', async (req, res) => {
    try {
        const response = {
            success: true,
            data: mockData_1.mockRiskDistribution
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get risk distribution error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/chart/decisions', [
    (0, express_validator_1.query)('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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
        const days = parseInt(req.query.days) || 7;
        const decisionData = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            decisionData.push({
                date: date.toISOString().split('T')[0],
                allow: Math.floor(Math.random() * 100) + 50,
                challenge: Math.floor(Math.random() * 20) + 5,
                deny: Math.floor(Math.random() * 10) + 1
            });
        }
        const response = {
            success: true,
            data: {
                decisions: decisionData
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get decision chart error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/chart/alerts-by-severity', async (req, res) => {
    try {
        const alertsBySeverity = {
            low: 45,
            medium: 25,
            high: 15,
            critical: 4
        };
        const response = {
            success: true,
            data: alertsBySeverity
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get alerts by severity error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/recent-activity', [
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
        const limit = parseInt(req.query.limit) || 10;
        const recentActivity = [
            {
                id: 'activity_001',
                type: 'transaction',
                description: 'New transaction from Shoprite Ghana - ₵450.00',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                severity: 'low'
            },
            {
                id: 'activity_002',
                type: 'alert',
                description: 'High-risk transaction flagged - ₵7,500.00',
                timestamp: new Date(Date.now() - 600000).toISOString(),
                severity: 'high'
            },
            {
                id: 'activity_003',
                type: 'user',
                description: 'New user registered - analyst@finsecure.com',
                timestamp: new Date(Date.now() - 900000).toISOString(),
                severity: 'medium'
            },
            {
                id: 'activity_004',
                type: 'transaction',
                description: 'Transaction denied - ₵15,000.00 to Kwame Asante',
                timestamp: new Date(Date.now() - 1200000).toISOString(),
                severity: 'critical'
            }
        ].slice(0, limit);
        const response = {
            success: true,
            data: recentActivity
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map