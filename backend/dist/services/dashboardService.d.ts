import { DashboardStats } from '../types';
export declare class DashboardService {
    static getRealStats(): DashboardStats;
    static getTransactionChartData(days: number): Array<{
        date: string;
        value: number;
    }>;
    static getRiskDistributionData(): Array<{
        name: string;
        value: number;
    }>;
    static getDecisionChartData(days: number): Array<{
        date: string;
        allow: number;
        challenge: number;
        deny: number;
    }>;
    static getAlertsBySeverity(): Record<string, number>;
    static getRecentActivity(limit?: number): Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        severity: string;
    }>;
    static getTopAlerts(limit?: number): Array<any>;
}
//# sourceMappingURL=dashboardService.d.ts.map