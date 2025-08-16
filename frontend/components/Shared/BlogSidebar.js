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
import { usePopularCategories } from '../../hooks/useCategories';
import { usePopularTags } from '../../hooks/useTags';
import { useRecentPosts, usePopularPosts } from '../../hooks/useRecentPosts';
import CompactPostItem from '../Post/CompactPostItem';

const BlogSidebar = () => {
  // Real API data
  const { categories, isLoading: categoriesLoading } = usePopularCategories(1, 7);
  const { tags, isLoading: tagsLoading } = usePopularTags(9);
  const { posts: popularPosts, isLoading: popularPostsLoading } = usePopularPosts(5);
  const { posts: latestPosts, isLoading: latestPostsLoading } = useRecentPosts(5);

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
    <aside className="space-y-6">
      {/* Popular Posts */}
      {!popularPostsLoading && popularPosts.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
            <FaFire className="w-4 h-4 text-hacker-orange" />
            Bài viết phổ biến
          </h3>
          <div className="space-y-2.5">
            {popularPosts.map((post) => (
              <CompactPostItem key={post.id} post={post} minimal={true} />
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {!categoriesLoading && categories && categories.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
            <FaCode className="w-4 h-4 text-matrix-green" />
            <Link href="/category" className="hover:text-matrix-green transition-colors">
              Danh mục
            </Link>
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 7).map((category, index) => {
              const colorClass = getCategoryColor(index);
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.name.toLowerCase()}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-${colorClass}/10 text-${colorClass} rounded-full text-xs font-medium hover:bg-${colorClass}/20 transition-colors border border-${colorClass}/20`}
                >
                  <FaCode className="w-3 h-3" />
                  <span>{category.name}</span>
                  {category.post_count && (
                    <span className="text-xs opacity-75">({category.post_count})</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Posts */}
      {!latestPostsLoading && latestPosts.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
            <FaClock className="w-4 h-4 text-hacker-blue" />
            Bài viết mới nhất
          </h3>
          <div className="space-y-2.5">
            {latestPosts.map((post) => (
              <CompactPostItem key={post.id} post={post} minimal={true} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      {!tagsLoading && tags && tags.length > 0 && (
        <div className="bg-terminal-gray rounded-lg border border-terminal-border p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
            <FaBolt className="w-4 h-4 text-hacker-yellow" />
            Thẻ phổ biến
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 9).map((tag) => (
              <Link
                key={tag.id}
                href={`/search?q=${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 bg-terminal-light text-text-secondary hover:text-matrix-green hover:bg-terminal-dark text-xs rounded-full border border-terminal-border hover:border-matrix-green/50 transition-all"
              >
                #{tag.name}
                {tag.post_count && (
                  <span className="ml-1 opacity-75">({tag.post_count})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default BlogSidebar; 