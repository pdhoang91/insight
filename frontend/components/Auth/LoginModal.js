// // components/Auth/LoginModal.js

import React, { useState, useEffect } from 'react';
import { loginWithEmailAndPassword, registerUser, loginWithGoogle } from '../../services/authService';
import { useLoginModal } from '../../hooks/useLoginModal';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and register
  useLoginModal(isOpen, onClose);


  useEffect(() => {
    if (isOpen) {
      // Khóa cuộn của trang khi modal mở
      document.body.style.overflow = 'hidden';
    } else {
      // Mở lại cuộn của trang khi modal đóng
      document.body.style.overflow = 'auto';
    }

    // Dọn dẹp khi component bị unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;


  const handleLogin = async () => {
    try {
      await loginWithEmailAndPassword(email, password);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      await registerUser(email, password);
      setIsSignUp(false); // After registration, switch to login mode
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-out z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md mx-4 transform transition-transform duration-300 ease-out scale-95 hover:scale-100 opacity-100 z-60"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500 mb-6 text-center">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-400 mb-8 text-center">
          {isSignUp ? 'Sign up to get started.' : 'Sign in to continue your journey with us.'}
        </p>
        <div className="flex flex-col items-center space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-3 p-3 rounded-lg text-gray-800"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 p-3 rounded-lg text-gray-800"
          />
          <button
            onClick={isSignUp ? handleSignUp : handleLogin}
            className="bg-gradient-to-r from-blue-600 to-teal-400 text-white w-full py-3 rounded-full text-lg font-semibold shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:shadow-xl"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <button
            onClick={loginWithGoogle}
            className="bg-gradient-to-r from-red-500 to-yellow-400 text-white w-full py-3 rounded-full text-lg font-semibold shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:shadow-xl"
          >
            Sign In with Google
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full text-lg font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full py-3 rounded-full text-lg font-semibold text-gray-400"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

