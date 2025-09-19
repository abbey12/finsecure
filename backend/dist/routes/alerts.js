"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const mockData_1 = require("../services/mockData");
const router = express_1.default.Router();
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity value'),
    (0, express_validator_1.query)('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status value'),
    (0, express_validator_1.query)('type').optional().isString().withMessage('Type must be a string'),
    (0, express_validator_1.query)('userId').optional().isString().withMessage('User ID must be a string'),
    (0, express_validator_1.query)('assignee').optional().isString().withMessage('Assignee must be a string')
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
        if (req.query.severity)
            filters.severity = req.query.severity;
        if (req.query.status)
            filters.status = req.query.status;
        if (req.query.type)
            filters.type = req.query.type;
        if (req.query.userId)
            filters.userId = req.query.userId;
        if (req.query.assignee)
            filters.assignee = req.query.assignee;
        let filteredAlerts = [...mockData_1.mockAlerts];
        if (filters.severity) {
            filteredAlerts = filteredAlerts.filter(a => a.severity === filters.severity);
        }
        if (filters.status) {
            filteredAlerts = filteredAlerts.filter(a => a.status === filters.status);
        }
        if (filters.type) {
            filteredAlerts = filteredAlerts.filter(a => a.type === filters.type);
        }
        if (filters.userId) {
            filteredAlerts = filteredAlerts.filter(a => a.userId === filters.userId);
        }
        if (filters.assignee) {
            filteredAlerts = filteredAlerts.filter(a => a.assignee === filters.assignee);
        }
        const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);
        const totalPages = Math.ceil(filteredAlerts.length / limit);
        const response = {
            success: true,
            data: {
                data: paginatedAlerts,
                pagination: {
                    page,
                    limit,
                    total: filteredAlerts.length,
                    totalPages
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:id', [
    (0, express_validator_1.param)('id').isString().withMessage('Alert ID is required')
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
        const alert = mockData_1.mockAlerts.find(a => a.id === id);
        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found'
            });
        }
        const response = {
            success: true,
            data: alert
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get alert error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.patch('/:id', [
    (0, express_validator_1.param)('id').isString().withMessage('Alert ID is required'),
    (0, express_validator_1.body)('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status value'),
    (0, express_validator_1.body)('assignee').optional().isString().withMessage('Assignee must be a string'),
    (0, express_validator_1.body)('notes').optional().isArray().withMessage('Notes must be an array')
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
        const alertIndex = mockData_1.mockAlerts.findIndex(a => a.id === id);
        if (alertIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found'
            });
        }
        const updatedAlert = {
            ...mockData_1.mockAlerts[alertIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        mockData_1.mockAlerts[alertIndex] = updatedAlert;
        const response = {
            success: true,
            data: updatedAlert,
            message: 'Alert updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update alert error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/top/:limit', [
    (0, express_validator_1.param)('limit').isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
        const limit = parseInt(req.params.limit);
        const topAlerts = [...mockData_1.mockAlerts]
            .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
            if (severityDiff !== 0)
                return severityDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
            .slice(0, limit);
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
//# sourceMappingURL=alerts.js.map