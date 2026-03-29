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
      color: 'var(--text-muted)',
      transition: 'color 0.2s',
    }}
    className="hover:text-[var(--text)]"
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
        background: 'var(--bg)',
        marginTop: '6rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Large background wordmark — decorative */}
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
          color: 'rgba(0, 0, 0, 0.04)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        Insight
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 pt-14 pb-10 relative z-[1]">
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
              color: 'var(--text)',
              lineHeight: 1,
            }}
            className="hover:opacity-75 transition-opacity"
          >
            Insight
          </Link>

          {/* Nav columns */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p className="ui-section-header mb-1">{t('footer.navigate')}</p>
              <FooterLink href="/">{t('footer.writing')}</FooterLink>
              <FooterLink href="/category">{t('footer.topics')}</FooterLink>
              <FooterLink href="/archive">{t('sidebar.archive')}</FooterLink>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p className="ui-section-header mb-1">{t('footer.more')}</p>
              <FooterLink href="/search">{t('footer.search')}</FooterLink>
              <FooterLink href="/write">{t('footer.write')}</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '1.25rem',
          }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0, letterSpacing: '-0.01em' }}>
            {t('footer.copyright', { year })}
          </p>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-faint)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {t('footer.builtWith')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
