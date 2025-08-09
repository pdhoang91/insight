import React from 'react';
import Link from 'next/link';
import { FaCode, FaRocket, FaBolt } from 'react-icons/fa';
import { useCategories } from '../../hooks/useCategories';
import { usePopularTags } from '../../hooks/useTags';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import CompactPostItem from '../Post/CompactPostItem';

const BlogSidebar = () => {

  // Real API data
  const { categories, isLoading: categoriesLoading } = useCategories(1, 8);
  const { tags, isLoading: tagsLoading } = usePopularTags(15);
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(4);

  // Tech blog specific stats (these should come from API in production)
  const blogStats = {
    totalPosts: 247,
    totalViews: '1.2M',
    subscribers: '15.8K',
    comments: '3.4K',
  };

  return (
    <aside className="space-y-6">

      {/* Categories Widget - Admin Defined */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaCode className="w-4 h-4 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Curated by our editors</p>
        
        {categoriesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center justify-between py-2 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all group"
                >
                  <span className="group-hover:translate-x-1 transition-transform font-medium">
                    {category.name}
                  </span>
                  <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">
                    {category.posts?.length || 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Posts Widget with Enhanced Cards */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaRocket className="w-4 h-4 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Latest Posts</h3>
        </div>
        
        {postsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <CompactPostItem 
                key={post.id} 
                post={post} 
                showImage={true} 
                showStats={true} 
              />
            ))}
          </div>
        )}

        {/* View all posts link */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link 
            href="/explore" 
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View all posts</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Popular Tags Widget - User Generated */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaBolt className="w-4 h-4 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Popular Tags</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">Created by our community</p>
        
        {tagsLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-blue-100 hover:text-blue-600 transition-all hover:scale-105 font-medium"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>




    </aside>
  );
};

export default BlogSidebar; 