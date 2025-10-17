import React, { useState, useEffect } from 'react';
import { RuleConfig, RuleType } from '../types';
import { rulesAPI } from '../services/api';
import { 
  PlusIcon, 
  CogIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Rules: React.FC = () => {
  const [rules, setRules] = useState<RuleConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showRiskConfig, setShowRiskConfig] = useState(false);
  const [riskSettings, setRiskSettings] = useState({
    lowRiskThreshold: 40,
    mediumRiskThreshold: 60,
    highRiskThreshold: 80,
    criticalRiskThreshold: 90
  });
  const [amountThresholds, setAmountThresholds] = useState({
    suspiciousAmount: 1000,      // Flag transactions above this amount
    highRiskAmount: 5000,        // High risk threshold
    criticalAmount: 10000,       // Critical risk threshold
    dailyLimit: 20000,           // Daily transaction limit
    weeklyLimit: 50000           // Weekly transaction limit
  });

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await rulesAPI.getRules();
        setRules(response.data);
      } catch (err) {
        console.error('Error fetching rules:', err);
        setError('Failed to fetch rules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const getRuleTypeColor = (type: RuleType) => {
    switch (type) {
      case RuleType.AMOUNT_THRESHOLD:
        return 'bg-blue-100 text-blue-800';
      case RuleType.VELOCITY_LIMIT:
        return 'bg-green-100 text-green-800';
      case RuleType.LOCATION_ANOMALY:
        return 'bg-yellow-100 text-yellow-800';
      case RuleType.DEVICE_CHANGE:
        return 'bg-purple-100 text-purple-800';
      case RuleType.NEW_PAYEE:
        return 'bg-indigo-100 text-indigo-800';
      case RuleType.TIME_ANOMALY:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const handleRiskSettingsChange = (field: string, value: number) => {
    setRiskSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmountThresholdChange = (field: string, value: number) => {
    setAmountThresholds(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveRiskSettings = () => {
    // In a real implementation, save to backend
    console.log('Saving risk settings:', riskSettings);
    console.log('Saving amount thresholds:', amountThresholds);
    setShowRiskConfig(false);
    // Show success message
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rules & Risk Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage fraud detection rules and risk thresholds.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowRiskConfig(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Risk Settings
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Risk Configuration Modal */}
      {showRiskConfig && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Risk & Amount Configuration</h3>
                <button
                  onClick={() => setShowRiskConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Level Configuration */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Risk Level Thresholds</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Risk Threshold (0 - {riskSettings.mediumRiskThreshold - 1})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="39"
                    value={riskSettings.lowRiskThreshold}
                    onChange={(e) => handleRiskSettingsChange('lowRiskThreshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span className="font-medium text-green-600">{riskSettings.lowRiskThreshold}</span>
                    <span>39</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium Risk Threshold ({riskSettings.lowRiskThreshold + 1} - {riskSettings.highRiskThreshold - 1})
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="79"
                    value={riskSettings.mediumRiskThreshold}
                    onChange={(e) => handleRiskSettingsChange('mediumRiskThreshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>40</span>
                    <span className="font-medium text-yellow-600">{riskSettings.mediumRiskThreshold}</span>
                    <span>79</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    High Risk Threshold ({riskSettings.mediumRiskThreshold + 1} - {riskSettings.criticalRiskThreshold - 1})
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="89"
                    value={riskSettings.highRiskThreshold}
                    onChange={(e) => handleRiskSettingsChange('highRiskThreshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>60</span>
                    <span className="font-medium text-orange-600">{riskSettings.highRiskThreshold}</span>
                    <span>89</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Critical Risk Threshold ({riskSettings.highRiskThreshold + 1} - 100)
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="100"
                    value={riskSettings.criticalRiskThreshold}
                    onChange={(e) => handleRiskSettingsChange('criticalRiskThreshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>80</span>
                    <span className="font-medium text-red-600">{riskSettings.criticalRiskThreshold}</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
                </div>

                {/* Amount Threshold Configuration */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Amount Thresholds (GHS)</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suspicious Amount Threshold
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={amountThresholds.suspiciousAmount}
                          onChange={(e) => handleAmountThresholdChange('suspiciousAmount', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="100"
                        />
                        <span className="text-sm text-gray-500">GHS</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Transactions above this amount will be flagged for review</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        High Risk Amount Threshold
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={amountThresholds.highRiskAmount}
                          onChange={(e) => handleAmountThresholdChange('highRiskAmount', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="100"
                        />
                        <span className="text-sm text-gray-500">GHS</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Requires enhanced verification</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Critical Amount Threshold
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={amountThresholds.criticalAmount}
                          onChange={(e) => handleAmountThresholdChange('criticalAmount', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="100"
                        />
                        <span className="text-sm text-gray-500">GHS</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Requires all verification methods</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Transaction Limit
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={amountThresholds.dailyLimit}
                          onChange={(e) => handleAmountThresholdChange('dailyLimit', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="100"
                        />
                        <span className="text-sm text-gray-500">GHS</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Maximum daily transaction amount per user</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weekly Transaction Limit
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={amountThresholds.weeklyLimit}
                          onChange={(e) => handleAmountThresholdChange('weeklyLimit', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="100"
                        />
                        <span className="text-sm text-gray-500">GHS</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Maximum weekly transaction amount per user</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRiskConfig(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRiskSettings}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Level Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Risk Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-900">Low Risk</h3>
                <p className="text-xs text-green-700">0 - {riskSettings.mediumRiskThreshold - 1}</p>
                <p className="text-xs text-green-600 mt-1">SMS verification only</p>
                <p className="text-xs text-green-500 mt-1">Amount: &lt; {amountThresholds.suspiciousAmount} GHS</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900">Medium Risk</h3>
                <p className="text-xs text-yellow-700">{riskSettings.lowRiskThreshold + 1} - {riskSettings.highRiskThreshold - 1}</p>
                <p className="text-xs text-yellow-600 mt-1">SMS + Security Questions</p>
                <p className="text-xs text-yellow-500 mt-1">Amount: {amountThresholds.suspiciousAmount} - {amountThresholds.highRiskAmount - 1} GHS</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-orange-900">High Risk</h3>
                <p className="text-xs text-orange-700">{riskSettings.mediumRiskThreshold + 1} - {riskSettings.criticalRiskThreshold - 1}</p>
                <p className="text-xs text-orange-600 mt-1">Biometric + SMS + Security</p>
                <p className="text-xs text-orange-500 mt-1">Amount: {amountThresholds.highRiskAmount} - {amountThresholds.criticalAmount - 1} GHS</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-900">Critical Risk</h3>
                <p className="text-xs text-red-700">{riskSettings.highRiskThreshold + 1} - 100</p>
                <p className="text-xs text-red-600 mt-1">All verification methods</p>
                <p className="text-xs text-red-500 mt-1">Amount: &gt;= {amountThresholds.criticalAmount} GHS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Thresholds Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Amount Thresholds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-blue-900">Suspicious Amount</h3>
              <p className="text-lg font-bold text-blue-600">{amountThresholds.suspiciousAmount.toLocaleString()} GHS</p>
              <p className="text-xs text-blue-500 mt-1">Flag for review</p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-orange-900">High Risk Amount</h3>
              <p className="text-lg font-bold text-orange-600">{amountThresholds.highRiskAmount.toLocaleString()} GHS</p>
              <p className="text-xs text-orange-500 mt-1">Enhanced verification</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-red-900">Critical Amount</h3>
              <p className="text-lg font-bold text-red-600">{amountThresholds.criticalAmount.toLocaleString()} GHS</p>
              <p className="text-xs text-red-500 mt-1">All verification methods</p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-purple-900">Daily Limit</h3>
              <p className="text-lg font-bold text-purple-600">{amountThresholds.dailyLimit.toLocaleString()} GHS</p>
              <p className="text-xs text-purple-500 mt-1">Per user per day</p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-indigo-900">Weekly Limit</h3>
              <p className="text-lg font-bold text-indigo-600">{amountThresholds.weeklyLimit.toLocaleString()} GHS</p>
              <p className="text-xs text-indigo-500 mt-1">Per user per week</p>
            </div>
          </div>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="text-center mt-8 text-gray-500">
          No rules found.
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Rule Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Priority
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created At
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {rules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {rule.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getRuleTypeColor(rule.type)}
                            `}>
                            {rule.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{rule.description}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            `}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{rule.priority}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a href={`/rules/${rule.id}`} className="text-primary-600 hover:text-primary-900">
                            Edit<span className="sr-only">, {rule.name}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rules;
