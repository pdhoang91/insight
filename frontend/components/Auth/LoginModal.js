// components/Auth/LoginModal.js

import React, { useState, useEffect } from 'react';
import { loginWithEmailAndPassword, registerUser, loginWithGoogle } from '../../services/authService';
import { getUserProfile } from '../../services/userService';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useUser } from '../../context/UserContext';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle giữa đăng nhập và đăng ký
  const { setUser } = useUser(); // Lấy setUser từ UserContext
  useLoginModal(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      // Khóa cuộn khi modal mở
      document.body.style.overflow = 'hidden';
    } else {
      // Mở lại cuộn khi modal đóng
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
      const userData = await getUserProfile(); // Lấy thông tin người dùng
      setUser(userData); // Cập nhật trạng thái người dùng trong UserContext
      onClose(); // Đóng modal
    } catch (error) {
      console.error('Login failed:', error);
      alert('Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.');
    }
  };

  const handleSignUp = async () => {
    try {
      await registerUser(email, password);
      const userData = await getUserProfile(); // Lấy thông tin người dùng sau khi đăng ký
      setUser(userData); // Cập nhật trạng thái người dùng trong UserContext
      setIsSignUp(false); // Chuyển sang chế độ đăng nhập sau khi đăng ký
      alert('Đăng ký thành công! Bạn đã được đăng nhập.');
    } catch (error) {
      console.error('Sign up failed:', error);
      alert('Đăng ký thất bại. Vui lòng kiểm tra thông tin và thử lại.');
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-out z-50"
      onClick={onClose}
    >
      <div
        className="card py-8 w-full max-w-md mx-4 transform transition-transform duration-300 ease-out scale-95 hover:scale-100 opacity-100 z-60"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <h2 className="text-3xl font-extrabold text-green-400 mb-6 text-center font-mono">
          {isSignUp ? 'create_account()' : 'login()'}
        </h2>
        <p className="text-gray-400 mb-8 text-center font-mono text-sm">
          {isSignUp ? '// sign up to get started' : '// sign in to continue your journey'}
        </p>
        <div className="flex flex-col items-center space-y-4">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-3 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none font-mono"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-green-400 focus:outline-none font-mono"
          />
          <button
            onClick={isSignUp ? handleSignUp : handleLogin}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-gray-900 w-full py-3 rounded-lg text-lg font-semibold font-mono shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:shadow-xl"
          >
            {isSignUp ? 'signup()' : 'signin()'}
          </button>
          <button
            onClick={loginWithGoogle}
            className="bg-gradient-to-r from-red-500 to-orange-400 text-white w-full py-3 rounded-lg text-lg font-semibold font-mono shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:shadow-xl"
          >
            google_auth()
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg text-lg font-semibold font-mono text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors hover:text-white border border-gray-600"
          >
            cancel()
          </button>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full py-3 rounded-lg text-lg font-semibold text-gray-400 hover:text-gray-300 transition-colors font-mono"
          >
            {isSignUp ? '// already have account?' : "// don't have account?"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
