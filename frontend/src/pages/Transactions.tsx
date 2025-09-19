import React, { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Transaction, TransactionDecision, TransactionFilters } from '../types';
import { transactionsAPI } from '../services/api';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await transactionsAPI.getTransactions(filters, currentPage, 20);
      setTransactions(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchTerm);
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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and analyze transaction activity
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="btn-primary"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search transactions..."
              />
            </form>
          </div>

          {/* Decision filter */}
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.decision || ''}
              onChange={(e) => setFilters({ ...filters, decision: e.target.value as TransactionDecision || undefined })}
            >
              <option value="">All Decisions</option>
              <option value="allow">Allowed</option>
              <option value="challenge">Challenged</option>
              <option value="deny">Denied</option>
            </select>
          </div>

          {/* Risk score filter */}
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.riskScore?.min || ''}
              onChange={(e) => {
                const minValue = e.target.value ? parseInt(e.target.value) : undefined;
                if (minValue !== undefined) {
                  setFilters({ 
                    ...filters, 
                    riskScore: { 
                      min: minValue,
                      max: minValue === 0 ? 30 : minValue === 30 ? 70 : 100
                    } 
                  });
                } else {
                  const { riskScore, ...restFilters } = filters;
                  setFilters(restFilters);
                }
              }}
            >
              <option value="">All Risk Levels</option>
              <option value="0">Low Risk (0-30)</option>
              <option value="30">Medium Risk (30-70)</option>
              <option value="70">High Risk (70-100)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <div className="px-4 py-4 sm:px-6">
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
                        <p>ID: {transaction.id}</p>
                        <span className="mx-2">•</span>
                        <p>{formatDate(transaction.timestamp)}</p>
                        <span className="mx-2">•</span>
                        <p>Risk: {transaction.riskScore}</p>
                      </div>
                      {transaction.reasons.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">
                            Reasons: {transaction.reasons.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {transaction.channel.replace('_', ' ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions; 