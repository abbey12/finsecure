import express from 'express';
import { query, param, body, validationResult } from 'express-validator';
import { mockAlerts } from '../services/mockData';
import { ApiResponse, PaginatedResponse, Alert, AlertFilters } from '../types';

const router = express.Router();

// Get all alerts with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity value'),
  query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status value'),
  query('type').optional().isString().withMessage('Type must be a string'),
  query('userId').optional().isString().withMessage('User ID must be a string'),
  query('assignee').optional().isString().withMessage('Assignee must be a string')
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

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Build filters
    const filters: AlertFilters = {};
    if (req.query.severity) filters.severity = req.query.severity as any;
    if (req.query.status) filters.status = req.query.status as any;
    if (req.query.type) filters.type = req.query.type as any;
    if (req.query.userId) filters.userId = req.query.userId as string;
    if (req.query.assignee) filters.assignee = req.query.assignee as string;

    // Filter alerts
    let filteredAlerts = [...mockAlerts];

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

    // Apply pagination
    const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);
    const totalPages = Math.ceil(filteredAlerts.length / limit);

    const response: ApiResponse<PaginatedResponse<Alert>> = {
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
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single alert by ID
router.get('/:id', [
  param('id').isString().withMessage('Alert ID is required')
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
    const alert = mockAlerts.find(a => a.id === id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    const response: ApiResponse<Alert> = {
      success: true,
      data: alert
    };

    res.json(response);
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update alert
router.patch('/:id', [
  param('id').isString().withMessage('Alert ID is required'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status value'),
  body('assignee').optional().isString().withMessage('Assignee must be a string'),
  body('notes').optional().isArray().withMessage('Notes must be an array')
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
    const alertIndex = mockAlerts.findIndex(a => a.id === id);

    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    // Update alert
    const updatedAlert = { 
      ...mockAlerts[alertIndex], 
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    mockAlerts[alertIndex] = updatedAlert;

    const response: ApiResponse<Alert> = {
      success: true,
      data: updatedAlert,
      message: 'Alert updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get top alerts (for dashboard)
router.get('/top/:limit', [
  param('limit').isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const limit = parseInt(req.params.limit);
    
    // Sort by severity and creation date, get top N
    const topAlerts = [...mockAlerts]
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);

    const response: ApiResponse<Alert[]> = {
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
