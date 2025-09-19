import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

interface MfaFormData {
  code: string;
}

const loginSchema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const mfaSchema = yup.object({
  code: yup.string().length(6, 'Code must be 6 digits').required('Code is required'),
});

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, verifyMfa, error, clearError } = useAuth();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const {
    register: registerMfa,
    handleSubmit: handleMfaSubmit,
    formState: { errors: mfaErrors },
  } = useForm<MfaFormData>({
    resolver: yupResolver(mfaSchema),
  });

  const onSubmitLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    clearError();
    try {
      await login(data.email, data.password);
      // If login successful, check if MFA is required
      setShowMfa(true);
    } catch (error: any) {
      // If error indicates MFA is required, show MFA form
      if (error.response?.status === 403 && error.response?.data?.requiresMfa) {
        setShowMfa(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitMfa = async (data: MfaFormData) => {
    setIsLoading(true);
    clearError();
    try {
      await verifyMfa(data.code);
      navigate('/dashboard');
    } catch (error) {
      // Error will be handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <LockClosedIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showMfa ? 'Two-Factor Authentication' : 'Sign in to FinSecure'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showMfa 
              ? 'Enter the 6-digit code from your authenticator app'
              : 'Secure financial transaction monitoring platform'
            }
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-danger-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-danger-800">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-danger-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showMfa ? (
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit(onSubmitLogin)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  {...registerLogin('email')}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-danger-600">{loginErrors.email.message}</p>
                )}
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  {...registerLogin('password')}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-danger-600">{loginErrors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button type="button" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleMfaSubmit(onSubmitMfa)}>
            <div>
              <label htmlFor="code" className="sr-only">
                Authentication Code
              </label>
              <input
                {...registerMfa('code')}
                id="code"
                name="code"
                type="text"
                autoComplete="one-time-code"
                required
                maxLength={6}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter 6-digit code"
              />
              {mfaErrors.code && (
                <p className="mt-1 text-sm text-danger-600">{mfaErrors.code.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Verify'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowMfa(false)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Secure Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 