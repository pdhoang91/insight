// components/Shared/PersonalBlogSidebar.js - Clean Medium 2024 Design
import React, { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '../../hooks/useCategories';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import PopularPostsWidget from '../Widgets/PopularPostsWidget';
import ArchiveWidget from '../Archive/ArchiveWidget';
import Button from '../UI/Button';
import Input from '../UI/Input';

const PersonalBlogSidebar = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(50);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    // TODO: Implement newsletter subscription
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Newsletter subscription:', email);
      setEmail('');
      // Show success message
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sticky container for better UX */}
      <div className="sticky top-24 space-y-8">
        
        {/* Popular Posts Widget */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-heading-3 text-medium-text-primary">
            Trending
          </h3>
          <PopularPostsWidget limit={5} showImages={false} />
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-heading-3 text-medium-text-primary">
            Topics
          </h3>
          
          {categoriesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-medium-bg-secondary animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories?.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.name}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-body-small bg-medium-bg-secondary text-medium-text-secondary hover:bg-medium-accent-green hover:text-white transition-all duration-200"
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-75">
                    {category.post_count || 0}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-heading-3 text-medium-text-primary">
            Stay Updated
          </h3>
          <div className="bg-medium-bg-secondary rounded-medium p-4">
            <p className="text-body-small text-medium-text-secondary mb-4">
              Get the latest posts delivered right to your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                size="sm"
              />
              <Button
                type="submit"
                fullWidth
                size="sm"
                loading={isSubscribing}
                disabled={!email}
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Archive Widget */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-heading-3 text-medium-text-primary">
            Archive
          </h3>
          <ArchiveWidget posts={recentPosts} isLoading={postsLoading} />
        </div>

      </div>
    </div>
  );
};

export default PersonalBlogSidebar;