import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Archive',
  description: 'Browse posts by date',
};

export default async function ArchiveIndexPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  redirect(`/archive/${year}/${month}`);
}
