import express from 'express';
import { query, validationResult } from 'express-validator';
import { ApiResponse, VerificationAttempt, VerificationMethod, VerificationResult, PaginatedResponse } from '../types';
import { mockVerificationAttempts } from '../services/mockData';

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

export default router;
