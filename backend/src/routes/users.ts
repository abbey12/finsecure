import express from 'express';
import { query, param, body, validationResult } from 'express-validator';
import { mockUsers } from '../services/mockData';
import { ApiResponse, PaginatedResponse, User } from '../types';

const router = express.Router();

// Get all users with pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'analyst', 'regular']).withMessage('Invalid role value'),
  query('status').optional().isIn(['active', 'locked', 'suspended']).withMessage('Invalid status value'),
  query('search').optional().isString().withMessage('Search must be a string')
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

    // Filter users
    let filteredUsers = [...mockUsers];

    if (req.query.role) {
      filteredUsers = filteredUsers.filter(u => u.role === req.query.role);
    }

    if (req.query.status) {
      filteredUsers = filteredUsers.filter(u => u.status === req.query.status);
    }

    if (req.query.search) {
      const searchTerm = (req.query.search as string).toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.firstName.toLowerCase().includes(searchTerm) ||
        u.lastName.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);
    const totalPages = Math.ceil(filteredUsers.length / limit);

    // Remove password from response
    const usersWithoutPassword = paginatedUsers.map(({ password, ...user }) => user);

    const response: ApiResponse<PaginatedResponse<Omit<User, 'password'>>> = {
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
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single user by ID
router.get('/:id', [
  param('id').isString().withMessage('User ID is required')
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
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    const response: ApiResponse<Omit<User, 'password'>> = {
      success: true,
      data: userWithoutPassword
    };

    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user
router.patch('/:id', [
  param('id').isString().withMessage('User ID is required'),
  body('firstName').optional().isString().withMessage('First name must be a string'),
  body('lastName').optional().isString().withMessage('Last name must be a string'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'analyst', 'regular']).withMessage('Invalid role value'),
  body('status').optional().isIn(['active', 'locked', 'suspended']).withMessage('Invalid status value'),
  body('mfaEnabled').optional().isBoolean().withMessage('MFA enabled must be a boolean')
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
    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user
    const updatedUser = { ...mockUsers[userIndex], ...req.body };
    mockUsers[userIndex] = updatedUser;

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    const response: ApiResponse<Omit<User, 'password'>> = {
      success: true,
      data: userWithoutPassword,
      message: 'User updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete user
router.delete('/:id', [
  param('id').isString().withMessage('User ID is required')
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
    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // In a real app, you would soft delete or archive the user
    // For demo purposes, we'll just return success
    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'User deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
