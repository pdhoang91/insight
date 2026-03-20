'use client';
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '../../i18n';

const snappy = { type: 'spring', stiffness: 300, damping: 30, mass: 0.3 };

export default function LanguageTogglePill() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [disabled, setDisabled] = useState(false);

  const switchLocale = useCallback((newLocale) => {
    if (disabled || newLocale === locale) return;
    setDisabled(true);
    setTimeout(() => setDisabled(false), 500);

    const segments = pathname.split('/');
    if (locales.includes(segments[1])) {
      if (newLocale === 'vi') {
        segments.splice(1, 1);
      } else {
        segments[1] = newLocale;
      }
    } else {
      if (newLocale !== 'vi') {
        segments.splice(1, 0, newLocale);
      }
    }
    const newPath = segments.join('/') || '/';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    router.push(newPath + search + hash);
  }, [disabled, locale, pathname, router]);

  return (
    <div
      data-testid="lang-toggle"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        border: '1px solid rgba(255,255,255,0.10)',
        padding: '3px',
        background: 'var(--bg-surface)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      {locales.map((loc) => {
        const isActive = locale === loc;
        const label = loc === 'vi' ? 'VN' : 'EN';
        const testId = loc === 'vi' ? 'lang-toggle-vn' : 'lang-toggle-en';
        return (
          <button
            key={loc}
            data-testid={testId}
            onClick={() => switchLocale(loc)}
            disabled={disabled}
            style={{
              position: 'relative',
              zIndex: 1,
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              fontWeight: isActive ? 700 : 400,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderRadius: '9999px',
              padding: '3px 9px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'color 0.2s, font-weight 0.2s',
              lineHeight: 1,
            }}
            className="active:scale-[0.97]"
          >
            {isActive && (
              <motion.div
                layoutId="locale-indicator"
                transition={snappy}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  background: 'var(--bg)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
                  zIndex: -1,
                }}
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}
