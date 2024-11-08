// utils/axiosPrivateInstance.js
import axios from 'axios';
import { BASE_API_URL } from '../config/api';

export const axiosPrivateInstance = axios.create({
  baseURL: BASE_API_URL,
});

axiosPrivateInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosPrivateInstance;
