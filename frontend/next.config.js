/* next.config.js */
module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '82',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.w3schools.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'insight.storage.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Fallback for older Next.js versions
    domains: [
      'localhost',
      'www.w3schools.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'cdn.pixabay.com',
      'www.gravatar.com',
      'insight.storage.s3.amazonaws.com',
      's3.amazonaws.com'
    ],
    // Enable dangerous allow all for development (remove in production)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable SSL verification for development (remove in production)
    ...(process.env.NODE_ENV === 'development' && {
      unoptimized: false,
      loader: 'default',
    }),
  },
  // Add experimental flag to handle SSL issues in development
  experimental: {
    ...(process.env.NODE_ENV === 'development' && {
      serverComponentsExternalPackages: [],
    }),
  },
};
  