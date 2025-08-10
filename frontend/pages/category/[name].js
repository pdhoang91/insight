// pages/category/[name].js
import React from 'react';
import { useRouter } from 'next/router';
import BlogSidebar from '../../components/Shared/BlogSidebar';
import CategoryListWithPosts from '../../components/Category/CategoryListWithPosts';
import { useInfinitePostByCategory } from '../../hooks/useInfinitePostByCategory';
import { Container, ContentArea, Card, StandardPageTitle, StandardPageSubtitle, LoadingSpinner } from '../../components/UI';

const CategoryPage = () => {
  const router = useRouter();
  const { name } = router.query;

  if (!name) {
    return (
      <Container variant="loading">
        <div className="loading-card">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-secondary font-mono">Loading category...</p>
        </div>
      </Container>
    );
  }

  const {
    posts,
    totalCount,
    isLoading,
    isError,
    setSize,
    isReachingEnd,
  } = useInfinitePostByCategory(name);

  return (
    <Container>
      <ContentArea>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card variant="surface">
              <header className="standard-page-header">
                <StandardPageTitle>{name}</StandardPageTitle>
                <StandardPageSubtitle>
                  posts in this category
                  {totalCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {totalCount}
                    </span>
                  )}
                </StandardPageSubtitle>
              </header>
            
              <CategoryListWithPosts
                posts={posts}
                isLoading={isLoading}
                isError={isError}
                setSize={setSize}
                isReachingEnd={isReachingEnd}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </ContentArea>
    </Container>
  );
};

export default CategoryPage;
