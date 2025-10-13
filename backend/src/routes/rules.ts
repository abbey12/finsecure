import express from 'express';
import { ApiResponse } from '../types';
import { RuleConfig, RuleType } from '../types';

const router = express.Router();

// Mock data for rules
const mockRules: RuleConfig[] = [
  {
    id: 'rule_1',
    name: 'High Value Transaction',
    description: 'Flags transactions over $10,000',
    type: RuleType.AMOUNT_THRESHOLD,
    parameters: { threshold: 10000 },
    isActive: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_2',
    name: 'Velocity Check',
    description: 'Flags more than 5 transactions in 1 hour',
    type: RuleType.VELOCITY_LIMIT,
    parameters: { count: 5, timeWindow: '1h' },
    isActive: true,
    priority: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_3',
    name: 'International Transaction Anomaly',
    description: 'Flags transactions from unusual countries',
    type: RuleType.LOCATION_ANOMALY,
    parameters: { country: 'GH', threshold: 0.1 },
    isActive: false,
    priority: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Get all rules
router.get('/', (req, res) => {
  try {
    const response: ApiResponse<RuleConfig[]> = {
      success: true,
      data: mockRules,
      message: 'Rules fetched successfully',
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
