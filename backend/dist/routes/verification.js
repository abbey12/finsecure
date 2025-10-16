"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
const mockData_1 = require("../services/mockData");
const verificationService_1 = require("../services/verificationService");
const router = express_1.default.Router();
router.get('/users/:userId/verifications', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('method').optional().isIn(Object.values(types_1.VerificationMethod)).withMessage('Invalid verification method'),
    (0, express_validator_1.query)('result').optional().isIn(Object.values(types_1.VerificationResult)).withMessage('Invalid verification result'),
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
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        let filteredAttempts = mockData_1.mockVerificationAttempts.filter(attempt => attempt.userId === userId);
        if (req.query.method && req.query.method !== 'all') {
            filteredAttempts = filteredAttempts.filter(attempt => attempt.method === req.query.method);
        }
        if (req.query.result && req.query.result !== 'all') {
            filteredAttempts = filteredAttempts.filter(attempt => attempt.result === req.query.result);
        }
        const paginatedAttempts = filteredAttempts.slice(offset, offset + limit);
        const totalPages = Math.ceil(filteredAttempts.length / limit);
        const response = {
            success: true,
            data: {
                data: paginatedAttempts,
                pagination: {
                    page,
                    limit,
                    total: filteredAttempts.length,
                    totalPages,
                },
            },
            message: 'Verification history fetched successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching verification history:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
router.post('/start', [
    (0, express_validator_1.body)('transactionId').notEmpty().withMessage('Transaction ID is required'),
    (0, express_validator_1.body)('requiredMethods').optional().isArray().withMessage('Required methods must be an array'),
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
        const { transactionId, requiredMethods } = req.body;
        const userId = req.user?.id || 'mock_user_id';
        const riskScore = req.body.riskScore || 50;
        const session = verificationService_1.verificationService.createVerificationSession(transactionId, userId, riskScore);
        const response = {
            success: true,
            data: {
                attemptId: session.id,
                requiredMethods: session.steps.map(step => step.method),
                expiresAt: session.expiresAt,
                instructions: `Complete ${session.steps.length} verification steps to proceed`
            },
            message: 'Verification session created successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Start verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/:attemptId/submit', [
    (0, express_validator_1.body)('method').isIn(Object.values(types_1.VerificationMethod)).withMessage('Invalid verification method'),
    (0, express_validator_1.body)('data').notEmpty().withMessage('Verification data is required'),
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
        const { attemptId } = req.params;
        const { method, data } = req.body;
        const result = await verificationService_1.verificationService.completeVerificationStep(attemptId, method, data);
        const response = {
            success: result.success,
            data: {
                id: attemptId,
                userId: 'mock_user_id',
                transactionId: 'mock_transaction_id',
                method,
                result: result.result,
                reasons: result.reasons,
                attemptsCount: 1,
                createdAt: new Date().toISOString(),
                completedAt: result.success ? new Date().toISOString() : undefined
            },
            message: result.success ? 'Verification completed successfully' : 'Verification failed'
        };
        return res.json(response);
    }
    catch (error) {
        console.error('Submit verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:attemptId/status', async (req, res) => {
    try {
        const { attemptId } = req.params;
        const session = verificationService_1.verificationService.getVerificationSession(attemptId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Verification session not found'
            });
        }
        const response = {
            success: true,
            data: {
                id: attemptId,
                userId: session.userId,
                transactionId: session.transactionId,
                method: session.steps[session.currentStep]?.method || types_1.VerificationMethod.SMS_CODE,
                result: session.status === 'completed' ? types_1.VerificationResult.SUCCESS :
                    session.status === 'expired' ? types_1.VerificationResult.EXPIRED :
                        types_1.VerificationResult.PENDING,
                reasons: [],
                attemptsCount: 1,
                createdAt: session.createdAt,
                completedAt: session.status === 'completed' ? new Date().toISOString() : undefined
            },
            message: 'Verification status retrieved successfully'
        };
        return res.json(response);
    }
    catch (error) {
        console.error('Get verification status error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:attemptId/progress', async (req, res) => {
    try {
        const { attemptId } = req.params;
        const progress = verificationService_1.verificationService.getVerificationProgress(attemptId);
        if (!progress) {
            return res.status(404).json({
                success: false,
                error: 'Verification session not found'
            });
        }
        const response = {
            success: true,
            data: progress,
            message: 'Verification progress retrieved successfully'
        };
        return res.json(response);
    }
    catch (error) {
        console.error('Get verification progress error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/required-methods', [
    (0, express_validator_1.query)('transactionId').notEmpty().withMessage('Transaction ID is required'),
    (0, express_validator_1.query)('riskScore').isInt({ min: 0, max: 100 }).withMessage('Risk score must be between 0 and 100'),
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
        const { transactionId, riskScore } = req.query;
        const requiredMethods = verificationService_1.verificationService.getRequiredVerificationMethods(parseInt(riskScore));
        const response = {
            success: true,
            data: requiredMethods,
            message: 'Required verification methods retrieved successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get required methods error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/:attemptId/cancel', [
    (0, express_validator_1.body)('reason').optional().isString().withMessage('Reason must be a string'),
], async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { reason } = req.body;
        const success = verificationService_1.verificationService.cancelVerificationSession(attemptId, reason);
        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Verification session not found'
            });
        }
        const response = {
            success: true,
            data: undefined,
            message: 'Verification cancelled successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Cancel verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/users/:userId/available-methods', async (req, res) => {
    try {
        const { userId } = req.params;
        const availableMethods = {
            available: [
                types_1.VerificationMethod.SMS_CODE,
                types_1.VerificationMethod.EMAIL_CODE,
                types_1.VerificationMethod.SECURITY_QUESTIONS,
                types_1.VerificationMethod.PIN_VERIFICATION
            ],
            preferred: [
                types_1.VerificationMethod.SMS_CODE,
                types_1.VerificationMethod.SECURITY_QUESTIONS
            ],
            setupRequired: [
                types_1.VerificationMethod.BIOMETRIC,
                types_1.VerificationMethod.FACE_RECOGNITION,
                types_1.VerificationMethod.VOICE_VERIFICATION
            ]
        };
        const response = {
            success: true,
            data: availableMethods,
            message: 'Available verification methods retrieved successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get available methods error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/users/:userId/setup/:method', [
    (0, express_validator_1.body)('setupData').notEmpty().withMessage('Setup data is required'),
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
        const { userId, method } = req.params;
        const { setupData } = req.body;
        const setupId = `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        const response = {
            success: true,
            data: {
                setupId,
                instructions: `Follow the on-screen instructions to setup ${method} verification`,
                expiresAt
            },
            message: 'Verification method setup initiated successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Setup verification method error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/methods', async (req, res) => {
    try {
        const methods = Object.values(types_1.VerificationMethod);
        const response = {
            success: true,
            data: methods,
            message: 'Verification methods retrieved successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get verification methods error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=verification.js.map