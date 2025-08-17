// components/Auth/LoginModal.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaTimes, FaUser, FaLock } from 'react-icons/fa';
import { loginWithEmailAndPassword, registerUser, loginWithGoogle } from '../../services/authService';
import { getUserProfile } from '../../services/userService';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useUser } from '../../context/UserContext';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUser();
  useLoginModal(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setError(''); // Clear error when modal opens
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      await loginWithEmailAndPassword(email, password);
      const userData = await getUserProfile();
      setUser(userData);
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Xác thực thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      await registerUser(email, password);
      const userData = await getUserProfile();
      setUser(userData);
      setIsSignUp(false);
      onClose();
    } catch (error) {
      console.error('Sign up failed:', error);
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      // loginWithGoogle() redirects to Google OAuth, no need to await
      // User authentication and profile fetching will be handled by useAuth hook after redirect
      loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Xác thực Google thất bại. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center bg-terminal-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-sm mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ultra Transparent Modal */}
          <div className="bg-terminal-black/20 backdrop-blur-lg rounded-lg p-8 space-y-6 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-matrix-green/60 hover:text-hacker-red transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            {/* Simple Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-matrix-green font-mono">
                {isSignUp ? 'Đăng Ký' : 'Đăng Nhập'}
              </h2>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-hacker-red/20 backdrop-blur-sm rounded-md p-3 text-hacker-red text-sm font-mono text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matrix-green/60 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-terminal-black/20 backdrop-blur-sm rounded-md text-text-primary font-mono placeholder-text-muted/60 focus:bg-terminal-black/30 focus:outline-none transition-all"
                  placeholder="Email"
                  disabled={isLoading}
                />
              </div>
              
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matrix-green/60 w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-terminal-black/20 backdrop-blur-sm rounded-md text-text-primary font-mono placeholder-text-muted/60 focus:bg-terminal-black/30 focus:outline-none transition-all"
                  placeholder="Mật khẩu"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={isSignUp ? handleSignUp : handleLogin}
                disabled={isLoading || !email || !password}
                className="w-full py-3 bg-matrix-green/20 backdrop-blur-sm text-matrix-green rounded-md font-mono font-medium hover:bg-matrix-green/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-matrix-green/30 border-t-matrix-green rounded-full animate-spin"></div>
                ) : (
                  <span>{isSignUp ? 'Đăng Ký' : 'Đăng Nhập'}</span>
                )}
              </button>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-terminal-black/20 backdrop-blur-sm text-text-primary rounded-md font-mono font-medium hover:bg-terminal-black/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <FaGoogle className="w-4 h-4" />
                <span>Tiếp tục với Google</span>
              </button>

              <button
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
                className="w-full py-2 text-text-muted/80 hover:text-matrix-green transition-colors font-mono text-sm disabled:opacity-50"
              >
                {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;
