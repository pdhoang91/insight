'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';

const premiumSpring = { type: 'spring', stiffness: 100, damping: 20, mass: 0.5 };

export default function MobileSlidePanel({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) onClose();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            data-testid="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(0,0,0,0.40)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            data-testid="mobile-panel"
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={premiumSpring}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '85vw',
              maxWidth: '380px',
              zIndex: 50,
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header — always visible, never scrolls */}
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: 'var(--nav-height)',
                padding: '0 1.5rem',
              }}
            >
              <button
                onClick={onClose}
                aria-label="Close menu"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  transition: 'color 0.2s',
                }}
                className="hover:text-[var(--text)]"
              >
                <X size={20} weight="regular" />
              </button>
            </div>
            {/* Scrollable body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.75rem 2rem 2.5rem',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
