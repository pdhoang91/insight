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
      setError('');
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
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
      setError('Authentication failed. Please check your credentials.');
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
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Google authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full pl-10 pr-4 py-3 bg-white border border-[#e6e6e6] rounded-lg text-[#292929] placeholder:text-[#b3b3b1] focus:border-[#292929] focus:outline-none transition-colors';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-md mx-4 p-8 bg-white border border-[#e6e6e6] rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#b3b3b1] hover:text-[#292929] transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-[#292929]">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </h2>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 rounded-lg text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b3b3b1]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Email"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b3b3b1]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={isSignUp ? handleSignUp : handleLogin}
                disabled={isLoading || !email || !password}
                className="w-full py-3 bg-[#1a8917] text-white rounded-full font-medium hover:bg-[#156d12] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                )}
              </button>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-[#f2f2f2] text-[#292929] rounded-full font-medium hover:bg-[#e6e6e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <FaGoogle className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
                className="w-full py-2 text-sm text-[#6b6b6b] hover:text-[#1a8917] disabled:opacity-50 transition-colors"
              >
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;
