import { useState, useEffect, useCallback } from 'react';
import { User, LoginForm, RegisterForm } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setUser = (user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if localStorage is available (browser environment)
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        
        // First, check for OAuth callback token in URL
        const callbackToken = authService.handleOAuthCallback();
        if (callbackToken) {
          try {
            localStorage.setItem('token', callbackToken);
            const response = await authService.getCurrentUser();
            setUser(response.data);
            return;
          } catch (callbackError) {
            console.error('OAuth callback failed:', callbackError);
            localStorage.removeItem('token');
          }
        }
        
        // Check for existing token in localStorage
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
          try {
            const response = await authService.getCurrentUser();
            setUser(response.data);
          } catch (error) {
            console.error('Token validation failed:', error);
            // Token might be expired or invalid
            try {
              localStorage.removeItem('token');
            } catch (storageError) {
              console.error('Failed to remove invalid token:', storageError);
            }
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setError('Authentication initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginForm) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      // Safely store token
      try {
        localStorage.setItem('token', response.data.token);
      } catch (storageError) {
        console.error('Failed to store token in localStorage:', storageError);
        throw new Error('Failed to save authentication token');
      }
      
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterForm) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      // Safely store token
      try {
        localStorage.setItem('token', response.data.token);
      } catch (storageError) {
        console.error('Failed to store token in localStorage:', storageError);
        throw new Error('Failed to save authentication token');
      }
      
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      // Safely remove token
      try {
        localStorage.removeItem('token');
      } catch (storageError) {
        console.error('Failed to remove token from localStorage:', storageError);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      try {
        localStorage.removeItem('token');
      } catch (storageError) {
        console.error('Failed to remove token from localStorage:', storageError);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      // Safely store new token
      try {
        localStorage.setItem('token', response.data.token);
      } catch (storageError) {
        console.error('Failed to store refreshed token:', storageError);
        throw new Error('Failed to save refreshed token');
      }
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return { success: false, error: 'Token refresh failed' };
    }
  }, [logout]);

  const loginWithGoogle = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    login,
    register,
    logout,
    refreshToken,
    loginWithGoogle,
    clearError,
  };
}; 