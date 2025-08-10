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

  // Tech icons mapping for categories
  const getTechIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('react')) return SiReact;
    if (name.includes('javascript') || name.includes('js')) return SiJavascript;
    if (name.includes('python')) return SiPython;
    if (name.includes('docker')) return SiDocker;
    if (name.includes('kubernetes')) return SiKubernetes;
    if (name.includes('linux')) return SiLinux;
    if (name.includes('git')) return SiGit;
    return FaCode;
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
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <Link key={post.id} href={`/p/${post.title_name}`}>
                <div className="flex items-start gap-3 p-3 rounded hover:bg-terminal-light transition-colors">
                  <span className="text-matrix-green/70 text-sm font-mono min-w-[1.5rem]">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-text-primary hover:text-matrix-green transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <FaEye className="w-3 h-3" />
                        <span>{post.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaComment className="w-3 h-3" />
                        <span>{post.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {!categoriesLoading && categories && categories.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FaCode className="w-4 h-4 text-matrix-green" />
            Categories
          </h3>
          <div className="space-y-2">
            {categories.slice(0, 8).map((category) => {
              const IconComponent = getTechIcon(category.name);
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.name.toLowerCase()}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-terminal-light transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-matrix-green/70 group-hover:text-matrix-green" />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted bg-terminal-light px-2 py-1 rounded">
                    {category.post_count || 0}
                  </span>
                </Link>
              );
            })}
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

      {/* Recent Activity */}
      <div className="bg-terminal-gray rounded-lg border border-terminal-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FaClock className="w-4 h-4 text-matrix-cyan" />
          Recent Activity
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <div className="w-2 h-2 bg-matrix-green rounded-full"></div>
            <span>New posts published</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <div className="w-2 h-2 bg-hacker-yellow rounded-full"></div>
            <span>Comments updated</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <div className="w-2 h-2 bg-matrix-cyan rounded-full"></div>
            <span>Categories refreshed</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BlogSidebar; 