// components/index.js - Main components export
// New consolidated components
export * from './ui';
export * from './layout';
export * from './post';
export * from './Comment';
export * from './profile';
export * from './category';
export * from './search';
export * from './widgets';
export * from './common';

// Backward compatibility - re-export old structure
export { default as ThreeColumnLayout } from './Layout/ThreeColumnLayout';
export { default as MediumNavbar } from './Navbar/MediumNavbar';
export { default as PersonalBlogSidebar } from './Shared/PersonalBlogSidebar';
export { default as BlogSidebar } from './Shared/BlogSidebar';
export { default as LoginModal } from './Auth/LoginModal';

// Editor components (to be migrated)
export { default as PostForm } from './Editor/PostForm';
export { default as ContentEditor } from './Editor/ContentEditor';
export { default as TitleInput } from './Editor/TitleInput';
export { default as Toolbar } from './Editor/Toolbar';
export { default as ToolbarButton } from './Editor/ToolbarButton';

// Mobile components
export { default as MobileSidebar } from './Mobile/MobileSidebar';
export { default as MobileReadingBar } from './Mobile/MobileReadingBar';

// Reading components
export { default as BookmarkButton } from './Post/BookmarkButton';
export { default as ReadingProgressBar } from './Reading/ReadingProgressBar';
export { default as ReadingStats } from './Reading/ReadingStats';
export { default as TextHighlighter } from './Reading/TextHighlighter';

// Article components
export { default as ArticleReader } from './Article/ArticleReader';
export { default as MediumArticleLayout } from './Article/MediumArticleLayout';
export { default as RelatedArticles } from './Article/RelatedArticles';

// Utils
export { default as TextUtils } from './Utils/TextUtils';
export { default as ThemeWrapper } from './Utils/ThemeWrapper';
export { default as TableOfContents } from './Shared/TableOfContents';
