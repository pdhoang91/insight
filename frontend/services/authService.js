// services/authService.js

import { BASE_API_URL } from '../config/api';
import axiosPublicInstance from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';

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

