import React from 'react';
import Link from 'next/link';
import { 
  FaCode, 
  FaRocket, 
  FaBolt, 
  FaFire, 
  FaClock, 
  FaTerminal, 
  FaDatabase,
  FaServer,
  FaUsers,
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
import SafeImage from '../Utils/SafeImage';

const BlogSidebar = () => {
  // Real API data
  const { categories, isLoading: categoriesLoading } = useCategories(1, 8);
  const { tags, isLoading: tagsLoading } = usePopularTags(15);
  const { posts: recentPosts, isLoading: postsLoading } = useRecentPosts(10);

  // Enhanced tech blog stats with terminal theme
  const systemStats = {
    totalPosts: 247,
    totalViews: '1.2M',
    activeUsers: '15.8K',
    comments: '3.4K',
    uptime: '99.9%',
    load: '0.23',
  };

  // Split posts for different sections
  const topPosts = recentPosts?.slice(0, 5) || [];
  const latestPosts = recentPosts?.slice(0, 5) || [];

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
    <aside className="space-y-6">
      {/* System Monitor */}
      <div className="terminal-window">
        <div className="terminal-header">
          <span>htop@insight</span>
        </div>
        <div className="p-4 bg-terminal-dark">
          <div className="space-y-3 text-sm font-mono">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Posts:</span>
              <span className="text-matrix-green">{systemStats.totalPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Views:</span>
              <span className="text-hacker-yellow">{systemStats.totalViews}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Users:</span>
              <span className="text-matrix-cyan">{systemStats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Load:</span>
              <span className="text-text-secondary">{systemStats.load}</span>
            </div>
            <div className="pt-2 border-t border-matrix-green/30">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="text-matrix-green flex items-center">
                  <span className="w-2 h-2 bg-matrix-green rounded-full animate-pulse mr-2"></span>
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Posts Section - Terminal Style */}
      <div className="terminal-window">
        <div className="terminal-header">
          <FaFire className="w-3 h-3 text-hacker-red mr-2" />
          <span>top@posts</span>
        </div>
        
        <div className="bg-terminal-dark">
          {postsLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="w-16 h-12 bg-terminal-gray rounded border border-matrix-green/30"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-terminal-gray rounded mb-1"></div>
                      <div className="h-3 bg-terminal-gray rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {topPosts.map((post, index) => (
                <div key={post.id} className="flex space-x-3 group">
                  {/* Terminal-style numbering */}
                  <div className="w-6 flex-shrink-0 text-xs font-mono text-matrix-green">
                    {String(index + 1).padStart(2, '0')}.
                  </div>
                  
                  {/* Image with terminal frame */}
                  <div className="w-16 h-12 flex-shrink-0 relative overflow-hidden rounded border border-matrix-green/30 hover:border-matrix-green transition-all">
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
                  
                  {/* Title with terminal styling */}
                  <div className="flex-1">
                    <Link 
                      href={`/p/${post.title_name}`}
                      className="text-sm font-medium text-text-primary hover:text-matrix-green transition-colors line-clamp-2 leading-tight font-mono"
                    >
                      <span className="text-hacker-yellow">$</span> {post.title}
                    </Link>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-text-muted">
                      <span className="flex items-center">
                        <FaEye className="w-3 h-3 mr-1" />
                        {post.views || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories Widget - Terminal Directory Style */}
      <div className="terminal-window">
        <div className="terminal-header">
          <FaCode className="w-3 h-3 text-hacker-purple mr-2" />
          <span>ls /categories</span>
        </div>
        <div className="p-4 bg-terminal-dark">
          <div className="text-xs font-mono text-text-muted mb-3">
            <span className="text-hacker-yellow">//</span> curated by admin
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 bg-terminal-gray rounded border border-matrix-green/30"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = getTechIcon(category.name);
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center justify-between p-2 bg-terminal-gray hover:bg-terminal-light border border-matrix-green/30 hover:border-matrix-green rounded transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-3 h-3 text-matrix-cyan group-hover:text-matrix-green" />
                      <span className="text-sm font-mono text-text-secondary group-hover:text-text-primary">
                        ./{category.name}
                      </span>
                    </div>
                    {category.posts?.length > 0 && (
                      <span className="text-xs font-mono text-text-muted bg-terminal-black px-2 py-1 rounded border border-matrix-green/20">
                        {category.posts.length}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Popular Tags Widget - Terminal Style */}
      <div className="terminal-window">
        <div className="terminal-header">
          <FaBolt className="w-3 h-3 text-hacker-yellow mr-2" />
          <span>grep -r "#tags"</span>
        </div>
        <div className="p-4 bg-terminal-dark">
          <div className="text-xs font-mono text-text-muted mb-3">
            <span className="text-hacker-yellow">//</span> trending now
          </div>
          
          {tagsLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 w-16 bg-terminal-gray rounded border border-matrix-green/30"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3 py-1 bg-terminal-gray text-text-secondary text-sm rounded border border-matrix-green/30 hover:bg-terminal-light hover:text-hacker-yellow hover:border-hacker-yellow/50 transition-all hover:scale-105 font-mono"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest Posts Section - Terminal Log Style */}
      <div className="terminal-window">
        <div className="terminal-header">
          <FaClock className="w-3 h-3 text-matrix-cyan mr-2" />
          <span>tail -f posts.log</span>
        </div>
        
        <div className="bg-terminal-dark">
          {postsLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-terminal-gray rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {latestPosts.map((post, index) => (
                <div key={post.id} className="flex items-start space-x-2">
                  <span className="text-xs font-mono text-matrix-green mt-0.5">
                    [{new Date(post.created_at).toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}]
                  </span>
                  <Link 
                    href={`/p/${post.title_name}`}
                    className="block text-sm text-text-secondary hover:text-matrix-cyan transition-colors line-clamp-2 leading-relaxed font-mono flex-1"
                  >
                    <span className="text-hacker-yellow">INFO:</span> {post.title}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Terminal Commands Help */}
      <div className="terminal-window">
        <div className="terminal-header">
          <FaTerminal className="w-3 h-3 text-matrix-green mr-2" />
          <span>man insight</span>
        </div>
        <div className="p-4 bg-terminal-dark">
          <div className="space-y-2 text-xs font-mono">
            <div className="text-matrix-green mb-2">Quick Commands:</div>
            <div className="text-text-muted space-y-1">
              <div><span className="text-hacker-yellow">Ctrl+K</span> - Search</div>
              <div><span className="text-hacker-yellow">Ctrl+N</span> - New Post</div>
              <div><span className="text-hacker-yellow">Ctrl+H</span> - Home</div>
              <div><span className="text-hacker-yellow">Ctrl+P</span> - Profile</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info Footer */}
      <div className="terminal-window">
        <div className="terminal-header">
          <FaServer className="w-3 h-3 text-matrix-green mr-2" />
          <span>uname -a</span>
        </div>
        <div className="p-4 bg-terminal-dark text-center">
          <div className="text-xs font-mono text-text-muted">
            <div>Insight Terminal v2.0.1</div>
            <div className="mt-1">
              <span className="text-matrix-green">●</span> Powered by Next.js & Go
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BlogSidebar; 