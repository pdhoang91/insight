'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCategories } from '../../hooks/useCategories';
import { LoadingScreen } from '../UI';

const CategoryList = () => {
  const { categories, isLoading, isError } = useCategories();

  if (isLoading) {
    return <LoadingScreen message="Đang tải danh mục..." />;
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Không thể tải danh mục
        </p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Không tìm thấy danh mục nào
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        width: '100%',
      }}
    >
      {categories.map((category, index) => {
        const isLargeCard = index % 3 === 0;
        
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              gridColumn: isLargeCard ? 'span 2' : 'span 1',
            }}
            className="md:grid-column-span"
          >
            <Link
              href={`/category/${category.name.toLowerCase()}`}
              style={{
                display: 'block',
                padding: isLargeCard ? '2rem' : '1.5rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                height: '100%',
              }}
              className="category-card group"
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isLargeCard ? '1.375rem' : '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                  marginBottom: '0.5rem',
                  transition: 'color 0.2s',
                  lineHeight: 1.25,
                }}
                className="group-hover:text-[var(--accent)]"
              >
                {category.name}
              </h3>
              
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                }}
              >
                {category.description || 'Khám phá các bài viết trong danh mục này'}
              </p>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}
                >
                  {category.post_count || 0} bài viết
                </span>
                
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    color: 'var(--accent)',
                    opacity: 0,
                    transform: 'translateX(-4px)',
                    transition: 'all 0.2s',
                  }}
                  className="group-hover:opacity-100 group-hover:translate-x-0"
                >
                  →
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CategoryList;
