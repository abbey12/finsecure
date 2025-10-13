import React, { useState, useEffect } from 'react';
import { VerificationAttempt, VerificationMethod, VerificationResult, User } from '../types';
import { verificationAPI } from '../services/api';
// Assuming mockUsers or some way to get a userId is available for demo purposes
import { mockUsers } from '../services/mockData'; 

const Verifications: React.FC = () => {
  const [verificationAttempts, setVerificationAttempts] = useState<VerificationAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [filters, setFilters] = useState<{ method?: VerificationMethod, result?: VerificationResult }>({ 
    method: undefined,
    result: undefined,
  });

  const attemptsPerPage = 10;

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === 'all' ? undefined : value as VerificationMethod | VerificationResult,
    }));
    setCurrentPage(1); 
  };

  const getMethodColor = (method: VerificationMethod) => {
    switch (method) {
      case VerificationMethod.ID_SCAN:
        return 'bg-blue-100 text-blue-800';
      case VerificationMethod.LIVENESS:
        return 'bg-green-100 text-green-800';
      case VerificationMethod.SELFIE:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: VerificationResult) => {
    switch (result) {
      case VerificationResult.SUCCESS:
        return 'bg-green-100 text-green-800';
      case VerificationResult.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case VerificationResult.FAILED:
        return 'bg-red-100 text-red-800';
      case VerificationResult.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchVerificationAttempts = async () => {
      setLoading(true);
      setError(null);
      try {
        // For now, let's assume we're fetching for the first mock user.
        // In a real application, you'd get the userId from context or props.
        const userId = mockUsers[0].id; 
        const apiResponse = await verificationAPI.getVerificationHistory(userId, currentPage, attemptsPerPage, filters);
        setVerificationAttempts(apiResponse.data.data);
        setTotalResults(apiResponse.data.pagination.total);
        setTotalPages(apiResponse.data.pagination.totalPages);

      } catch (err) {
        console.error('Error fetching verification attempts:', err);
        setError('Failed to fetch verification attempts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationAttempts();
  }, [currentPage, filters]);

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
        <h1 className="text-2xl font-bold text-gray-900">Verification Attempts</h1>
        <p className="mt-1 text-sm text-gray-500">Review and manage user verification attempts.</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Method Filter */}
        <select
          name="method"
          value={filters.method || 'all'}
          onChange={handleFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Methods</option>
          {Object.values(VerificationMethod).map((method) => (
            <option key={method} value={method}>
              {method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>

        {/* Result Filter */}
        <select
          name="result"
          value={filters.result || 'all'}
          onChange={handleFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Results</option>
          {Object.values(VerificationResult).map((result) => (
            <option key={result} value={result}>
              {result.charAt(0).toUpperCase() + result.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {verificationAttempts.length === 0 && !loading && !error ? (
        <div className="text-center mt-8 text-gray-500">
          No verification attempts found matching your criteria.
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
                        Attempt ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        User ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Method
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Result
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Attempts
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created At
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {verificationAttempts.map((attempt) => (
                      <tr key={attempt.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {attempt.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{attempt.userId}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getMethodColor(attempt.method)}
                            `}>
                            {attempt.method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getResultColor(attempt.result)}
                            `}>
                            {attempt.result}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{attempt.attemptsCount}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a href={`/verifications/${attempt.id}`} className="text-primary-600 hover:text-primary-900">
                            View<span className="sr-only">, {attempt.id}</span>
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

      {!loading && !error && verificationAttempts.length > 0 && (
        <nav
          className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * attemptsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * attemptsPerPage, totalResults)}</span> of {" "}
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

export default Verifications;
