import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  CreditCardIcon, 
  DevicePhoneMobileIcon, 
  GlobeAltIcon, 
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { CreateTransactionRequest, TransactionChannel, TransactionDecision, LocationSource, VerificationResult } from '../types';
import { transactionsAPI, verificationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EnhancedVerification from '../components/EnhancedVerification';

interface TransactionFormData {
  amount: number;
  currency: string;
  merchant?: string;
  payee?: string;
  channel: TransactionChannel;
  phoneNumber?: string;
  transactionType: 'merchant' | 'person';
}


const CreateTransaction: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    transaction?: any;
    message: string;
  } | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<TransactionFormData>({
    defaultValues: {
      currency: 'GHS',
      channel: TransactionChannel.MOBILE_APP,
      transactionType: 'merchant'
    }
  });

  const watchedChannel = watch('channel');
  const watchedTransactionType = watch('transactionType');

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    setTransactionResult(null);

    try {
      // Generate device ID (in real app, this would come from device fingerprinting)
      const deviceId = `device_${Date.now()}`;
      
      // Get user's location (in real app, this would come from GPS)
      const location = {
        latitude: 5.6037, // Accra coordinates
        longitude: -0.1870,
        source: LocationSource.GPS,
        country: 'GH',
        city: 'Accra',
        region: 'Greater Accra'
      };

      const transactionData: CreateTransactionRequest = {
        userId: user?.id || 'user_001',
        deviceId,
        amount: data.amount,
        currency: data.currency,
        channel: data.channel,
        ipAddress: '127.0.0.1', // In real app, get from request
        location,
        ...(data.transactionType === 'merchant' 
          ? { merchant: data.merchant }
          : { payee: data.payee }
        )
      };

      const response = await transactionsAPI.createTransaction(transactionData);
      
      // Check if transaction requires verification
      if (response.data.decision === TransactionDecision.CHALLENGE) {
        setPendingTransaction(response.data);
        setShowVerification(true);
        return;
      }
      
      setTransactionResult({
        success: response.success,
        transaction: response.data,
        message: response.message || 'Transaction processed successfully'
      });

      // Redirect to transactions page after 3 seconds
      setTimeout(() => {
        navigate('/my-transactions');
      }, 3000);

    } catch (error: any) {
      setTransactionResult({
        success: false,
        message: error.response?.data?.error || 'Transaction failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = async (result: VerificationResult) => {
    if (result === VerificationResult.SUCCESS) {
      // Verification successful, complete the transaction
      setTransactionResult({
        success: true,
        transaction: pendingTransaction,
        message: 'Transaction verified and completed successfully'
      });
      setShowVerification(false);
      
      // Redirect to transactions page after 3 seconds
      setTimeout(() => {
        navigate('/my-transactions');
      }, 3000);
    } else {
      // Verification failed
      setTransactionResult({
        success: false,
        message: 'Verification failed. Transaction could not be completed.'
      });
      setShowVerification(false);
    }
  };

  const handleVerificationCancel = () => {
    setTransactionResult({
      success: false,
      message: 'Verification cancelled. Transaction was not completed.'
    });
    setShowVerification(false);
  };

  const getDecisionIcon = (decision: TransactionDecision) => {
    switch (decision) {
      case TransactionDecision.ALLOW:
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case TransactionDecision.CHALLENGE:
        return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />;
      case TransactionDecision.DENY:
        return <XCircleIcon className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getDecisionColor = (decision: TransactionDecision) => {
    switch (decision) {
      case TransactionDecision.ALLOW:
        return 'text-green-600 bg-green-50 border-green-200';
      case TransactionDecision.CHALLENGE:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case TransactionDecision.DENY:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Show verification component if transaction requires verification
  if (showVerification && pendingTransaction) {
    return (
      <EnhancedVerification
        transactionId={pendingTransaction.id}
        riskScore={pendingTransaction.riskScore}
        onVerificationComplete={handleVerificationComplete}
        onVerificationCancel={handleVerificationCancel}
      />
    );
  }

  if (transactionResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getDecisionIcon(transactionResult.transaction?.decision)}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {transactionResult.success ? 'Transaction Processed' : 'Transaction Failed'}
            </h2>
            <p className="text-gray-600 mb-6">{transactionResult.message}</p>
            
            {transactionResult.transaction && (
              <div className={`border rounded-lg p-4 ${getDecisionColor(transactionResult.transaction.decision)}`}>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    ₵{transactionResult.transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-75">
                    {transactionResult.transaction.merchant || transactionResult.transaction.payee}
                  </p>
                  <p className="text-xs mt-2">
                    Risk Score: {transactionResult.transaction.riskScore}%
                  </p>
                  <p className="text-xs">
                    Status: {transactionResult.transaction.status}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => navigate('/my-transactions')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View All Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Make a Payment</h1>
          <p className="mt-2 text-gray-600">Send money securely with real-time fraud protection</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    value="merchant"
                    {...register('transactionType')}
                    className="sr-only"
                  />
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    watchedTransactionType === 'merchant'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center">
                      <CreditCardIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">Merchant Payment</p>
                        <p className="text-sm text-gray-500">Pay to a business</p>
                      </div>
                    </div>
                  </div>
                </label>
                
                <label className="relative">
                  <input
                    type="radio"
                    value="person"
                    {...register('transactionType')}
                    className="sr-only"
                  />
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    watchedTransactionType === 'person'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center">
                      <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">Person to Person</p>
                        <p className="text-sm text-gray-500">Send to someone</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (GHS)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₵</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="50000"
                  {...register('amount')}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Recipient */}
            {watchedTransactionType === 'merchant' ? (
              <div>
                <label htmlFor="merchant" className="block text-sm font-medium text-gray-700">
                  Merchant Name
                </label>
                <input
                  type="text"
                  {...register('merchant')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Shoprite Ghana, KFC Ghana"
                />
                {errors.merchant && (
                  <p className="mt-1 text-sm text-red-600">{errors.merchant.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="payee" className="block text-sm font-medium text-gray-700">
                  Recipient Name
                </label>
                <input
                  type="text"
                  {...register('payee')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., John Doe, Mary Asante"
                />
                {errors.payee && (
                  <p className="mt-1 text-sm text-red-600">{errors.payee.message}</p>
                )}
              </div>
            )}

            {/* Payment Channel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    value={TransactionChannel.MOBILE_APP}
                    {...register('channel')}
                    className="sr-only"
                  />
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    watchedChannel === TransactionChannel.MOBILE_APP
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center">
                      <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">Mobile Money</p>
                        <p className="text-sm text-gray-500">MTN, Vodafone, AirtelTigo</p>
                      </div>
                    </div>
                  </div>
                </label>
                
                <label className="relative">
                  <input
                    type="radio"
                    value={TransactionChannel.WEB}
                    {...register('channel')}
                    className="sr-only"
                  />
                  <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    watchedChannel === TransactionChannel.WEB
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-sm text-gray-500">Online banking</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Phone Number for Mobile Money */}
            {watchedChannel === TransactionChannel.MOBILE_APP && (
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phoneNumber')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., 0241234567"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            )}

            {/* Location Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-blue-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Location: Accra, Ghana</p>
                  <p className="text-xs text-blue-600">Your transaction will be processed from this location</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Send Payment'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Secure Transaction</h3>
              <p className="text-sm text-green-700 mt-1">
                Your payment is protected by real-time fraud detection and encryption. 
                All transactions are monitored for suspicious activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTransaction;
