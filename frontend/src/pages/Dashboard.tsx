import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  ExclamationTriangleIcon, 
  UsersIcon, 
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats, Alert } from '../types';
import { dashboardAPI } from '../services/api';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, chartResponse, riskResponse, alertsResponse] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getTransactionChart(7),
          dashboardAPI.getRiskDistribution(),
          dashboardAPI.getTopAlerts(5)
        ]);

        setStats(statsResponse.data);
        setChartData(chartResponse.data.transactions || []);
        setRiskData(riskResponse.data || []);
        setRecentAlerts(alertsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your financial security platform
        </p>
      </div>

      {/* Stats cards */}
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
                    Total Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalTransactions.toLocaleString()}
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
                <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalUsers.toLocaleString()}
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
                    Active Alerts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalAlerts.toLocaleString()}
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
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Fraud Prevented
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.fraudPrevented ? new Intl.NumberFormat('en-GH', {
                      style: 'currency',
                      currency: 'GHS',
                    }).format(stats.fraudPrevented) : '₵0'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction trends */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentAlerts.map((alert) => (
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
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Decisions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">
              {stats?.decisions.allow.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Allowed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600">
              {stats?.decisions.challenge.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Challenged</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger-600">
              {stats?.decisions.deny.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Denied</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 