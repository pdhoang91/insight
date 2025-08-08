import { BlogPost, Category, Author } from '@/types/blog';

export const mockAuthors: Author[] = [
  {
    id: '1',
    name: 'Author',
    email: 'author@example.com',
    avatar: '/images/avatar-1.jpg',
    bio: 'Content writer and blogger',
    social: {
      twitter: '@author'
    }
  },
  {
    id: '2',
    name: 'Saarah Mcbride',
    email: 'saarah@example.com',
    avatar: '/images/avatar-2.jpg',
    bio: 'Real estate and sustainability expert',
    social: {
      linkedin: 'saarah-mcbride'
    }
  },
  {
    id: '3',
    name: 'Cruz Mcintyre',
    email: 'cruz@example.com',
    avatar: '/images/avatar-3.jpg',
    bio: 'Food enthusiast and travel writer',
    social: {
      instagram: '@cruzmcintyre'
    }
  },
  {
    id: '4',
    name: 'Amna',
    email: 'amna@example.com',
    avatar: '/images/avatar-2.jpg',
    bio: 'Photography artist and visual storyteller',
    social: {
      instagram: '@amna_photography'
    }
  },
  {
    id: '5',
    name: 'Clara Wilson',
    email: 'clara@example.com',
    avatar: '/images/avatar-5.jpg',
    bio: 'Sustainable travel advocate',
    social: {
      twitter: '@clarawilson'
    }
  },
  {
    id: '6',
    name: 'Sophia Turner',
    email: 'sophia@example.com',
    avatar: '/images/avatar-6.jpg',
    bio: 'Interior designer and minimalism expert',
    social: {
      linkedin: 'sophia-turner'
    }
  }
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Technology',
    slug: 'technology',
    description: 'Digital trends and innovation',
    color: 'bg-blue-500',
    postCount: 8
  },
  {
    id: '2',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Living better and mindfully',
    color: 'bg-green-500',
    postCount: 12
  },
  {
    id: '3',
    name: 'Travel',
    slug: 'travel',
    description: 'Explore the world responsibly',
    color: 'bg-orange-500',
    postCount: 6
  },
  {
    id: '4',
    name: 'Design',
    slug: 'design',
    description: 'Art, creativity and visual inspiration',
    color: 'bg-purple-500',
    postCount: 4
  }
];

export const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Digital Declutter: Cutting the Noise in a Hyperconnected World',
    excerpt: 'In today\'s hyperconnected world, the lines between work, leisure, and rest have blurred significantly. Notifications, endless streams of content, and the need to always stay connected often create a digital noise that impacts mental well-being, focus, and productivity. This is where the concept of digital declutter comes into play.',
    content: 'Full article content here...',
    author: mockAuthors[0],
    category: mockCategories[0],
    tags: ['Digital Wellness', 'Productivity', 'Mental Health', 'Technology'],
    publishedAt: '2024-11-29',
    readTime: 8,
    featured: false,
    image: {
      url: '/images/article-1.jpg',
      alt: 'Digital declutter concept'
    },
    slug: 'digital-declutter-cutting-noise-hyperconnected-world'
  },
  {
    id: '2',
    title: 'Eco-Friendly Homes: The Future of Real Estate',
    excerpt: 'The real estate industry is undergoing a significant transformation as eco-friendly homes gain popularity among buyers and developers alike. With increasing awareness of climate change and the need for sustainable living, eco-friendly homes represent not only a lifestyle choice but also a critical step toward reducing environmental impact.',
    content: 'Full article content here...',
    author: mockAuthors[1],
    category: mockCategories[1],
    tags: ['Sustainability', 'Real Estate', 'Green Living', 'Environment'],
    publishedAt: '2024-11-29',
    readTime: 10,
    featured: false,
    image: {
      url: '/images/article-2.jpg',
      alt: 'Eco-friendly sustainable home'
    },
    slug: 'eco-friendly-homes-future-real-estate'
  },
  {
    id: '3',
    title: 'A Foodie\'s Guide to Europe: Best Culinary Experiences by Country',
    excerpt: 'Europe is a treasure trove of culinary delights, offering a diverse array of flavors, techniques, and traditions. For food enthusiasts, the continent provides endless opportunities to indulge in authentic dishes and unforgettable dining experiences.',
    content: 'Full article content here...',
    author: mockAuthors[2],
    category: mockCategories[2],
    tags: ['Food', 'Travel', 'Europe', 'Culinary'],
    publishedAt: '2024-11-29',
    readTime: 12,
    featured: false,
    image: {
      url: '/images/article-3.jpg',
      alt: 'European cuisine and dining'
    },
    slug: 'foodie-guide-europe-best-culinary-experiences'
  },
  {
    id: '4',
    title: 'The Art of Black-and-White Photography',
    excerpt: 'Black-and-white photography is a timeless art form that transcends trends and technology. By stripping away color, this medium emphasizes composition, texture, and emotion, creating images that are both powerful and evocative.',
    content: 'Full article content here...',
    author: mockAuthors[3],
    category: mockCategories[3],
    tags: ['Photography', 'Art', 'Black and White', 'Visual Arts'],
    publishedAt: '2024-11-29',
    readTime: 7,
    featured: false,
    image: {
      url: '/images/article-4.jpg',
      alt: 'Black and white photography'
    },
    slug: 'art-of-black-and-white-photography'
  },
  {
    id: '5',
    title: 'Sustainable Travel Tips: Reducing Your Carbon Footprint',
    excerpt: 'Practical advice for eco-conscious travelers to explore the world responsibly and sustainably.',
    content: 'Full article content here...',
    author: mockAuthors[4],
    category: mockCategories[2],
    tags: ['Sustainable Travel', 'Environment', 'Carbon Footprint', 'Eco Tourism'],
    publishedAt: '2024-11-29',
    readTime: 9,
    featured: false,
    image: {
      url: '/images/article-5.jpg',
      alt: 'Sustainable travel and nature'
    },
    slug: 'sustainable-travel-tips-reducing-carbon-footprint'
  },
  {
    id: '6',
    title: 'The Rise of Minimalist Interior Design',
    excerpt: 'Learn how to create serene and functional spaces with the principles of minimalist interior design.',
    content: 'Full article content here...',
    author: mockAuthors[5],
    category: mockCategories[3],
    tags: ['Interior Design', 'Minimalism', 'Home Decor', 'Lifestyle'],
    publishedAt: '2024-11-29',
    readTime: 6,
    featured: false,
    image: {
      url: '/images/article-6.jpg',
      alt: 'Minimalist interior design'
    },
    slug: 'rise-of-minimalist-interior-design'
  }
]; 