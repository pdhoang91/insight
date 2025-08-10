import React from 'react';
import Link from 'next/link';
import { 
  FaCode, 
  FaRocket, 
  FaBolt, 
  FaFire, 
  FaClock, 
  FaEye,
  FaComment,
  FaHeart
} from 'react-icons/fa';
import { 
  SiReact, 
  SiJavascript, 
  SiPython, 
  SiDocker, 
  SiKubernetes,
  SiLinux,
  SiGit
} from 'react-icons/si';
import { useCategories } from '../../hooks/useCategories';
import { usePopularTags } from '../../hooks/useTags';
import { useRecentPosts } from '../../hooks/useRecentPosts';
import CompactPostItem from '../Post/CompactPostItem';

const BlogSidebar = () => {
  // Real API data
  const { categories, isLoading: categoriesLoading } = useCategories(1, 8);
  const { tags, isLoading: tagsLoading } = usePopularTags(15);
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(10);

  // Split posts for different sections
  const topPosts = recentPosts?.slice(0, 5) || [];
  const latestPosts = recentPosts?.slice(5, 10) || [];

  // Simple category colors for technical look
  const getCategoryColor = (index) => {
    const colors = [
      'matrix-green',
      'hacker-blue', 
      'hacker-orange',
      'hacker-yellow',
      'purple-500',
      'cyan-500',
      'pink-500',
      'red-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <aside className="space-y-8">
      {/* Popular Posts */}
      {!postsLoading && topPosts.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FaFire className="w-4 h-4 text-hacker-orange" />
            Popular Posts
          </h3>
          <div className="space-y-3">
            {topPosts.map((post) => (
              <CompactPostItem key={post.id} post={post} minimal={true} />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {!categoriesLoading && categories && categories.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FaCode className="w-4 h-4 text-matrix-green" />
            <Link href="/category" className="hover:text-matrix-green transition-colors">
              Categories
            </Link>
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category, index) => {
              const colorClass = getCategoryColor(index);
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.name.toLowerCase()}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-${colorClass}/10 text-${colorClass} rounded-full text-xs font-medium hover:bg-${colorClass}/20 transition-colors border border-${colorClass}/20`}
                >
                  <FaCode className="w-3 h-3" />
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Posts */}
      {!postsLoading && latestPosts.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FaClock className="w-4 h-4 text-hacker-blue" />
            Latest Posts
          </h3>
          <div className="space-y-3">
            {latestPosts.map((post) => (
              <CompactPostItem key={post.id} post={post} minimal={true} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      {!tagsLoading && tags && tags.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FaBolt className="w-4 h-4 text-hacker-yellow" />
            Popular Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 12).map((tag) => (
              <Link
                key={tag.id}
                href={`/search?q=${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 bg-terminal-light text-text-secondary hover:text-matrix-green hover:bg-terminal-dark text-xs rounded-full border border-terminal-border hover:border-matrix-green/50 transition-all"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default BlogSidebar; 