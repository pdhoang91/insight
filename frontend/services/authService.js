// services/authService.js
//import axiosPublicInstance from '../utils/axiosPublicInstance';
import { BASE_API_URL } from '../config/api';

export const loginWithGoogle = () => {
  window.location.href = `${BASE_API_URL}/auth/google`;

  //window.location.href = axiosPrivateInstance.get`/auth/google`;
};


export const logout = () => {
  localStorage.removeItem('token');
  //delete axios.defaults.headers.common['Authorization'];
};