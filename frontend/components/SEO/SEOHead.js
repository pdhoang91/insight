// components/SEO/SEOHead.js
import Head from 'next/head';

const SEOHead = ({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  category,
  tags = []
}) => {
  const siteTitle = 'Insight Blog';
  const siteDescription = 'Discover the latest insights, tutorials, and thoughts on technology, development, and more.';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-blog.com';
  
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const pageDescription = description || siteDescription;
  const pageImage = image || `${siteUrl}/default-og-image.jpg`;
  const pageUrl = url || siteUrl;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebSite',
    "name": pageTitle,
    "headline": title,
    "description": pageDescription,
    "image": pageImage,
    "url": pageUrl,
    ...(type === 'article' && {
      "author": {
        "@type": "Person",
        "name": author || "Blog Author"
      },
      "publisher": {
        "@type": "Organization",
        "name": siteTitle,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        }
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": pageUrl
      },
      ...(category && { "articleSection": category }),
      ...(tags.length > 0 && { "keywords": tags.join(', ') })
    })
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={pageUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* Article-specific meta tags */}
      {type === 'article' && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {category && <meta property="article:section" content={category} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#1A8917" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </Head>
  );
};

export default SEOHead;
