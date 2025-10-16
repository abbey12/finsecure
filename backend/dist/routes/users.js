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
    (0, express_validator_1.query)('role').optional().isIn(['admin', 'analyst', 'regular']).withMessage('Invalid role value'),
    (0, express_validator_1.query)('status').optional().isIn(['active', 'locked', 'suspended']).withMessage('Invalid status value'),
    (0, express_validator_1.query)('search').optional().isString().withMessage('Search must be a string')
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
        let filteredUsers = [...mockData_1.mockUsers];
        if (req.query.role) {
            filteredUsers = filteredUsers.filter(u => u.role === req.query.role);
        }
        if (req.query.status) {
            filteredUsers = filteredUsers.filter(u => u.status === req.query.status);
        }
        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredUsers = filteredUsers.filter(u => u.firstName.toLowerCase().includes(searchTerm) ||
                u.lastName.toLowerCase().includes(searchTerm) ||
                u.email.toLowerCase().includes(searchTerm));
        }
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);
        const totalPages = Math.ceil(filteredUsers.length / limit);
        const usersWithoutPassword = paginatedUsers.map(({ password, ...user }) => user);
        const response = {
            success: true,
            data: {
                data: usersWithoutPassword,
                pagination: {
                    page,
                    limit,
                    total: filteredUsers.length,
                    totalPages
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:id', [
    (0, express_validator_1.param)('id').isString().withMessage('User ID is required')
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
        const user = mockData_1.mockUsers.find(u => u.id === id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const { password, ...userWithoutPassword } = user;
        const response = {
            success: true,
            data: userWithoutPassword
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.patch('/:id', [
    (0, express_validator_1.param)('id').isString().withMessage('User ID is required'),
    (0, express_validator_1.body)('firstName').optional().isString().withMessage('First name must be a string'),
    (0, express_validator_1.body)('lastName').optional().isString().withMessage('Last name must be a string'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('role').optional().isIn(['admin', 'analyst', 'regular']).withMessage('Invalid role value'),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'locked', 'suspended']).withMessage('Invalid status value'),
    (0, express_validator_1.body)('mfaEnabled').optional().isBoolean().withMessage('MFA enabled must be a boolean')
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
        const userIndex = mockData_1.mockUsers.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const updatedUser = { ...mockData_1.mockUsers[userIndex], ...req.body };
        mockData_1.mockUsers[userIndex] = updatedUser;
        const { password, ...userWithoutPassword } = updatedUser;
        const response = {
            success: true,
            data: userWithoutPassword,
            message: 'User updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.delete('/:id', [
    (0, express_validator_1.param)('id').isString().withMessage('User ID is required')
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
        const userIndex = mockData_1.mockUsers.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const response = {
            success: true,
            data: null,
            message: 'User deleted successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map