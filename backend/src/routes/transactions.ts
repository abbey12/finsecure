import express from 'express';
import { query, param, body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { mockTransactions } from '../services/mockData';
import { ApiResponse, PaginatedResponse, Transaction, TransactionFilters, TransactionDecision, TransactionStatus, CreateTransactionRequest, TransactionChannel, LocationSource } from '../types';

const router = express.Router();

// Create new transaction
router.post('/', [
  body('userId').isString().withMessage('User ID is required'),
  body('deviceId').isString().withMessage('Device ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isString().withMessage('Currency is required'),
  body('merchant').optional().isString().withMessage('Merchant must be a string'),
  body('payee').optional().isString().withMessage('Payee must be a string'),
  body('channel').isIn(['mobile_app', 'web', 'api', 'pos']).withMessage('Invalid channel'),
  body('ipAddress').optional().isIP().withMessage('Invalid IP address'),
  body('location.latitude').optional().isFloat().withMessage('Invalid latitude'),
  body('location.longitude').optional().isFloat().withMessage('Invalid longitude'),
  body('location.country').optional().isString().withMessage('Country must be a string'),
  body('location.city').optional().isString().withMessage('City must be a string'),
  body('location.region').optional().isString().withMessage('Region must be a string')
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

    const transactionData: CreateTransactionRequest = req.body;
    
    // Generate transaction ID
    const transactionId = `txn_${uuidv4().substring(0, 8)}`;
    
    // Get client IP if not provided
    const ipAddress = transactionData.ipAddress || req.ip || '127.0.0.1';
    
    // Default location to Accra, Ghana if not provided
    const location = transactionData.location || {
      latitude: 5.6037,
      longitude: -0.1870,
      source: LocationSource.GPS,
      country: 'GH',
      city: 'Accra',
      region: 'Greater Accra'
    };

    // Risk Assessment Logic
    let riskScore = 0;
    const reasons: string[] = [];
    
    // Amount-based risk
    if (transactionData.amount > 10000) {
      riskScore += 40;
      reasons.push('high_amount');
    } else if (transactionData.amount > 5000) {
      riskScore += 20;
      reasons.push('medium_amount');
    } else {
      reasons.push('normal_amount');
    }

    // Time-based risk (night transactions)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      riskScore += 25;
      reasons.push('unusual_time');
    }

    // Merchant-based risk
    if (!transactionData.merchant || transactionData.merchant.toLowerCase().includes('unknown')) {
      riskScore += 30;
      reasons.push('new_merchant');
    } else {
      reasons.push('known_merchant');
    }

    // Location-based risk
    if (location.country !== 'GH') {
      riskScore += 35;
      reasons.push('foreign_location');
    } else {
      reasons.push('local_location');
    }

    // Channel-based risk
    if (transactionData.channel === TransactionChannel.API) {
      riskScore += 15;
      reasons.push('api_channel');
    }

    // Velocity check (simplified - in real system, check user's transaction history)
    const userRecentTransactions = mockTransactions.filter(t => 
      t.userId === transactionData.userId && 
      new Date(t.timestamp) > new Date(Date.now() - 3600000) // Last hour
    );
    
    if (userRecentTransactions.length > 5) {
      riskScore += 20;
      reasons.push('velocity_exceeded');
    }

    // Determine decision based on risk score
    let decision: TransactionDecision;
    let status: TransactionStatus;
    
    if (riskScore >= 80) {
      decision = TransactionDecision.DENY;
      status = TransactionStatus.FAILED;
    } else if (riskScore >= 50) {
      decision = TransactionDecision.CHALLENGE;
      status = TransactionStatus.PENDING;
    } else {
      decision = TransactionDecision.ALLOW;
      status = TransactionStatus.COMPLETED;
    }

    // Create new transaction
    const newTransaction: Transaction = {
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
      riskScore: Math.min(riskScore, 100), // Cap at 100
      reasons,
      status
    };

    // Add to mock data
    mockTransactions.unshift(newTransaction); // Add to beginning for recent transactions

    const response: ApiResponse<Transaction> = {
      success: true,
      data: newTransaction,
      message: 'Transaction created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all transactions with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('decision').optional().isIn(['allow', 'challenge', 'deny']).withMessage('Invalid decision value'),
  query('riskScoreMin').optional().isInt({ min: 0, max: 100 }).withMessage('Risk score min must be between 0 and 100'),
  query('riskScoreMax').optional().isInt({ min: 0, max: 100 }).withMessage('Risk score max must be between 0 and 100'),
  query('userId').optional().isString().withMessage('User ID must be a string'),
  query('merchant').optional().isString().withMessage('Merchant must be a string')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Build filters
    const filters: TransactionFilters = {};
    if (req.query.decision) filters.decision = req.query.decision as TransactionDecision;
    if (req.query.riskScoreMin || req.query.riskScoreMax) {
      filters.riskScore = {
        min: parseInt(req.query.riskScoreMin as string) || 0,
        max: parseInt(req.query.riskScoreMax as string) || 100
      };
    }
    if (req.query.userId) filters.userId = req.query.userId as string;
    if (req.query.merchant) filters.merchant = req.query.merchant as string;

    // Filter transactions
    let filteredTransactions = [...mockTransactions];

    if (filters.decision) {
      filteredTransactions = filteredTransactions.filter(t => t.decision === filters.decision);
    }

    if (filters.riskScore) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.riskScore >= filters.riskScore!.min && 
        t.riskScore <= filters.riskScore!.max
      );
    }

    if (filters.userId) {
      filteredTransactions = filteredTransactions.filter(t => t.userId === filters.userId);
    }

    if (filters.merchant) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.merchant?.toLowerCase().includes(filters.merchant!.toLowerCase())
      );
    }

    // Apply pagination
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);
    const totalPages = Math.ceil(filteredTransactions.length / limit);

    const response: ApiResponse<PaginatedResponse<Transaction>> = {
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
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single transaction by ID
router.get('/:id', [
  param('id').isString().withMessage('Transaction ID is required')
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

    const { id } = req.params;
    const transaction = mockTransactions.find(t => t.id === id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    const response: ApiResponse<Transaction> = {
      success: true,
      data: transaction
    };

    res.json(response);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update transaction decision
router.patch('/:id/decision', [
  param('id').isString().withMessage('Transaction ID is required'),
  body('decision').isIn(['allow', 'challenge', 'deny']).withMessage('Invalid decision value'),
  body('reasons').isArray().withMessage('Reasons must be an array'),
  body('notes').optional().isString().withMessage('Notes must be a string')
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

    const { id } = req.params;
    const { decision, reasons, notes } = req.body;

    const transactionIndex = mockTransactions.findIndex(t => t.id === id);
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Update transaction
    mockTransactions[transactionIndex].decision = decision;
    mockTransactions[transactionIndex].reasons = reasons;
    mockTransactions[transactionIndex].status = decision === 'allow' ? TransactionStatus.COMPLETED : 
                                             decision === 'deny' ? TransactionStatus.FAILED : TransactionStatus.PENDING;

    const response: ApiResponse<Transaction> = {
      success: true,
      data: mockTransactions[transactionIndex],
      message: 'Transaction decision updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Update transaction decision error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get transaction events (mock implementation)
router.get('/:id/events', [
  param('id').isString().withMessage('Transaction ID is required')
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

    const { id } = req.params;
    const transaction = mockTransactions.find(t => t.id === id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Mock events data
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

    const response: ApiResponse<any[]> = {
      success: true,
      data: events
    };

    res.json(response);
  } catch (error) {
    console.error('Get transaction events error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Clear all transactions (Admin only)
router.delete('/clear-all', async (req, res) => {
  try {
    // Import the clear function
    const { clearAllTransactions, getTransactionCount } = await import('../services/mockData');
    
    // Get count before clearing
    const countBefore = getTransactionCount();
    
    // Clear all transactions
    clearAllTransactions();
    
    const response: ApiResponse<{
      clearedCount: number;
      message: string;
    }> = {
      success: true,
      data: {
        clearedCount: countBefore,
        message: `Successfully cleared ${countBefore} transactions from the database`
      },
      message: 'All transactions have been cleared'
    };

    res.json(response);
  } catch (error) {
    console.error('Clear all transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
