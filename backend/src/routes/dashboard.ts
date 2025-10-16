import express from 'express';
import { query, validationResult } from 'express-validator';
import { DashboardService } from '../services/dashboardService';
import { ApiResponse, DashboardStats } from '../types';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const realStats = DashboardService.getRealStats();
    
    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: realStats
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
    
    // Get real transaction data for the specified number of days
    const chartData = DashboardService.getTransactionChartData(days);

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
    const realRiskData = DashboardService.getRiskDistributionData();
    
    const response: ApiResponse<any[]> = {
      success: true,
      data: realRiskData
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
    
    // Get real decision data for the specified number of days
    const decisionData = DashboardService.getDecisionChartData(days);

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
    const alertsBySeverity = DashboardService.getAlertsBySeverity();

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

// Get recent activity
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
    
    // Get real recent activity data
    const recentActivity = DashboardService.getRecentActivity(limit);

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

// Get top alerts
router.get('/top-alerts', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
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

    const limit = parseInt(req.query.limit as string) || 5;
    
    // Get real top alerts data
    const topAlerts = DashboardService.getTopAlerts(limit);

    const response: ApiResponse<any[]> = {
      success: true,
      data: topAlerts
    };

    res.json(response);
  } catch (error) {
    console.error('Get top alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
