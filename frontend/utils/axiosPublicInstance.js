// utils/axiosPublicInstance.js
import axios from 'axios';
import { BASE_API_URL } from '../config/api';

export const axiosPublicInstance = axios.create({
  baseURL: BASE_API_URL || 'http://localhost:81',
});

// Removed axiosAIPublicInstance - not used anywhere
// Removed axiosPublicInstanceSimple - unified with axiosPublicInstance

export default axiosPublicInstance;
