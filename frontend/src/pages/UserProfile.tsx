import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  UserIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { User, Device, DeviceTrustLevel } from '../types';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const profileSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().optional(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    // Mock devices data
    setDevices([
      {
        id: 'device_1',
        userId: user?.id || '',
        fingerprint: 'abc123',
        os: 'iOS 16.0',
        browser: 'Safari',
        firstSeen: '2024-01-01T00:00:00Z',
        lastSeen: '2024-01-15T10:30:00Z',
        trustLevel: DeviceTrustLevel.HIGH,
        isCompromised: false,
      },
      {
        id: 'device_2',
        userId: user?.id || '',
        fingerprint: 'def456',
        os: 'Windows 11',
        browser: 'Chrome',
        firstSeen: '2024-01-05T00:00:00Z',
        lastSeen: '2024-01-14T15:20:00Z',
        trustLevel: DeviceTrustLevel.MEDIUM,
        isCompromised: false,
      },
    ]);
  }, [user]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser: User = {
        ...user!,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      };
      
      updateUser(updatedUser);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowPasswordForm(false);
      resetPassword();
      setSuccessMessage('Password changed successfully!');
    } catch (error) {
      setErrorMessage('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
    });
  };

  const getTrustLevelColor = (level: DeviceTrustLevel) => {
    switch (level) {
      case DeviceTrustLevel.HIGH:
        return 'text-success-600';
      case DeviceTrustLevel.MEDIUM:
        return 'text-warning-600';
      case DeviceTrustLevel.LOW:
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and security preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="rounded-md bg-success-50 p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-success-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-success-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md bg-danger-50 p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-danger-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-danger-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="px-6 py-4">
          <form onSubmit={handleProfileSubmit(onSubmitProfile)}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  {...registerProfile('firstName')}
                  type="text"
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
                />
                {profileErrors.firstName && (
                  <p className="mt-1 text-sm text-danger-600">{profileErrors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  {...registerProfile('lastName')}
                  type="text"
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
                />
                {profileErrors.lastName && (
                  <p className="mt-1 text-sm text-danger-600">{profileErrors.lastName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  {...registerProfile('email')}
                  type="email"
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
                />
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-danger-600">{profileErrors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  {...registerProfile('phone')}
                  type="tel"
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
                />
                {profileErrors.phone && (
                  <p className="mt-1 text-sm text-danger-600">{profileErrors.phone.message}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* MFA Status */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">
                {user?.mfaEnabled ? 'Enabled' : 'Disabled'} - Add an extra layer of security
              </p>
            </div>
            <button className="btn-secondary">
              {user?.mfaEnabled ? 'Manage' : 'Enable'}
            </button>
          </div>

          {/* Password Change */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-500">Change your account password</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn-secondary"
            >
              Change Password
            </button>
          </div>

          {/* Password Change Form */}
          {showPasswordForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        {...registerPassword('currentPassword')}
                        type={showPassword ? 'text' : 'password'}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      {...registerPassword('newPassword')}
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      {...registerPassword('confirmPassword')}
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-danger-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        resetPassword();
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Trusted Devices</h3>
            </div>
            <button className="btn-secondary">
              Manage Devices
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {devices.map((device) => (
            <div key={device.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DevicePhoneMobileIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {device.os} - {device.browser}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrustLevelColor(device.trustLevel)}`}>
                        {device.trustLevel} trust
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Last used: {formatDate(device.lastSeen)}
                    </p>
                  </div>
                </div>
                <button className="text-danger-600 hover:text-danger-900 text-sm">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BellIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Security Alerts</h4>
              <p className="text-sm text-gray-500">Get notified about suspicious activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Transaction Notifications</h4>
              <p className="text-sm text-gray-500">Receive alerts for new transactions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Weekly Security Report</h4>
              <p className="text-sm text-gray-500">Get a summary of your account security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 