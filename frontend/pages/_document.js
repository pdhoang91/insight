// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        {/* Meta tags for SEO and accessibility */}
        <meta charSet="utf-8" />
        <meta name="description" content="Insight - Nền tảng chia sẻ kiến thức công nghệ và lập trình" />
        <meta name="keywords" content="tech, programming, development, insight, blog, công nghệ, lập trình" />
        <meta name="author" content="Insight Team" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Insight" />
        <meta property="og:locale" content="vi_VN" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0a0a0a" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
