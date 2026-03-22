/**
 * components/index.js — Master component barrel
 *
 * Import convention:
 *   - UI primitives  → from './UI' or individual files
 *   - Layout/nav     → from './layout' (new canonical path)
 *   - Feature comps  → from their feature folder directly
 *
 * This file re-exports the most commonly used components for convenience.
 * For the full list of each category, see the folder-level index.js.
 */

// ─── UI Primitives ────────────────────────────────────────────────────────────
export * from './UI';

// ─── Layout & Navigation (use './layout' barrel going forward) ────────────────
export { default as Navbar } from './Navbar/Navbar';
export {
  default as Layout,
  HomeLayout,
  ProfileLayout,
  ArticleLayout,
  ReadingLayout,
  WriteLayout,
} from './Layout/Layout';
export { default as PersonalBlogSidebar } from './Sidebar/PersonalBlogSidebar';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export { default as LoginModal } from './Auth/LoginModal';

// ─── Post feature ─────────────────────────────────────────────────────────────
export { default as BasePostItem } from './Post/BasePostItem';
export { default as PostList } from './Post/PostList';
export { default as PostDetail } from './Post/PostDetail';
export { default as PostFeed } from './Post/PostFeed';

// ─── Comment feature ──────────────────────────────────────────────────────────
export * from './Comment';

// ─── Editor feature ───────────────────────────────────────────────────────────
export { default as PostForm } from './Editor/PostForm';
export { default as ContentEditor } from './Editor/ContentEditor';
export { default as TitleInput } from './Editor/TitleInput';
export { default as ToolbarButton } from './Editor/ToolbarButton';
export { default as PublishPanel } from './Editor/PublishPanel';

// ─── Archive ──────────────────────────────────────────────────────────────────
export { default as Archive } from './Archive/Archive';

// ─── Utils (legacy re-export, prefer importing from utils/ directly) ──────────
export { default as TextUtils } from '../utils/TextUtils';
