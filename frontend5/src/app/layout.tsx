import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Insight - Discover Amazing Stories',
  description: 'Discover amazing stories, insights, and ideas from our community of writers and thinkers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
