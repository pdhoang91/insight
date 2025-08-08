'use client';

import React from 'react';
import Link from 'next/link';
import { Category, BlogPost } from '@/types/blog';
import BlogCard from '@/components/Blog/BlogCard';

interface SidebarProps {
  categories: Category[];
  recentPosts: BlogPost[];
}

const Sidebar: React.FC<SidebarProps> = ({ categories, recentPosts }) => {
  return (
    <aside className="space-y-8">
      {/* Categories Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  {category.name}
                </span>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {category.postCount}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-6">
          {recentPosts.slice(0, 5).map((post) => (
            <BlogCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get the latest posts delivered right to your inbox.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Popular Tags */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'React', 'Next.js', 'JavaScript', 'CSS', 'TypeScript',
            'Design', 'UI/UX', 'Frontend', 'Backend', 'API'
          ].map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag.toLowerCase()}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 