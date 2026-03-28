import { setRequestLocale } from 'next-intl/server';
import ExplorePanelContent from '../../../components/Sidebar/ExplorePanelContent';
import { HomeLayout } from '../../../components/Layout/Layout';
import PersonalBlogSidebar from '../../../components/Sidebar/PersonalBlogSidebar';

export const metadata = {
  title: 'Explore',
  description: 'Explore popular posts, categories, and archive',
};

export default async function ExplorePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <HomeLayout sidebar={<PersonalBlogSidebar />}>
      <ExplorePanelContent />
    </HomeLayout>
  );
}
