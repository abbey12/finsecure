import { mockTransactions, mockAlerts, mockUsers } from './mockData';
import { DashboardStats, TransactionDecision, TransactionStatus, AlertSeverity } from '../types';

export class DashboardService {
  /**
   * Calculate real dashboard statistics from actual data
   */
  static getRealStats(): DashboardStats {
    const transactions = mockTransactions;
    const alerts = mockAlerts;
    const users = mockUsers;

    // Calculate total transactions
    const totalTransactions = transactions.length;

    // Calculate active users (users with recent transactions)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUserIds = new Set(
      transactions
        .filter(t => new Date(t.timestamp) >= thirtyDaysAgo)
        .map(t => t.userId)
    );
    const totalUsers = activeUserIds.size;

    // Calculate active alerts (non-resolved)
    const activeAlerts = alerts.filter(alert => 
      alert.status !== 'resolved' && alert.status !== 'closed'
    ).length;

    // Calculate fraud prevented (sum of denied transactions)
    const fraudPrevented = transactions
      .filter(t => t.decision === TransactionDecision.DENY)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate decision breakdown
    const decisions = {
      allow: transactions.filter(t => t.decision === TransactionDecision.ALLOW).length,
      challenge: transactions.filter(t => t.decision === TransactionDecision.CHALLENGE).length,
      deny: transactions.filter(t => t.decision === TransactionDecision.DENY).length
    };

    // Calculate risk score distribution
    const riskScore = {
      low: transactions.filter(t => t.riskScore < 25).length,
      medium: transactions.filter(t => t.riskScore >= 25 && t.riskScore < 50).length,
      high: transactions.filter(t => t.riskScore >= 50 && t.riskScore < 75).length
    };

    // Calculate alerts by severity
    const alertsBySeverity = {
      low: alerts.filter(a => a.severity === AlertSeverity.LOW).length,
      medium: alerts.filter(a => a.severity === AlertSeverity.MEDIUM).length,
      high: alerts.filter(a => a.severity === AlertSeverity.HIGH).length,
      critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length
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

  /**
   * Get real transaction chart data for the last N days
   */
  static getTransactionChartData(days: number): Array<{date: string, value: number}> {
    const transactions = mockTransactions;
    const chartData: Array<{date: string, value: number}> = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count transactions for this date
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

  /**
   * Get real risk distribution data
   */
  static getRiskDistributionData(): Array<{name: string, value: number}> {
    const transactions = mockTransactions;
    
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    transactions.forEach(transaction => {
      if (transaction.riskScore < 25) {
        riskDistribution.low++;
      } else if (transaction.riskScore < 50) {
        riskDistribution.medium++;
      } else if (transaction.riskScore < 75) {
        riskDistribution.high++;
      } else {
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

  /**
   * Get real decision breakdown data for the last N days
   */
  static getDecisionChartData(days: number): Array<{date: string, allow: number, challenge: number, deny: number}> {
    const transactions = mockTransactions;
    const chartData: Array<{date: string, allow: number, challenge: number, deny: number}> = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter transactions for this date
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.timestamp).toISOString().split('T')[0];
        return transactionDate === dateStr;
      });
      
      const decisions = {
        allow: dayTransactions.filter(t => t.decision === TransactionDecision.ALLOW).length,
        challenge: dayTransactions.filter(t => t.decision === TransactionDecision.CHALLENGE).length,
        deny: dayTransactions.filter(t => t.decision === TransactionDecision.DENY).length
      };
      
      chartData.push({
        date: dateStr,
        ...decisions
      });
    }
    
    return chartData;
  }

  /**
   * Get real alerts by severity
   */
  static getAlertsBySeverity(): Record<string, number> {
    const alerts = mockAlerts;
    
    const severityCount = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    alerts.forEach(alert => {
      switch (alert.severity) {
        case AlertSeverity.LOW:
          severityCount.low++;
          break;
        case AlertSeverity.MEDIUM:
          severityCount.medium++;
          break;
        case AlertSeverity.HIGH:
          severityCount.high++;
          break;
        case AlertSeverity.CRITICAL:
          severityCount.critical++;
          break;
      }
    });
    
    return severityCount;
  }

  /**
   * Get real recent activity
   */
  static getRecentActivity(limit: number = 10): Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    severity: string;
  }> {
    const transactions = mockTransactions;
    const alerts = mockAlerts;
    const users = mockUsers;
    
    const activities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      severity: string;
    }> = [];
    
    // Add recent transactions
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    
    recentTransactions.forEach(transaction => {
      const user = users.find(u => u.id === transaction.userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
      
      activities.push({
        id: `txn_${transaction.id}`,
        type: 'transaction',
        description: `${transaction.decision === TransactionDecision.ALLOW ? 'Transaction approved' : 
                     transaction.decision === TransactionDecision.CHALLENGE ? 'Transaction challenged' : 
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
    
    // Add recent alerts
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
    
    // Add recent user registrations
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
    
    // Sort all activities by timestamp and return the most recent
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get real top alerts
   */
  static getTopAlerts(limit: number = 5): Array<any> {
    return mockAlerts
      .sort((a, b) => {
        // Sort by severity (critical > high > medium > low) then by date
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const aSeverity = severityOrder[a.severity as keyof typeof severityOrder] || 0;
        const bSeverity = severityOrder[b.severity as keyof typeof severityOrder] || 0;
        
        if (aSeverity !== bSeverity) {
          return bSeverity - aSeverity;
        }
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);
  }
}
