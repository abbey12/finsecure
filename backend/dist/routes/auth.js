"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const mockData_1 = require("../services/mockData");
const types_1 = require("../types");
const router = express_1.default.Router();
router.post('/signup', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    (0, express_validator_1.body)('role').optional().isIn(['admin', 'analyst', 'regular']).withMessage('Invalid role')
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
        const { email, password, firstName, lastName, role = types_1.UserRole.REGULAR } = req.body;
        const existingUser = mockData_1.mockUsers.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        const newUser = {
            id: (0, uuid_1.v4)(),
            email,
            firstName,
            lastName,
            role: role,
            mfaEnabled: false,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            status: types_1.UserStatus.ACTIVE,
            password: hashedPassword
        };
        mockData_1.mockUsers.push(newUser);
        const token = jsonwebtoken_1.default.sign({
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role
            }
        }, process.env.JWT_SECRET || 'fallback-secret');
        const response = {
            success: true,
            data: {
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    mfaEnabled: newUser.mfaEnabled,
                    lastLogin: newUser.lastLogin,
                    createdAt: newUser.createdAt,
                    status: newUser.status
                },
                message: 'User created successfully'
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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
        const { email, password } = req.body;
        const user = mockData_1.mockUsers.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password || '');
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        const token = jsonwebtoken_1.default.sign({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        }, process.env.JWT_SECRET || 'fallback-secret');
        const response = {
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    mfaEnabled: user.mfaEnabled,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    status: user.status
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});
router.get('/me', (req, res) => {
    const user = mockData_1.mockUsers[0];
    const response = {
        success: true,
        data: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            mfaEnabled: user.mfaEnabled,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            status: user.status
        }
    };
    res.json(response);
});
router.post('/change-password', [
    (0, express_validator_1.body)('currentPassword').isLength({ min: 6 }).withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    (0, express_validator_1.body)('userId').isString().withMessage('User ID is required')
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
        const { currentPassword, newPassword, userId } = req.body;
        const userIndex = mockData_1.mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const user = mockData_1.mockUsers[userIndex];
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password || '');
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }
        const saltRounds = 12;
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        mockData_1.mockUsers[userIndex].password = hashedNewPassword;
        const response = {
            success: true,
            data: null,
            message: 'Password changed successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/verify-email', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required')
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
        const { email } = req.body;
        const user = mockData_1.mockUsers.find(u => u.email === email);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const response = {
            success: true,
            data: {
                email: user.email,
                exists: true
            },
            message: 'Email verification successful'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map