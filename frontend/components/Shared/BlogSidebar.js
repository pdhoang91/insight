import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaSearch, FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaYoutube } from 'react-icons/fa';

const BlogSidebar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Mock data - replace with actual data from your API
  const categories = [
    { name: 'Technology', count: 25, slug: 'technology' },
    { name: 'Programming', count: 18, slug: 'programming' },
    { name: 'Web Development', count: 15, slug: 'web-development' },
    { name: 'AI & Machine Learning', count: 12, slug: 'ai-machine-learning' },
    { name: 'Career', count: 8, slug: 'career' },
    { name: 'Tutorials', count: 22, slug: 'tutorials' },
  ];

  const recentPosts = [
    {
      id: 1,
      title: 'Getting Started with Next.js 14',
      slug: 'getting-started-nextjs-14',
      date: '2024-01-15',
      image: '/images/placeholder.svg'
    },
    {
      id: 2,
      title: 'Modern React Patterns in 2024',
      slug: 'modern-react-patterns-2024',
      date: '2024-01-12',
      image: '/images/placeholder.svg'
    },
    {
      id: 3,
      title: 'Building Scalable APIs with Node.js',
      slug: 'scalable-apis-nodejs',
      date: '2024-01-10',
      image: '/images/placeholder.svg'
    },
    {
      id: 4,
      title: 'CSS Grid vs Flexbox: When to Use What',
      slug: 'css-grid-vs-flexbox',
      date: '2024-01-08',
      image: '/images/placeholder.svg'
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, url: '#', color: 'text-blue-600' },
    { name: 'Twitter', icon: FaTwitter, url: '#', color: 'text-blue-400' },
    { name: 'LinkedIn', icon: FaLinkedin, url: '#', color: 'text-blue-700' },
    { name: 'GitHub', icon: FaGithub, url: '#', color: 'text-gray-800' },
    { name: 'YouTube', icon: FaYoutube, url: '#', color: 'text-red-600' },
  ];

  const tags = [
    'JavaScript', 'React', 'Next.js', 'Node.js', 'TypeScript', 'CSS', 'HTML',
    'Python', 'AI', 'Machine Learning', 'Web Development', 'Frontend', 'Backend',
    'Database', 'DevOps', 'Cloud', 'AWS', 'Docker', 'Kubernetes'
  ];

  return (
    <aside className="space-y-8">
      {/* Search Widget */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search</h3>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <FaSearch className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Categories Widget */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="flex items-center justify-between py-2 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all group"
              >
                <span className="group-hover:translate-x-1 transition-transform">
                  {category.name}
                </span>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">
                  {category.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Posts Widget */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <article key={post.id} className="flex space-x-3 group">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/p/${post.slug}`}>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h4>
                </Link>
                <time className="text-xs text-gray-500 mt-1 block">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Tags Cloud Widget */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-blue-100 hover:text-blue-600 transition-all hover:scale-105"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Social Links Widget */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-lg border border-gray-200 hover:border-transparent transition-all hover:scale-110 hover:shadow-md ${social.color} hover:bg-gray-50`}
                title={social.name}
              >
                <IconComponent className="w-5 h-5" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Newsletter Widget */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-gray-600 text-sm mb-4">
          Subscribe to our newsletter and get the latest articles delivered to your inbox.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all hover:shadow-md"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Blog Stats Widget */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Posts</span>
            <span className="font-semibold text-gray-900">247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Views</span>
            <span className="font-semibold text-gray-900">1.2M</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subscribers</span>
            <span className="font-semibold text-gray-900">15.8K</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Comments</span>
            <span className="font-semibold text-gray-900">3.4K</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BlogSidebar; 