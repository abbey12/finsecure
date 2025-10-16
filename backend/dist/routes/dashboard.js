"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const dashboardService_1 = require("../services/dashboardService");
const router = express_1.default.Router();
router.get('/stats', async (req, res) => {
    try {
        const realStats = dashboardService_1.DashboardService.getRealStats();
        const response = {
            success: true,
            data: realStats
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
        const chartData = dashboardService_1.DashboardService.getTransactionChartData(days);
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
        const realRiskData = dashboardService_1.DashboardService.getRiskDistributionData();
        const response = {
            success: true,
            data: realRiskData
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
        const decisionData = dashboardService_1.DashboardService.getDecisionChartData(days);
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
        const alertsBySeverity = dashboardService_1.DashboardService.getAlertsBySeverity();
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
        const recentActivity = dashboardService_1.DashboardService.getRecentActivity(limit);
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
router.get('/top-alerts', [
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
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
        const limit = parseInt(req.query.limit) || 5;
        const topAlerts = dashboardService_1.DashboardService.getTopAlerts(limit);
        const response = {
            success: true,
            data: topAlerts
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get top alerts error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map