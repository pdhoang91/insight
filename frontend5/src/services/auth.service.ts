import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';
import { axiosPublicInstance, axiosPrivateInstance } from '@/lib/axios';
import { BASE_API_URL } from '@/config/api';

interface AxiosError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export const authService = {
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await axiosPublicInstance.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      return {
        data: {
          user: response.data.user,
          token: response.data.token,
        },
        message: response.data.message || 'Login successful',
        status: response.status,
      };
    } catch (error: unknown) {
      console.error('Login failed:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  async register(userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await axiosPublicInstance.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        username: userData.username,
      });
      
      return {
        data: {
          user: response.data.user,
          token: response.data.token,
        },
        message: response.data.message || 'Registration successful',
        status: response.status,
      };
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      // Development mode mock user
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        const token = localStorage.getItem('token');
        if (token === 'dev-mock-token') {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: {
                  id: '1',
                  username: 'devuser',
                  email: 'dev@example.com',
                  avatar: '/images/avatar.svg',
                  bio: 'Development User',
                  followersCount: 100,
                  followingCount: 50,
                  postsCount: 25,
                  createdAt: '2023-01-01',
                  updatedAt: '2024-01-01',
                },
                message: 'Mock user data fetched successfully',
                status: 200,
              });
            }, 300);
          });
        }
      }

      const response = await axiosPrivateInstance.get('/api/me');
      
      return {
        data: response.data,
        message: 'User data fetched successfully',
        status: response.status,
      };
    } catch (error: unknown) {
      console.error('Get current user failed:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Failed to get user data';
      throw new Error(errorMessage);
    }
  },

  async logout(): Promise<void> {
    try {
      // Call logout API if needed
      await axiosPrivateInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await axiosPrivateInstance.post('/auth/refresh');
      
      return {
        data: {
          token: response.data.token,
        },
        message: 'Token refreshed successfully',
        status: response.status,
      };
    } catch (error: unknown) {
      console.error('Token refresh failed:', error);
      const errorMessage = (error as AxiosError).response?.data?.message || 'Token refresh failed';
      throw new Error(errorMessage);
    }
  },

  // Google OAuth login
  loginWithGoogle(): void {
    window.location.href = `${BASE_API_URL}/auth/google`;
  },

  // Handle OAuth callback (for URL fragments)
  handleOAuthCallback(): string | null {
    if (typeof window === 'undefined') return null;
    
    const hash = window.location.hash.substr(1);
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    
    if (token) {
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    return token;
  },
}; 