// components/Article/MediumArticleLayout.js
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import ReadingProgressBar from '../Reading/ReadingProgressBar';
import ArticleReader from './ArticleReader';

const MediumArticleLayout = ({ post, children }) => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-medium-bg-primary">
      {/* Reading Progress Bar */}
      <ReadingProgressBar />
      
      {/* Article Container */}
      <article className="max-w-article mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-medium-text-primary leading-tight mb-6">
            {post?.title}
          </h1>
          
          {/* Article Meta */}
          <div className="flex items-center space-x-4 text-medium-text-secondary mb-8">
            <div className="flex items-center space-x-3">
              <img
                src={post?.user?.avatar || '/images/default-avatar.jpg'}
                alt={post?.user?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-medium-text-primary">
                  {post?.user?.name}
                </div>
                <div className="text-sm text-medium-text-muted">
                  {post?.created_at && new Date(post.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post?.featured_image && (
            <div className="mb-12">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {children || <ArticleReader post={post} />}
        </div>
      </article>
    </div>
  );
};

export default MediumArticleLayout;
