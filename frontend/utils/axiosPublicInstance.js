// utils/axiosPublicInstance.js
import axios from 'axios';
import { BASE_API_URL, BASE_AIAPI_URL, BASE_API_URL_SIMPLE } from '../config/api';

export const axiosPublicInstance = axios.create({
  baseURL: BASE_API_URL || 'http://localhost:81',
});

export const axiosAIPublicInstance = axios.create({
  baseURL: BASE_AIAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosPublicInstanceSimple = axios.create({
  baseURL: BASE_API_URL_SIMPLE || 'http://localhost:81',
});

export default axiosPublicInstance;
