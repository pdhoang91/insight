'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const FooterLink = ({ href, children }) => (
  <Link
    href={href}
    className="font-display text-[0.8rem] font-medium tracking-tight text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
  >
    {children}
  </Link>
);

const Footer = () => {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-[var(--bg)]">
      {/* Large decorative background wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-0.15em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display font-extrabold leading-none"
        style={{
          fontSize: 'clamp(5rem, 18vw, 14rem)',
          letterSpacing: '-0.04em',
          color: 'rgba(255,255,255,0.03)',
        }}
      >
        Insight
      </div>

      <div className="relative z-[1] max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 pt-14 pb-10">
        {/* Top row: logo + nav */}
        <div className="flex flex-wrap items-start justify-between gap-8 mb-12">
          {/* Logo */}
          <Link
            href="/"
            className="font-display font-extrabold text-[1.5rem] leading-none tracking-[-0.03em] text-[var(--text)] transition-opacity hover:opacity-75"
          >
            Insight
          </Link>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col gap-3">
              <p className="ui-section-header mb-1">{t('footer.navigate')}</p>
              <FooterLink href="/">{t('footer.writing')}</FooterLink>
              <FooterLink href="/category">{t('footer.topics')}</FooterLink>
              <FooterLink href="/archive">{t('sidebar.archive')}</FooterLink>
            </div>

            <div className="flex flex-col gap-3">
              <p className="ui-section-header mb-1">{t('footer.more')}</p>
              <FooterLink href="/search">{t('footer.search')}</FooterLink>
              <FooterLink href="/write">{t('footer.write')}</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-[var(--border)]">
          <p className="font-display text-[0.75rem] tracking-tight text-[var(--text-faint)] m-0">
            {t('footer.copyright', { year })}
          </p>
          <span className="font-display text-[0.7rem] uppercase tracking-[0.04em] text-[var(--text-faint)]">
            {t('footer.builtWith')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
