// utils/axiosPublicInstance.js
import axios from 'axios';
import { BASE_API_URL, BASE_API_URL_SIMPLE } from '../config/api';

export const axiosPublicInstance = axios.create({
  baseURL: BASE_API_URL,
});

export const axiosPublicInstanceSimple = axios.create({
  baseURL: BASE_API_URL_SIMPLE,
});

export default axiosPublicInstance;
