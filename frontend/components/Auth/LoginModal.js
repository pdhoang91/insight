// components/Auth/LoginModal.js
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogo, X, User, Lock } from '@phosphor-icons/react';
import { loginWithEmailAndPassword, registerUser, loginWithGoogle } from '../../services/authService';
import { getUserProfile } from '../../services/userService';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useUser } from '../../context/UserContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useTranslations } from 'next-intl';
import Button from '../UI/Button';

const LoginModal = ({ isOpen, onClose }) => {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUser();
  useLoginModal(isOpen, onClose);
  useBodyScrollLock(isOpen);

  const executeAuthFlow = useCallback(async (serviceFn, errorKey) => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      await serviceFn();
      const userData = await getUserProfile();
      setUser(userData);
      onClose();
    } catch (err) {
      console.error('Auth failed:', err);
      setError(t(errorKey));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, setUser, onClose, t]);

  const handleLogin = () =>
    executeAuthFlow(() => loginWithEmailAndPassword(email, password), 'auth.authFailed');

  const handleSignUp = () =>
    executeAuthFlow(async () => {
      await registerUser(email, password);
      setIsSignUp(false);
    }, 'auth.registrationFailed');

  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      loginWithGoogle();
    } catch (err) {
      console.error('Google login failed:', err);
      setError(t('auth.googleFailed'));
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(26, 20, 16, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            margin: '0 1rem',
            padding: '2.25rem',
            background: 'var(--bg)',
            border: '1px solid var(--border-mid)',
            borderRadius: '6px',
            boxShadow: '0 24px 48px -12px rgba(26, 20, 16, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s, transform 0.15s',
            }}
            className="hover:text-[var(--text)] active:-translate-y-[1px]"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>

          <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.5rem',
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                lineHeight: 1.1,
              }}
            >
              {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </h2>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: '4px',
                color: '#B91C1C',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-display)',
                textAlign: 'center',
                letterSpacing: '-0.01em',
              }}
            >
              {error}
            </motion.div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label
                htmlFor="email-input"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: 'var(--text)',
                }}
              >
                {t('auth.email')}
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 13,
                    height: 13,
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder={t('auth.emailPlaceholder')}
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '1rem',
                    paddingTop: '0.7rem',
                    paddingBottom: '0.7rem',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                    color: 'var(--text)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    outline: 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  className="focus:border-[var(--accent)] focus:bg-[var(--bg)]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password-input"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: 'var(--text)',
                }}
              >
                {t('auth.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 13,
                    height: 13,
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder={t('auth.passwordPlaceholder')}
                  style={{
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '1rem',
                    paddingTop: '0.7rem',
                    paddingBottom: '0.7rem',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                    color: 'var(--text)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    outline: 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  className="focus:border-[var(--accent)] focus:bg-[var(--bg)]"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={isSignUp ? handleSignUp : handleLogin}
              disabled={!email || !password}
              loading={isLoading}
              fullWidth
              style={{ fontSize: '0.9375rem', fontWeight: 600 }}
            >
              {isSignUp ? t('auth.createAccount') : t('auth.signIn')}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              fullWidth
              style={{ fontSize: '0.9375rem', fontWeight: 500, gap: '0.5rem' }}
            >
              <GoogleLogo style={{ width: 14, height: 14 }} />
              {t('auth.continueWithGoogle')}
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
              fullWidth
              className="hover:text-[var(--accent)]"
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginModal;
