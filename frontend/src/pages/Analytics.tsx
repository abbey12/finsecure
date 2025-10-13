import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ApiResponse, ChartDataPoint, DashboardStats } from '../types';
import { dashboardAPI } from '../services/api';

const Analytics: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [transactionChartData, setTransactionChartData] = useState<ChartDataPoint[]>([]);
  const [riskDistributionData, setRiskDistributionData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsResponse, transactionChartResponse, riskDistributionResponse] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getTransactionChart(30), // Fetch for last 30 days
          dashboardAPI.getRiskDistribution(),
        ]);

        setDashboardStats(statsResponse.data);
        setTransactionChartData(transactionChartResponse.data.transactions || []);
        setRiskDistributionData(riskDistributionResponse.data || []);

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to fetch analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">In-depth analysis and insights into your financial security data.</p>
      </div>

      {dashboardStats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
            <p className="text-lg font-medium text-gray-900">{dashboardStats.totalTransactions.toLocaleString()}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">Total Alerts</p>
            <p className="text-lg font-medium text-gray-900">{dashboardStats.totalAlerts.toLocaleString()}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">Fraud Prevented</p>
            <p className="text-lg font-medium text-gray-900">{new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(dashboardStats.fraudPrevented)}</p>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <p className="text-lg font-medium text-gray-900">{dashboardStats.totalUsers.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Trends (Last 30 Days)</h3>
          <div className="h-64">
            {transactionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">No transaction data available.</div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Distribution</h3>
          <div className="h-64">
            {riskDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#F59E0B" name="Risk Level" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">No risk distribution data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
