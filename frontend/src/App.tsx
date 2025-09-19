import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import Transactions from './pages/Transactions';
import CreateTransaction from './pages/CreateTransaction';
import { UserRole } from './types';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Role-based Route component
const RoleBasedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard - Role-based */}
        <Route path="dashboard" element={
          user?.role === UserRole.REGULAR ? <UserDashboard /> : <Dashboard />
        } />
        
        {/* Regular User Routes */}
        <Route path="profile" element={
          <RoleBasedRoute allowedRoles={[UserRole.REGULAR]}>
            <UserProfile />
          </RoleBasedRoute>
        } />
        
        <Route path="create-transaction" element={
          <RoleBasedRoute allowedRoles={[UserRole.REGULAR]}>
            <CreateTransaction />
          </RoleBasedRoute>
        } />
        
        {/* Admin/Analyst Routes */}
        <Route path="transactions" element={
          <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.ANALYST]}>
            <Transactions />
          </RoleBasedRoute>
        } />
        
        {/* Add more routes here as we create them */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
