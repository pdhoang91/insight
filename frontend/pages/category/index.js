// pages/category/index.js
import React from 'react';
import BlogSidebar from '../../components/Shared/BlogSidebar';
import CategoryList from '../../components/Category/CategoryList';
import { Container, ContentArea, Card, StandardPageTitle, StandardPageSubtitle } from '../../components/UI';

const CategoryPage = () => {
  return (
    <Container>
      <ContentArea>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card variant="surface">
              <header className="standard-page-header">
                <StandardPageTitle>Categories</StandardPageTitle>
                <StandardPageSubtitle>explore stories by category</StandardPageSubtitle>
              </header>
            
              <CategoryList />
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
