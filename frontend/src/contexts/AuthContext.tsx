import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string, role = 'regular') => {
    dispatch({ type: 'SIGNUP_START' });
    try {
      const response = await authAPI.signup(email, password, firstName, lastName, role);
      const { user, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'SIGNUP_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Signup failed';
      dispatch({
        type: 'SIGNUP_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  const verifyMfa = async (code: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.verifyMfa(code);
      const { user, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'MFA verification failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if logout API fails, clear local storage
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    verifyMfa,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 