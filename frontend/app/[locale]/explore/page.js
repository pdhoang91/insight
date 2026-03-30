import { setRequestLocale } from 'next-intl/server';
import ExplorePanelContent from '../../../components/Sidebar/ExplorePanelContent';
import Layout from '../../../components/Layout/Layout';

export const metadata = {
  title: 'Explore',
  description: 'Explore popular posts, categories, and archive',
};

export default async function ExplorePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout showSidebar={false}>
      <ExplorePanelContent />
    </Layout>
  );
}
