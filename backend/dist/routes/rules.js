"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const types_1 = require("../types");
const router = express_1.default.Router();
const mockRules = [
    {
        id: 'rule_1',
        name: 'High Value Transaction',
        description: 'Flags transactions over $10,000',
        type: types_1.RuleType.AMOUNT_THRESHOLD,
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
        type: types_1.RuleType.VELOCITY_LIMIT,
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
        type: types_1.RuleType.LOCATION_ANOMALY,
        parameters: { country: 'GH', threshold: 0.1 },
        isActive: false,
        priority: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
router.get('/', (req, res) => {
    try {
        const response = {
            success: true,
            data: mockRules,
            message: 'Rules fetched successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=rules.js.map