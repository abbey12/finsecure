import express from 'express';
import { query, validationResult } from 'express-validator';
import { mockDashboardStats, mockChartData, mockRiskDistribution } from '../services/mockData';
import { ApiResponse, DashboardStats } from '../types';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: mockDashboardStats
    };

    res.json(response);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get transaction chart data
router.get('/chart/transactions', [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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

    const days = parseInt(req.query.days as string) || 7;
    
    // Generate mock data for the specified number of days
    const chartData: Array<{date: string, value: number}> = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 200) + 50 // Random value between 50-250
      });
    }

    const response: ApiResponse<any> = {
      success: true,
      data: {
        transactions: chartData
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get transaction chart error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get risk distribution data
router.get('/chart/risk-distribution', async (req, res) => {
  try {
    const response: ApiResponse<any[]> = {
      success: true,
      data: mockRiskDistribution
    };

    res.json(response);
  } catch (error) {
    console.error('Get risk distribution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get decision breakdown data
router.get('/chart/decisions', [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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

    const days = parseInt(req.query.days as string) || 7;
    
    // Generate mock decision data for the specified number of days
    const decisionData: Array<{date: string, allow: number, challenge: number, deny: number}> = [];
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

    const response: ApiResponse<any> = {
      success: true,
      data: {
        decisions: decisionData
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get decision chart error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get alerts by severity
router.get('/chart/alerts-by-severity', async (req, res) => {
  try {
    const alertsBySeverity = {
      low: 45,
      medium: 25,
      high: 15,
      critical: 4
    };

    const response: ApiResponse<any> = {
      success: true,
      data: alertsBySeverity
    };

    res.json(response);
  } catch (error) {
    console.error('Get alerts by severity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get recent activity (mock implementation)
router.get('/recent-activity', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const limit = parseInt(req.query.limit as string) || 10;
    
    // Mock recent activity data
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

    const response: ApiResponse<any[]> = {
      success: true,
      data: recentActivity
    };

    res.json(response);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
