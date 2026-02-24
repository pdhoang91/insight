// components/Shared/LanguageSwitcher.js
import React from 'react';
import { useRouter } from 'next/router';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { locale, locales, asPath } = router;

  const switchLocale = (newLocale) => {
    router.push(asPath, asPath, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2 py-1 rounded transition-colors ${
            locale === loc
              ? 'bg-medium-accent-green text-white font-medium'
              : 'text-medium-text-muted hover:text-medium-text-primary'
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
