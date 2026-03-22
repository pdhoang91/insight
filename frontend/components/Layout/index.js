/**
 * components/layout/ — App shell barrel
 *
 * Aggregates all layout-level components: page shells, navigation, sidebars.
 * Import from here for cleaner paths:
 *
 *   import { HomeLayout, Navbar, PersonalBlogSidebar } from '../../components/layout';
 *
 * (Files remain in their original folders for now; this barrel is the canonical
 * import path going forward. Folder migration can happen incrementally per module.)
 */

// Page layout shells
export {
  default as Layout,
  HomeLayout,
  ProfileLayout,
  ArticleLayout,
  ReadingLayout,
  WriteLayout,
} from '../Layout/Layout';

// Navigation
export { default as Navbar } from '../Navbar/Navbar';
export { default as MobileSlidePanel } from '../Navbar/MobileSlidePanel';

// Sidebars
export { default as PersonalBlogSidebar } from '../Sidebar/PersonalBlogSidebar';
export { default as StickyCategoryBar } from '../Sidebar/StickyCategoryBar';
export { default as ExplorePanelContent } from '../Sidebar/ExplorePanelContent';

// Footer
export { default as Footer } from '../Layout/Footer';
