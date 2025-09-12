// components/index.js - Main components export

// Core UI Components
export * from './UI';

// Layout Components
export { default as Navbar } from './Navbar/Navbar';
export { default as PageLayout } from './Layout/PageLayout';

// Content Components
export { default as PostItem } from './Post/PostItem';
export { default as PostItemSmall } from './Post/PostItemSmall';
export { default as PostItemProfile } from './Post/PostItemProfile';
export { default as ArticleReader } from './Post/ArticleReader';

// Comment System
export * from './Comment';

// Auth Components
export { default as LoginModal } from './Auth/LoginModal';

// Editor components (to be migrated)
export { default as PostForm } from './Editor/PostForm';
export { default as ContentEditor } from './Editor/ContentEditor';
export { default as TitleInput } from './Editor/TitleInput';
export { default as Toolbar } from './Editor/Toolbar';
export { default as ToolbarButton } from './Editor/ToolbarButton';

// Sidebar components
export { default as PersonalBlogSidebar } from './Sidebar/PersonalBlogSidebar';

// Post components
export { default as PopularPosts } from './Post/PopularPosts';

// Newsletter components
export { default as Newsletter } from './Newsletter/Newsletter';

// Archive components
export { default as Archive } from './Archive/Archive';

// Post components
export { default as BookmarkButton } from './Post/BookmarkButton';
export { default as TextHighlighter } from './Post/TextHighlighter';

// Article components
export { default as RelatedArticles } from './Article/RelatedArticles';

// Utils
export { default as TextUtils } from './Utils/TextUtils';
export { default as ThemeWrapper } from './Utils/ThemeWrapper';
export { default as TableOfContents } from './Shared/TableOfContents';

// Shared Components
export { default as SkeletonLoader } from './Shared/SkeletonLoader';

// Base Components
export { default as BasePostItem } from './Post/BasePostItem';
