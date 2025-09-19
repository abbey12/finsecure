import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCardIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionDecision, Alert } from '../types';
import { transactionsAPI, alertsAPI, dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [personalAlerts, setPersonalAlerts] = useState<Alert[]>([]);
  const [transactionChart, setTransactionChart] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [securityScore] = useState(85);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user's recent transactions
        const transactionsResponse = await transactionsAPI.getTransactions({}, 1, 5);
        setRecentTransactions(transactionsResponse.data || []);

        // Fetch user's personal alerts
        const alertsResponse = await alertsAPI.getAlerts({}, 1, 5);
        setPersonalAlerts(alertsResponse.data || []);

        // Fetch transaction chart data for the user
        const chartResponse = await dashboardAPI.getTransactionChart(7);
        setTransactionChart(chartResponse.data.transactions || []);

      } catch (error) {
        console.error('Error fetching user dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getDecisionIcon = (decision: TransactionDecision) => {
    switch (decision) {
      case TransactionDecision.ALLOW:
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case TransactionDecision.CHALLENGE:
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />;
      case TransactionDecision.DENY:
        return <XCircleIcon className="h-5 w-5 text-danger-500" />;
      default:
        return null;
    }
  };

  const getDecisionColor = (decision: TransactionDecision) => {
    switch (decision) {
      case TransactionDecision.ALLOW:
        return 'bg-success-100 text-success-800';
      case TransactionDecision.CHALLENGE:
        return 'bg-warning-100 text-warning-800';
      case TransactionDecision.DENY:
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-success-100 text-success-800';
      case 'medium':
        return 'bg-warning-100 text-warning-800';
      case 'high':
        return 'bg-danger-100 text-danger-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your account security
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/create-transaction')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Make Payment
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-500">Security Score</div>
              <div className={`text-3xl font-bold ${getSecurityScoreColor(securityScore)}`}>
                {securityScore}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {recentTransactions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Security Alerts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {personalAlerts.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Trusted Devices
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    3
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Account Status
                  </dt>
                  <dd className="text-lg font-medium text-success-600">
                    Secure
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Activity Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Transaction Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transactionChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            <button className="text-sm text-primary-600 hover:text-primary-500">
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {getDecisionIcon(transaction.decision)}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.merchant || transaction.payee || 'Unknown'}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDecisionColor(transaction.decision)}`}>
                        {transaction.decision}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <p>{formatDate(transaction.timestamp)}</p>
                      {transaction.location && (
                        <>
                          <span className="mx-2">•</span>
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <p>{transaction.location.city}, {transaction.location.region}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Risk: {transaction.riskScore}
                    </p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-900">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Alerts */}
      {personalAlerts.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Security Alerts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {personalAlerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-500">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-success-500" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Enable Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <DevicePhoneMobileIcon className="h-6 w-6 text-primary-500" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Review Trusted Devices</h4>
              <p className="text-sm text-gray-500 mt-1">
                Regularly check and remove unknown devices
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <EyeIcon className="h-6 w-6 text-warning-500" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Monitor Transactions</h4>
              <p className="text-sm text-gray-500 mt-1">
                Review your transaction history regularly
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-danger-500" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Report Suspicious Activity</h4>
              <p className="text-sm text-gray-500 mt-1">
                Contact support immediately if you notice anything unusual
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 