// components/Auth/LoginModal.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaTimes, FaUser, FaLock } from 'react-icons/fa';
import { loginWithEmailAndPassword, registerUser, loginWithGoogle } from '../../services/authService';
import { getUserProfile } from '../../services/userService';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useUser } from '../../context/UserContext';
import { themeClasses, combineClasses } from '../../utils/themeClasses';

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
        className={themeClasses.modal.overlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={themeClasses.modal.content}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={themeClasses.form.fieldsetLarge}>
            {/* Close Button */}
            <button
              onClick={onClose}
              className={themeClasses.modal.closeButton}
            >
              <FaTimes className={themeClasses.icons.sm} />
            </button>

            {/* Simple Header */}
            <div className={combineClasses('text-center', themeClasses.spacing.stackSmall)}>
              <h2 className={combineClasses(
                themeClasses.typography.h2,
                themeClasses.text.primary
              )}>
                {isSignUp ? 'Đăng Ký' : 'Đăng Nhập'}
              </h2>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${themeClasses.error.bg} ${themeClasses.effects.blur} ${themeClasses.effects.rounded} p-3 ${themeClasses.error.text} ${themeClasses.text.bodySmall} text-center`}
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <div className={themeClasses.form.fieldset}>
              <div className="relative">
                <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text.accent}/60 ${themeClasses.icons.sm}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={combineClasses(
                    'w-full pl-10 pr-4 py-3 font-mono',
                    themeClasses.bg.primary,
                    'border',
                    themeClasses.border.primary,
                    themeClasses.effects.rounded,
                    themeClasses.text.primary,
                    'placeholder:text-medium-text-muted',
                    'focus:bg-medium-bg-secondary',
                    themeClasses.focus.ring,
                    themeClasses.animations.smooth
                  )}
                  placeholder="Email"
                  disabled={isLoading}
                />
              </div>
              
              <div className="relative">
                <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text.accent}/60 ${themeClasses.icons.sm}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={combineClasses(
                    'w-full pl-10 pr-4 py-3 font-mono',
                    themeClasses.bg.primary,
                    'border',
                    themeClasses.border.primary,
                    themeClasses.effects.rounded,
                    themeClasses.text.primary,
                    'placeholder:text-medium-text-muted',
                    'focus:bg-medium-bg-secondary',
                    themeClasses.focus.ring,
                    themeClasses.animations.smooth
                  )}
                  placeholder="Mật khẩu"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={themeClasses.form.fieldset}>
              <button
                onClick={isSignUp ? handleSignUp : handleLogin}
                disabled={isLoading || !email || !password}
                className={combineClasses(
                  'w-full py-3 font-mono disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center',
                  'bg-medium-accent-green/20 hover:bg-medium-accent-green/30',
                  themeClasses.effects.blur,
                  themeClasses.text.accent,
                  themeClasses.effects.rounded,
                  themeClasses.typography.weightMedium,
                  themeClasses.animations.smooth
                )}
              >
                {isLoading ? (
                  <div className={combineClasses(
                    themeClasses.icons.sm,
                    'border-2 border-medium-accent-green/30 border-t-medium-accent-green rounded-full animate-spin'
                  )}></div>
                ) : (
                  <span>{isSignUp ? 'Đăng Ký' : 'Đăng Nhập'}</span>
                )}
              </button>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={combineClasses(
                  'w-full py-3 font-mono disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2',
                  themeClasses.bg.secondary,
                  'hover:bg-medium-bg-secondary/80',
                  themeClasses.effects.blur,
                  themeClasses.text.primary,
                  themeClasses.effects.rounded,
                  themeClasses.typography.weightMedium,
                  themeClasses.animations.smooth
                )}
              >
                <FaGoogle className={themeClasses.icons.sm} />
                <span>Tiếp tục với Google</span>
              </button>

              <button
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
                className={combineClasses(
                  'w-full py-2 font-mono disabled:opacity-50',
                  'text-medium-text-muted/80 hover:text-medium-accent-green',
                  themeClasses.text.bodySmall,
                  themeClasses.animations.smooth
                )}
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
