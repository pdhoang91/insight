# 🚀 Insight Frontend5 - Modern Blog Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.13.5-pink?logo=framer)](https://www.framer.com/motion/)

**Frontend5** is a modern, scalable blog platform built with Next.js App Router, featuring professional UI/UX design, comprehensive animations, and mobile-first responsive architecture.

## ✨ Features

### 🔐 Authentication
- **Login/Register Modal** with smooth animations
- **Session Management** with token-based auth
- **Protected Routes** for authenticated users
- **User Profiles** with avatar and bio

### ✍️ Content Management
- **Rich Post Editor** with auto-resize textarea
- **Image Upload** with preview functionality
- **Category & Tag System** for content organization
- **Publish Modal** with content preview
- **Draft/Published** status management

### 💬 Social Features
- **Comment System** with threaded replies
- **Like/Bookmark** functionality
- **Follow System** ready for implementation
- **User Profiles** with post history
- **Engagement Metrics** (views, likes, comments)

### 🎨 Modern UI/UX
- **Professional Design** with gradient themes
- **Framer Motion Animations** throughout
- **Skeleton Loading** for better perceived performance
- **Responsive Design** optimized for mobile
- **Interactive Hover States** and micro-interactions

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript 5.0.0
- **Styling**: Tailwind CSS 3.4.1
- **Animations**: Framer Motion 11.13.5
- **HTTP Client**: Axios 1.7.9
- **Data Fetching**: SWR 2.3.0
- **Icons**: React Icons
- **Image Optimization**: Next.js Image component

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd insight/frontend5

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 📁 Project Structure

```
frontend5/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Homepage
│   │   ├── [username]/        # User profile pages
│   │   ├── blog/[slug]/       # Blog post pages
│   │   ├── write/             # Write post page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── layout/            # Layout components (Header, Footer)
│   │   └── ui/                # Reusable UI components
│   ├── features/              # Feature-based modules
│   │   ├── auth/              # Authentication components
│   │   ├── blog/              # Blog functionality
│   │   ├── posts/             # Post management
│   │   └── comments/          # Comment system
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API service layer
│   ├── types/                 # TypeScript type definitions
│   ├── lib/                   # Utility functions
│   └── config/                # Configuration files
├── public/                    # Static assets
└── docs/                      # Documentation files
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (600-700) with purple gradients
- **Secondary**: Gray scale (50-900)
- **Accent**: Yellow/Orange gradients for highlights
- **Status**: Green (success), Red (error), Blue (info)

### Typography
- **Headings**: Font-bold with gradient text effects
- **Body**: Regular weight with optimized line-height
- **Small Text**: Text-sm for metadata and captions

### Components
- **Button**: Multiple variants (primary, secondary, ghost)
- **Cards**: Blog cards with hover animations
- **Modals**: Animated modals with backdrop blur
- **Forms**: Validated forms with error states
- **Loading**: Skeleton loading components

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (touch-optimized)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large**: > 1280px

### Mobile Features
- Touch-friendly interface with proper touch targets
- Collapsible navigation menu
- Optimized typography and spacing
- Swipe gestures support (infrastructure ready)

## ⚡ Performance

### Bundle Analysis
- **Homepage**: 2.85 kB
- **Profile**: 2.98 kB  
- **Blog Detail**: 4.26 kB
- **Write**: 3.14 kB
- **Shared JS**: 99.7 kB

### Optimizations
- Route-based code splitting
- Image optimization with Next.js Image
- Tree shaking for unused code elimination
- Lazy loading for components
- Efficient re-renders with proper React keys

## 🔧 Development

### Code Organization
- **Feature-based architecture** for scalability
- **Custom hooks** for business logic separation
- **Service layer** for API abstraction
- **TypeScript** for type safety
- **ESLint + Prettier** for code consistency

### State Management
- **Custom hooks** for local state
- **SWR** for server state management
- **Context API** for global state (auth)
- **Local Storage** for persistence

### Testing (Ready for Implementation)
- Jest + React Testing Library setup ready
- Component testing infrastructure
- E2E testing with Playwright (planned)

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Deployment Options
- **Vercel** (recommended for Next.js)
- **Netlify** 
- **Custom server** with Docker
- **Static export** for CDN deployment

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_APP_URL=your_app_url
```

## 🔗 Backend Integration

The frontend is designed to work with RESTful APIs. Update the service files in `src/services/` to connect to your backend:

- `auth.service.ts` - Authentication endpoints
- `post.service.ts` - Blog post CRUD operations
- `user.service.ts` - User profile management
- `comment.service.ts` - Comment system

## 📚 Documentation

- **[Architecture](./ARCHITECTURE.md)** - Detailed architecture overview
- **[Migration Summary](./MIGRATION_SUMMARY.md)** - Migration from original frontend
- **[UI/UX Improvements](./UX_UI_IMPROVEMENTS.md)** - Design enhancement details
- **[Final Summary](./FINAL_SUMMARY.md)** - Complete project summary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Update documentation for new features
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **React Community** for the ecosystem

## 📞 Support

If you have any questions or need support:
- Create an issue on GitHub
- Check the documentation files
- Review the code examples in the codebase

---

**Built with ❤️ using modern web technologies**

🚀 **Ready for Production** | 📱 **Mobile Optimized** | ⚡ **High Performance** | 🎨 **Beautiful UI/UX**
