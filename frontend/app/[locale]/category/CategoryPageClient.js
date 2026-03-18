'use client';

import React from 'react';
import { CategoryList } from '../../../components/Category';
import Footer from '../../../components/Layout/Footer';

export default function CategoryPageClient({ initialCategories }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <main style={{ paddingTop: 'var(--nav-height)', flex: 1 }}>
        <CategoryList initialCategories={initialCategories} />
      </main>
      <Footer />
    </div>
  );
}
