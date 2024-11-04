// utils/axiosPublicInstance.js
import axios from 'axios';
import { BASE_API_URL } from '../config/api';

const axiosPublicInstance = axios.create({
  baseURL: BASE_API_URL,
});

export default axiosPublicInstance;
