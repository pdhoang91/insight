'use client';
import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { SignOut } from '@phosphor-icons/react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useTranslations } from 'next-intl';
import Avatar from '../UI/Avatar';

const NavUserMenu = ({ user, isOpen, onToggle, onClose, onLogout }) => {
  const t = useTranslations();
  const menuRef = useRef();
  const handleOutsideClick = useCallback(() => onClose(), [onClose]);
  useOutsideClick(menuRef, handleOutsideClick);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        aria-label={`${user.name} — user menu`}
        aria-expanded={isOpen}
        className="flex items-center p-[2px] transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-full"
      >
        <Avatar src={user.avatar_url} name={user.name} size="sm" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-[10px] w-[220px] bg-[var(--bg)] border border-[var(--border-mid)] rounded-[4px] shadow-[var(--shadow-lg)] overflow-hidden z-50"
          >
            <Link
              href={`/${user.username}`}
              className="flex items-center gap-[10px] px-4 py-3"
              onClick={onClose}
            >
              <Avatar src={user.avatar_url} name={user.name} size="md" />
              <div className="min-w-0">
                <div className="font-display font-semibold text-sm tracking-tight text-[var(--text)] truncate">{user.name}</div>
                <div className="text-xs text-[var(--text-faint)] truncate">{user.email}</div>
              </div>
            </Link>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-[10px] bg-transparent border-none cursor-pointer font-display text-sm tracking-tight text-[var(--text-muted)] text-left transition-colors duration-150 hover:text-[var(--text)]"
            >
              <SignOut size={16} weight="regular" />
              {t('nav.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavUserMenu;
