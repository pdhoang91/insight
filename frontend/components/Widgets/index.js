// components/widgets/index.js
export { 
  PopularPostsWidget, 
  ArchiveWidget, 
  NewsletterWidget, 
  ReadingProgressWidget 
} from './SidebarWidgets';

// Re-export existing components (for gradual migration)
export { default as OldPopularPostsWidget } from '../Widgets/PopularPostsWidget';
export { default as OldNewsletterWidget } from '../Widgets/NewsletterWidget';
export { default as OldArchiveWidget } from '../Archive/ArchiveWidget';
export { default as ReadingProgressBar } from '../Reading/ReadingProgressBar';
export { default as ReadingStats } from '../Reading/ReadingStats';
