'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const FooterLink = ({ href, children }) => (
  <Link
    href={href}
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: '0.8rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      color: 'rgba(242, 237, 228, 0.45)',
      transition: 'color 0.2s',
    }}
    className="hover:text-[var(--text-inverse)]"
  >
    {children}
  </Link>
);

const Footer = () => {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'var(--bg-dark)',
        marginTop: '6rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Large background wordmark — decorative, aria-hidden */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-0.15em',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(5rem, 18vw, 14rem)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: 'rgba(242, 237, 228, 0.05)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        Insight
      </div>

      <div
        style={{
          maxWidth: '1192px',
          margin: '0 auto',
          padding: '3.5rem 2rem 2.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top row: logo + nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '-0.03em',
              color: 'var(--text-inverse)',
              lineHeight: 1,
            }}
            className="hover:opacity-75 transition-opacity"
          >
            Insight
          </Link>

          {/* Nav columns */}
          <div
            style={{
              display: 'flex',
              gap: '3rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(242, 237, 228, 0.3)',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {t('footer.navigate')}
              </p>
              <FooterLink href="/">{t('footer.writing')}</FooterLink>
              <FooterLink href="/category">{t('footer.topics')}</FooterLink>
              <FooterLink href="/archive">{t('sidebar.archive')}</FooterLink>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(242, 237, 228, 0.3)',
                  margin: '0 0 0.25rem 0',
                }}
              >
                {t('footer.more')}
              </p>
              <FooterLink href="/search">{t('footer.search')}</FooterLink>
              <FooterLink href="/write">{t('footer.write')}</FooterLink>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(242, 237, 228, 0.08)', marginBottom: '1.5rem' }} />

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              color: 'rgba(242, 237, 228, 0.3)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {t('footer.copyright', { year })}
          </p>

          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              color: 'rgba(242, 237, 228, 0.2)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {t('footer.builtWith')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
