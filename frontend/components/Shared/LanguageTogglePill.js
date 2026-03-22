'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { GlobeSimple, Check, CaretDown } from '@phosphor-icons/react';
import { LANGUAGES } from '../../i18n';

const premiumSpring = { type: 'spring', stiffness: 100, damping: 20, mass: 0.5 };

function useLanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const switchLocale = useCallback((newLocale) => {
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }, [locale, router]);
  return { locale, switchLocale };
}

// ─── Desktop: Navbar popover dropdown ───

function NavbarVariant() {
  const { locale, switchLocale } = useLanguageSwitch();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        data-testid="lang-toggle"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          borderRadius: '9999px',
          border: '1px solid var(--border-mid)',
          padding: '5px 10px',
          background: 'var(--bg-surface)',
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text)',
          cursor: 'pointer',
          lineHeight: 1,
          transition: 'border-color 0.2s',
        }}
        className="active:scale-[0.97] hover:border-[var(--border-strong)]"
      >
        <GlobeSimple size={14} weight="regular" />
        {current.label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={premiumSpring}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '6px',
              minWidth: '180px',
              maxHeight: '320px',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-mid)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 50,
              padding: '4px',
            }}
          >
            {LANGUAGES.map((lang, i) => {
              const isActive = locale === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  data-testid={`lang-toggle-${lang.code}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, ...premiumSpring }}
                  onClick={() => { switchLocale(lang.code); setOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    background: isActive ? 'var(--accent-light)' : 'none',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isActive ? 'default' : 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    color: isActive ? 'var(--accent)' : 'var(--text)',
                    textAlign: 'left',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(26,20,16,0.04)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                >
                  <span style={{
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    minWidth: '24px',
                    fontSize: '0.72rem',
                  }}>
                    {lang.label}
                  </span>
                  <span style={{ fontWeight: 400, flex: 1 }}>{lang.name}</span>
                  {isActive && <Check size={14} weight="bold" style={{ opacity: 0.7, flexShrink: 0 }} />}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile: Expandable panel section ───

function PanelVariant() {
  const { locale, switchLocale } = useLanguageSwitch();
  const [expanded, setExpanded] = useState(false);
  const current = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <div style={{ width: '100%' }}>
      {/* Trigger row */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          padding: '8px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          letterSpacing: '-0.01em',
          textAlign: 'left',
        }}
        className="active:scale-[0.98]"
      >
        <GlobeSimple size={16} weight="regular" />
        <span style={{ flex: 1 }}>{current.name}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={premiumSpring}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <CaretDown size={14} weight="regular" />
        </motion.span>
      </button>

      {/* Expanded language list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={premiumSpring}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '4px 0 4px 24px',
            }}>
              {LANGUAGES.map((lang, i) => {
                const isActive = locale === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    data-testid={`lang-panel-${lang.code}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, ...premiumSpring }}
                    onClick={() => { switchLocale(lang.code); setExpanded(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 8px',
                      background: isActive ? 'var(--accent-light)' : 'none',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isActive ? 'default' : 'pointer',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.82rem',
                      color: isActive ? 'var(--accent)' : 'var(--text)',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      minWidth: '24px',
                      fontSize: '0.72rem',
                    }}>
                      {lang.label}
                    </span>
                    <span style={{ fontWeight: 400, flex: 1 }}>{lang.name}</span>
                    {isActive && <Check size={14} weight="bold" style={{ opacity: 0.7, flexShrink: 0 }} />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Public API (default export preserved for backward compat) ───

export default function LanguageTogglePill({ variant = 'navbar' }) {
  if (variant === 'panel') return <PanelVariant />;
  return <NavbarVariant />;
}
