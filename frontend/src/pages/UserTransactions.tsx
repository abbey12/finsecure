import React, { useState, useEffect } from 'react';
import { Transaction, TransactionDecision, TransactionFilters, PaginatedResponse, TransactionStatus } from '../types';
import { transactionsAPI, verificationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  EyeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import EnhancedVerification from '../components/EnhancedVerification';

const UserTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showVerification, setShowVerification] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactionsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);
      try {
        const response = await transactionsAPI.getTransactions({
          ...filters,
          userId: user.id, // Filter transactions for the current user
        }, currentPage, transactionsPerPage);
        setTransactions(response.data.data || []);
        setTotalResults(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to fetch transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, currentPage, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === 'all' ? undefined : value,
    }));
    setCurrentPage(1);
  };

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
    return new Date(dateString).toLocaleDateString();
  };

  const handleStartVerification = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowVerification(true);
  };

  const handleVerificationComplete = async (result: any) => {
    if (result === 'success') {
      // Refresh transactions to show updated status
      const response = await transactionsAPI.getTransactions({
        ...filters,
        userId: user?.id,
      }, currentPage, transactionsPerPage);
      setTransactions(response.data.data || []);
    }
    setShowVerification(false);
    setSelectedTransaction(null);
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
    setSelectedTransaction(null);
  };

  const getStatusIcon = (status: TransactionStatus, decision: TransactionDecision) => {
    if (status === TransactionStatus.PENDING && decision === TransactionDecision.CHALLENGE) {
      return <ShieldCheckIcon className="h-5 w-5 text-yellow-500" />;
    }
    return getDecisionIcon(decision);
  };

  const getStatusColor = (status: TransactionStatus, decision: TransactionDecision) => {
    if (status === TransactionStatus.PENDING && decision === TransactionDecision.CHALLENGE) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return getDecisionColor(decision);
  };

  const getStatusText = (status: TransactionStatus, decision: TransactionDecision) => {
    if (status === TransactionStatus.PENDING && decision === TransactionDecision.CHALLENGE) {
      return 'Verification Required';
    }
    return decision;
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

  // Show verification component if needed
  if (showVerification && selectedTransaction) {
    return (
      <EnhancedVerification
        transactionId={selectedTransaction.id}
        riskScore={selectedTransaction.riskScore}
        onVerificationComplete={handleVerificationComplete}
        onVerificationCancel={handleVerificationCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Transactions</h1>
        <p className="mt-1 text-sm text-gray-500">Review your personal transaction history.</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Decision Filter */}
        <select
          name="decision"
          value={filters.decision || 'all'}
          onChange={handleFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Decisions</option>
          {Object.values(TransactionDecision).map((decision) => (
            <option key={decision} value={decision}>
              {decision.charAt(0).toUpperCase() + decision.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {transactions.length === 0 && !loading && !error ? (
        <div className="text-center mt-8 text-gray-500">
          No transactions found matching your criteria.
        </div>
      ) : (
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:-px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Transaction ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Merchant/Payee
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Risk Score
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {transaction.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {transaction.merchant || transaction.payee || 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status, transaction.decision)}`}>
                            {getStatusText(transaction.status, transaction.decision)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.riskScore}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center space-x-2">
                            {transaction.status === TransactionStatus.PENDING && transaction.decision === TransactionDecision.CHALLENGE ? (
                              <button
                                onClick={() => handleStartVerification(transaction)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                                Verify
                              </button>
                            ) : (
                              <a href={`/transactions/${transaction.id}`} className="text-primary-600 hover:text-primary-900">
                                <EyeIcon className="h-5 w-5" />
                              </a>
                            )}
                          </div>
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

      {!loading && !error && transactions.length > 0 && (
        <nav
          className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * transactionsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * transactionsPerPage, totalResults)}</span> of {" "}
              <span className="font-medium">{totalResults}</span> results
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default UserTransactions;
