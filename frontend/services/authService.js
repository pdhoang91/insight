// services/authService.js

import { BASE_API_URL } from '../config/api';
import axiosPublicInstance from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';
import { 
  USER_ROLES, 
  canWritePosts as canWritePostsHelper,
  canViewAllProfiles,
  hasAdminAccess,
  isAdmin,
  getRoleDisplayName as getRoleDisplayNameHelper
} from '../constants/roles';

// Helper function to decode JWT token
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Get user role from token
export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  return decoded?.role || USER_ROLES.USER;
};

// Check if user has permission to write posts
export const canWritePosts = () => {
  const role = getUserRole();
  return canWritePostsHelper(role);
};

// Check if user is admin
export const isSuperAdmin = () => {
  const role = getUserRole();
  return isAdmin(role);
};

// Check if user can view all profiles
export const canViewAllUserProfiles = () => {
  const role = getUserRole();
  return canViewAllProfiles(role);
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  return getRoleDisplayNameHelper(role);
};

  export const getCurrentUser = async () => {
    const response = await axiosPrivateInstance.get('/api/me');
    return response.data;
  };

  export const loginWithEmailAndPassword = async (email, password) => {
    try {
      const response = await axiosPublicInstance.post(`/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  export const registerUser = async (email, password) => {
    try {
      const response = await axiosPublicInstance.post(`/auth/register`, { email, password });
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  export const logout = () => {
    localStorage.removeItem('token');
  };


export const loginWithGoogle = () => {
  window.location.href = `${BASE_API_URL}/auth/google`;
};

