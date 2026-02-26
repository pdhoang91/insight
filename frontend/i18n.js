import { getRequestConfig } from 'next-intl/server';

export const locales = ['vi', 'en'];
export const defaultLocale = 'vi';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
