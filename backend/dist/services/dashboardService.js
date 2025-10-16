"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const mockData_1 = require("./mockData");
const types_1 = require("../types");
class DashboardService {
    static getRealStats() {
        const transactions = mockData_1.mockTransactions;
        const alerts = mockData_1.mockAlerts;
        const users = mockData_1.mockUsers;
        const totalTransactions = transactions.length;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUserIds = new Set(transactions
            .filter(t => new Date(t.timestamp) >= thirtyDaysAgo)
            .map(t => t.userId));
        const totalUsers = activeUserIds.size;
        const activeAlerts = alerts.filter(alert => alert.status !== 'resolved' && alert.status !== 'closed').length;
        const fraudPrevented = transactions
            .filter(t => t.decision === types_1.TransactionDecision.DENY)
            .reduce((sum, t) => sum + t.amount, 0);
        const decisions = {
            allow: transactions.filter(t => t.decision === types_1.TransactionDecision.ALLOW).length,
            challenge: transactions.filter(t => t.decision === types_1.TransactionDecision.CHALLENGE).length,
            deny: transactions.filter(t => t.decision === types_1.TransactionDecision.DENY).length
        };
        const riskScore = {
            low: transactions.filter(t => t.riskScore < 25).length,
            medium: transactions.filter(t => t.riskScore >= 25 && t.riskScore < 50).length,
            high: transactions.filter(t => t.riskScore >= 50 && t.riskScore < 75).length
        };
        const alertsBySeverity = {
            low: alerts.filter(a => a.severity === types_1.AlertSeverity.LOW).length,
            medium: alerts.filter(a => a.severity === types_1.AlertSeverity.MEDIUM).length,
            high: alerts.filter(a => a.severity === types_1.AlertSeverity.HIGH).length,
            critical: alerts.filter(a => a.severity === types_1.AlertSeverity.CRITICAL).length
        };
        return {
            totalTransactions,
            totalUsers,
            totalAlerts: activeAlerts,
            fraudPrevented,
            riskScore,
            decisions,
            alertsBySeverity
        };
    }
    static getTransactionChartData(days) {
        const transactions = mockData_1.mockTransactions;
        const chartData = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.timestamp).toISOString().split('T')[0];
                return transactionDate === dateStr;
            });
            chartData.push({
                date: dateStr,
                value: dayTransactions.length
            });
        }
        return chartData;
    }
    static getRiskDistributionData() {
        const transactions = mockData_1.mockTransactions;
        const riskDistribution = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };
        transactions.forEach(transaction => {
            if (transaction.riskScore < 25) {
                riskDistribution.low++;
            }
            else if (transaction.riskScore < 50) {
                riskDistribution.medium++;
            }
            else if (transaction.riskScore < 75) {
                riskDistribution.high++;
            }
            else {
                riskDistribution.critical++;
            }
        });
        return [
            { name: 'Low Risk', value: riskDistribution.low },
            { name: 'Medium Risk', value: riskDistribution.medium },
            { name: 'High Risk', value: riskDistribution.high },
            { name: 'Critical Risk', value: riskDistribution.critical }
        ];
    }
    static getDecisionChartData(days) {
        const transactions = mockData_1.mockTransactions;
        const chartData = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.timestamp).toISOString().split('T')[0];
                return transactionDate === dateStr;
            });
            const decisions = {
                allow: dayTransactions.filter(t => t.decision === types_1.TransactionDecision.ALLOW).length,
                challenge: dayTransactions.filter(t => t.decision === types_1.TransactionDecision.CHALLENGE).length,
                deny: dayTransactions.filter(t => t.decision === types_1.TransactionDecision.DENY).length
            };
            chartData.push({
                date: dateStr,
                ...decisions
            });
        }
        return chartData;
    }
    static getAlertsBySeverity() {
        const alerts = mockData_1.mockAlerts;
        const severityCount = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };
        alerts.forEach(alert => {
            switch (alert.severity) {
                case types_1.AlertSeverity.LOW:
                    severityCount.low++;
                    break;
                case types_1.AlertSeverity.MEDIUM:
                    severityCount.medium++;
                    break;
                case types_1.AlertSeverity.HIGH:
                    severityCount.high++;
                    break;
                case types_1.AlertSeverity.CRITICAL:
                    severityCount.critical++;
                    break;
            }
        });
        return severityCount;
    }
    static getRecentActivity(limit = 10) {
        const transactions = mockData_1.mockTransactions;
        const alerts = mockData_1.mockAlerts;
        const users = mockData_1.mockUsers;
        const activities = [];
        const recentTransactions = transactions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
        recentTransactions.forEach(transaction => {
            const user = users.find(u => u.id === transaction.userId);
            const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
            activities.push({
                id: `txn_${transaction.id}`,
                type: 'transaction',
                description: `${transaction.decision === types_1.TransactionDecision.ALLOW ? 'Transaction approved' :
                    transaction.decision === types_1.TransactionDecision.CHALLENGE ? 'Transaction challenged' :
                        'Transaction denied'} - ${new Intl.NumberFormat('en-GH', {
                    style: 'currency',
                    currency: 'GHS',
                }).format(transaction.amount)} by ${userName}`,
                timestamp: transaction.timestamp,
                severity: transaction.riskScore < 25 ? 'low' :
                    transaction.riskScore < 50 ? 'medium' :
                        transaction.riskScore < 75 ? 'high' : 'critical'
            });
        });
        const recentAlerts = alerts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
        recentAlerts.forEach(alert => {
            activities.push({
                id: `alert_${alert.id}`,
                type: 'alert',
                description: `${alert.title} - ${alert.description}`,
                timestamp: alert.createdAt,
                severity: alert.severity.toLowerCase()
            });
        });
        const recentUsers = users
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 2);
        recentUsers.forEach(user => {
            activities.push({
                id: `user_${user.id}`,
                type: 'user',
                description: `New user registered - ${user.email}`,
                timestamp: user.createdAt,
                severity: 'medium'
            });
        });
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }
    static getTopAlerts(limit = 5) {
        return mockData_1.mockAlerts
            .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const aSeverity = severityOrder[a.severity] || 0;
            const bSeverity = severityOrder[b.severity] || 0;
            if (aSeverity !== bSeverity) {
                return bSeverity - aSeverity;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
            .slice(0, limit);
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboardService.js.map