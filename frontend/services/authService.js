//import axios from 'axios';
// services/authService.js
//import axiosPublicInstance from '../utils/axiosPublicInstance';
//import axios from 'axios';

import { BASE_API_URL } from '../config/api';
//import { useUser } from '../context/UserContext';
import axiosPublicInstance from '../utils/axiosPublicInstance';
import axiosPrivateInstance from '../utils/axiosPrivateInstance';


  //const { login } = useUser();

  export const getCurrentUser = async () => {
    // try {
    //   const response = await axiosPublicInstance.get('/auth/me');
    //   return response.data.user;
    // } catch (error) {
    //   console.error('Fetching current user failed:', error);
    //   throw error;
    // }
    const response = await axiosPrivateInstance.get('/api/me');
    return response.data;
  };

  export const loginWithEmailAndPassword = async (email, password) => {
    try {
      const response = await axiosPublicInstance.post(`/auth/login`, { email, password });
      //response.data.token; // Sử dụng login từ UserContext
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  export const registerUser = async (email, password) => {
    try {
      const response = await axiosPublicInstance.post(`/auth/register`, { email, password });
      //response.data.token; // Sử dụng login từ UserContext
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

  //window.location.href = axiosPrivateInstance.get`/auth/google`;
};

