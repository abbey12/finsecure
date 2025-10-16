import { User, Transaction, Alert, DashboardStats, VerificationAttempt } from '../types';
export declare const mockUsers: User[];
export declare let mockTransactions: Transaction[];
export declare const mockAlerts: Alert[];
export declare const mockDashboardStats: DashboardStats;
export declare const mockChartData: {
    transactions: {
        date: string;
        value: number;
    }[];
    decisions: {
        date: string;
        value: number;
    }[];
    riskScores: {
        date: string;
        value: number;
    }[];
};
export declare const mockRiskDistribution: {
    name: string;
    value: number;
}[];
export declare const mockVerificationAttempts: VerificationAttempt[];
export declare const clearAllTransactions: () => void;
export declare const getTransactionCount: () => number;
export declare const addTransaction: (transaction: Transaction) => void;
export declare const removeTransaction: (transactionId: string) => boolean;
//# sourceMappingURL=mockData.d.ts.map