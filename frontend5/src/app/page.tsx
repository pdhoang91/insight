'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import BlogCard from '@/components/BlogCard';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import { mockBlogPosts } from '@/data/mockData';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  // Get posts for current page (for "All blog posts" section)
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = mockBlogPosts.slice(startIndex + 3, startIndex + 3 + postsPerPage); // Skip first 3 for featured section
  const totalPages = Math.ceil((mockBlogPosts.length - 4) / postsPerPage); // -4 because we use 4 posts in featured sections

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
        <div className="min-h-screen bg-white">
      {/* Header with Navigation and Hero */}
      <Header />

      {/* Main Blog Content */}
      <main className="w-full max-w-[1440px] mx-auto">
        
        {/* Recent Blog Posts Section */}
        <section className="section-padding bg-white">
          <div className="max-w-[1280px] mx-auto px-8">
            <div className="flex flex-col gap-8">
              <h2 className="text-2xl font-semibold text-[#1a1a1a] leading-[1.33]">
                Recent blog posts
              </h2>
              
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                {/* Featured Large Post */}
                <div className="flex-1">
                  <BlogCard post={mockBlogPosts[0]} variant="large" />
                </div>
                
                {/* Smaller Posts Column */}
                <div className="flex flex-col gap-8 justify-center flex-1">
                  <BlogCard post={mockBlogPosts[1]} variant="small" />
                  <BlogCard post={mockBlogPosts[2]} variant="small" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post Section */}
        <section className="section-padding bg-white">
          <div className="max-w-[1280px] mx-auto px-8">
            <BlogCard post={mockBlogPosts[3]} variant="featured" />
          </div>
        </section>

        {/* All Blog Posts Section */}
        <section className="section-padding bg-white">
          <div className="max-w-[1280px] mx-auto px-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-8">
                <h2 className="text-2xl font-semibold text-[#1a1a1a] leading-[1.33]">
                  All blog posts
                </h2>
                
                <div className="flex flex-col gap-12">
                  {/* First Row */}
                  <div className="flex flex-col md:flex-row gap-8 items-stretch">
                    <BlogCard post={mockBlogPosts[4]} variant="medium" />
                    <BlogCard post={mockBlogPosts[5]} variant="medium" />
                    <BlogCard post={mockBlogPosts[6]} variant="medium" />
                  </div>
                  
                  {/* Second Row */}
                  <div className="flex flex-col md:flex-row gap-8 items-stretch">
                    <BlogCard post={mockBlogPosts[7]} variant="medium" />
                    <BlogCard post={mockBlogPosts[8]} variant="medium" />
                    <BlogCard post={mockBlogPosts[9]} variant="medium" />
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <Pagination 
                currentPage={currentPage}
                totalPages={10}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
