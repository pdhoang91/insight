// components/Widgets/index.js - Sidebar widgets
export { 
  PopularPostsWidget, 
  ArchiveWidget, 
  NewsletterWidget, 
  ReadingProgressWidget 
} from './SidebarWidgets';

// Legacy widgets (maintain for backward compatibility)
export { default as PopularPostsWidget as LegacyPopularPostsWidget } from './PopularPostsWidget';
export { default as NewsletterWidget as LegacyNewsletterWidget } from './NewsletterWidget';
export { default as ArchiveWidget as LegacyArchiveWidget } from '../Archive/ArchiveWidget';
