import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { ApiResponse, VerificationAttempt, VerificationMethod, VerificationResult, PaginatedResponse } from '../types';
import { mockVerificationAttempts } from '../services/mockData';
import { verificationService } from '../services/verificationService';

const router = express.Router();

// Get verification history for a user with filtering and pagination
router.get('/users/:userId/verifications', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('method').optional().isIn(Object.values(VerificationMethod)).withMessage('Invalid verification method'),
  query('result').optional().isIn(Object.values(VerificationResult)).withMessage('Invalid verification result'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    let filteredAttempts = mockVerificationAttempts.filter(attempt => attempt.userId === userId);

    if (req.query.method && req.query.method !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt => attempt.method === req.query.method);
    }

    if (req.query.result && req.query.result !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt => attempt.result === req.query.result);
    }

    const paginatedAttempts = filteredAttempts.slice(offset, offset + limit);
    const totalPages = Math.ceil(filteredAttempts.length / limit);

    const response: ApiResponse<PaginatedResponse<VerificationAttempt>> = {
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

  } catch (error) {
    console.error('Error fetching verification history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Start verification process
router.post('/start', [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('requiredMethods').optional().isArray().withMessage('Required methods must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { transactionId, requiredMethods } = req.body;
    const userId = req.user?.id || 'mock_user_id'; // In real app, get from auth
    const riskScore = req.body.riskScore || 50; // In real app, get from transaction

    const session = verificationService.createVerificationSession(transactionId, userId, riskScore);

    const response: ApiResponse<{
      attemptId: string;
      requiredMethods: VerificationMethod[];
      expiresAt: string;
      instructions: string;
    }> = {
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
  } catch (error) {
    console.error('Start verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Submit verification data
router.post('/:attemptId/submit', [
  body('method').isIn(Object.values(VerificationMethod)).withMessage('Invalid verification method'),
  body('data').notEmpty().withMessage('Verification data is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { attemptId } = req.params;
    const { method, data } = req.body;

    const result = await verificationService.completeVerificationStep(attemptId, method, data);

    const response: ApiResponse<VerificationAttempt> = {
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
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get verification status
router.get('/:attemptId/status', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const session = verificationService.getVerificationSession(attemptId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Verification session not found'
      });
    }

    const response: ApiResponse<VerificationAttempt> = {
      success: true,
      data: {
        id: attemptId,
        userId: session.userId,
        transactionId: session.transactionId,
        method: session.steps[session.currentStep]?.method || VerificationMethod.SMS_CODE,
        result: session.status === 'completed' ? VerificationResult.SUCCESS : 
                session.status === 'expired' ? VerificationResult.EXPIRED : 
                VerificationResult.PENDING,
        reasons: [],
        attemptsCount: 1,
        createdAt: session.createdAt,
        completedAt: session.status === 'completed' ? new Date().toISOString() : undefined
      },
      message: 'Verification status retrieved successfully'
    };

    return res.json(response);
  } catch (error) {
    console.error('Get verification status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get verification progress
router.get('/:attemptId/progress', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const progress = verificationService.getVerificationProgress(attemptId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Verification session not found'
      });
    }

    const response: ApiResponse<typeof progress> = {
      success: true,
      data: progress,
      message: 'Verification progress retrieved successfully'
    };

    return res.json(response);
  } catch (error) {
    console.error('Get verification progress error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get required verification methods
router.get('/required-methods', [
  query('transactionId').notEmpty().withMessage('Transaction ID is required'),
  query('riskScore').isInt({ min: 0, max: 100 }).withMessage('Risk score must be between 0 and 100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { transactionId, riskScore } = req.query;
    const requiredMethods = verificationService.getRequiredVerificationMethods(parseInt(riskScore as string));

    const response: ApiResponse<typeof requiredMethods> = {
      success: true,
      data: requiredMethods,
      message: 'Required verification methods retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Get required methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Cancel verification
router.post('/:attemptId/cancel', [
  body('reason').optional().isString().withMessage('Reason must be a string'),
], async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { reason } = req.body;

    const success = verificationService.cancelVerificationSession(attemptId, reason);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Verification session not found'
      });
    }

    const response: ApiResponse<void> = {
      success: true,
      data: undefined,
      message: 'Verification cancelled successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Cancel verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get available verification methods for user
router.get('/users/:userId/available-methods', async (req, res) => {
  try {
    const { userId } = req.params;

    // In real implementation, check user's enrolled verification methods
    const availableMethods = {
      available: [
        VerificationMethod.SMS_CODE,
        VerificationMethod.EMAIL_CODE,
        VerificationMethod.SECURITY_QUESTIONS,
        VerificationMethod.PIN_VERIFICATION
      ],
      preferred: [
        VerificationMethod.SMS_CODE,
        VerificationMethod.SECURITY_QUESTIONS
      ],
      setupRequired: [
        VerificationMethod.BIOMETRIC,
        VerificationMethod.FACE_RECOGNITION,
        VerificationMethod.VOICE_VERIFICATION
      ]
    };

    const response: ApiResponse<typeof availableMethods> = {
      success: true,
      data: availableMethods,
      message: 'Available verification methods retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Get available methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Setup verification method
router.post('/users/:userId/setup/:method', [
  body('setupData').notEmpty().withMessage('Setup data is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId, method } = req.params;
    const { setupData } = req.body;

    // In real implementation, setup the verification method for the user
    const setupId = `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const response: ApiResponse<{
      setupId: string;
      instructions: string;
      expiresAt: string;
    }> = {
      success: true,
      data: {
        setupId,
        instructions: `Follow the on-screen instructions to setup ${method} verification`,
        expiresAt
      },
      message: 'Verification method setup initiated successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Setup verification method error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get verification methods
router.get('/methods', async (req, res) => {
  try {
    const methods = Object.values(VerificationMethod);

    const response: ApiResponse<VerificationMethod[]> = {
      success: true,
      data: methods,
      message: 'Verification methods retrieved successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Get verification methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
