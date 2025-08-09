import React from 'react';
import Link from 'next/link';
import { FaCode, FaRocket, FaBolt, FaFire, FaClock } from 'react-icons/fa';
import { useCategories } from '../../hooks/useCategories';
import { usePopularTags } from '../../hooks/useTags';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import CompactPostItem from '../Post/CompactPostItem';
import SafeImage from '../Utils/SafeImage';

const BlogSidebar = () => {
  // Real API data
  const { categories, isLoading: categoriesLoading } = useCategories(1, 8);
  const { tags, isLoading: tagsLoading } = usePopularTags(15);
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(10);

  // Tech blog specific stats (these should come from API in production)
  const blogStats = {
    totalPosts: 247,
    totalViews: '1.2M',
    subscribers: '15.8K',
    comments: '3.4K',
  };

  // Split posts for different sections
  // Both sections use same API for now, will be separated later
  const topPosts = recentPosts?.slice(0, 5) || [];
  const latestPosts = recentPosts?.slice(0, 5) || []; // Same data as topPosts for now

  return (
    <aside className="space-y-6">
      {/* Top Posts Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                  <div className="flex items-center space-x-2 mb-4">
            <FaFire className="w-4 h-4 text-red-400" />
            <h3 className="text-lg font-semibold text-white font-mono">TOP POSTS</h3>
          </div>
        
        {postsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-16 h-12 bg-gray-700 rounded"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-700 rounded mb-1"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={post.id} className="flex space-x-3 group">
                {/* Image */}
                <div className="w-16 h-12 flex-shrink-0 relative overflow-hidden rounded">
                  <Link href={`/p/${post.title_name}`}>
                    <SafeImage
                      src={post.image_title}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="64px"
                    />
                  </Link>
                </div>
                
                {/* Title */}
                <div className="flex-1">
                  <Link 
                    href={`/p/${post.title_name}`}
                    className="text-sm font-medium text-gray-200 hover:text-green-400 transition-colors line-clamp-2 leading-tight"
                  >
                    {post.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

             {/* Latest Posts Section - Title Only */}
       <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
         <div className="flex items-center space-x-2 mb-4">
           <FaClock className="w-4 h-4 text-blue-400" />
           <h3 className="text-lg font-semibold text-white font-mono">LATEST POSTS</h3>
         </div>
        
        {postsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="animate-pulse">
                 <div className="h-4 bg-gray-700 rounded"></div>
               </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {latestPosts.map((post, index) => (
              <div key={post.id}>
                                 <Link 
                   href={`/p/${post.title_name}`}
                   className="block text-sm text-gray-300 hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed"
                 >
                   {post.title}
                 </Link>
              </div>
            ))}
          </div>
        )}
      </div>

             {/* Categories Widget - Admin Defined */}
       <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
         <div className="flex items-center space-x-2 mb-4">
           <FaCode className="w-4 h-4 text-purple-400" />
           <h3 className="text-lg font-semibold text-white font-mono">CATEGORIES</h3>
         </div>
         <p className="text-xs text-gray-400 mb-3 font-mono">// curated by editors</p>
        
        {categoriesLoading ? (
          <div className="space-y-2">
                         {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="animate-pulse">
                 <div className="h-8 bg-gray-700 rounded"></div>
               </div>
             ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                                 <Link
                   href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                   className="flex items-center justify-between py-2 px-3 text-gray-300 hover:text-purple-400 hover:bg-gray-700 rounded-md transition-all group"
                 >
                   <span className="group-hover:translate-x-1 transition-transform font-medium">
                     {category.name}
                   </span>
                   <span className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded-full group-hover:bg-gray-600 group-hover:text-purple-400">
                     {category.posts?.length || 0}
                   </span>
                 </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

             {/* Popular Tags Widget - User Generated */}
       <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
         <div className="flex items-center space-x-2 mb-4">
           <FaBolt className="w-4 h-4 text-yellow-400" />
           <h3 className="text-lg font-semibold text-white font-mono">POPULAR TAGS</h3>
         </div>
         <p className="text-xs text-gray-400 mb-3 font-mono">// community driven</p>
        
        {tagsLoading ? (
          <div className="flex flex-wrap gap-2">
                         {Array.from({ length: 12 }).map((_, i) => (
               <div key={i} className="animate-pulse">
                 <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
               </div>
             ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                             <Link
                 key={tag.id}
                 href={`/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
                 className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full hover:bg-gray-600 hover:text-yellow-400 transition-all hover:scale-105 font-medium"
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