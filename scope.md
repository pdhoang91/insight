# UI/UX Refactor Plan — Light-Only, TopDev + Medium Style

## Goals
1. Remove dark theme entirely — light mode only, no theme toggle
2. Redesign UX/UI combining TopDev.vn (clean, professional) + Medium.com (reading-focused) style
3. Fix responsive design: TableOfContents, editor, scroll behavior, nav-content padding
4. Achieve full style consistency across all pages and components

---

## Current State Analysis

### Theme System
- `ThemeContext.js` manages light/dark via `data-theme` attribute + localStorage
- `ThemeToggle.js` component in Navbar (desktop + mobile)
- CSS variables in `globals.css` define both light and dark palettes
- `tailwind.config.ts` has `darkMode: ['class', '[data-theme="dark"]']`
- `themeClasses.js` (920 lines) — central utility, uses CSS variable-based classes
- Dark-specific references: `dark:prose-invert` in 4 places, `dark:` in BubbleToolbar and LinkDialog, `[data-theme="dark"]` in globals.css and mobile.css

### Layout Issues
- Navbar height varies: 56px (mobile) → 64px (sm) → 72px (md) → 80px (lg) — too many breakpoints
- Content offset: `pt-16 md:pt-20` doesn't match all navbar heights
- TOC sticky `top-24` (96px) doesn't align with actual navbar height
- Body `scroll-padding-top: 4rem` (64px) — mismatch with larger navbar
- Sidebar scroll is independent of main content — no coordination
- Container padding `px-4 sm:px-6 md:px-16 lg:px-32 xl:px-48 2xl:px-64` — too aggressive on large screens

### Style Inconsistencies
- PostItem vs PostItemProfile vs BasePostItem: different border-radius (`rounded-lg` vs `rounded-xl`), spacing (`mb-6` vs `mb-8`), and styling approaches
- Mixed usage of `themeClasses` utilities and hardcoded Tailwind classes
- Image aspect ratios vary: `aspect-[16/10]`, `h-48`, `w-16 h-16`
- Hover states inconsistent across components
- Typography: mix of `themeClasses.typography.*` and direct font classes

---

## Implementation Plan

### Phase 1: Remove Dark Theme
Remove all dark mode infrastructure.

**Changes:**
1. **`context/ThemeContext.js`** — Simplify: always return `'light'`, remove localStorage/system preference logic, remove `visibility: hidden` wrapper
2. **`components/UI/ThemeToggle.js`** — Delete file
3. **`components/Navbar/Navbar.js`** — Remove ThemeToggle import and usage, remove `useTheme` import
4. **`components/Navbar/NavbarMobile.js`** — Same removals
5. **`styles/globals.css`** — Remove entire `[data-theme="dark"]` CSS variable block, remove all `[data-theme="dark"]` selectors (syntax highlighting dark, mobile dark)
6. **`styles/mobile.css`** — Remove all `[data-theme="dark"]` rules
7. **`tailwind.config.ts`** — Remove `darkMode` config line
8. **`utils/themeClasses.js`** — Remove `dark:prose-invert` from prose classes
9. **`components/Editor/BubbleToolbar.js`** — Remove `dark:bg-gray-800`
10. **`components/Editor/LinkDialog.js`** — Remove `dark:hover:bg-red-900/20`
11. **`components/Post/PostDetail.js`** — Remove `dark:prose-invert`

**Status:** [x] Completed

### Phase 2: Standardize Layout System
Fix navbar, content offset, sidebar scroll, and container widths.

**Changes:**

#### 2a. Navbar — Consistent Height
- Standardize to **64px** on all breakpoints (matching Medium.com)
- Remove responsive height classes (`h-14 sm:h-16 md:h-18 lg:h-20` → `h-16`)
- Simplify padding and inner layout

#### 2b. Content Offset — Unified
- All pages: `pt-16` (64px) consistently
- TOC sticky: `top-20` (80px = 64px navbar + 16px gap)
- Body `scroll-padding-top: 5rem` (80px)
- Sidebar sticky: `top-20` consistently

#### 2c. Container Widths — TopDev/Medium Inspired
- Max container: `max-w-[1200px]` (TopDev uses ~1200px)
- Reading content: `max-w-[720px]` (Medium uses ~680-720px)
- Homepage: 3-column grid — main content (2/3) + sidebar (1/3)
- Post detail: content (3/4) + TOC sidebar (1/4) on `lg:`
- Consistent horizontal padding: `px-4 md:px-6 lg:px-8`

#### 2d. Sidebar Scroll Fix
- Sidebar uses `position: sticky` with `top-20` and `max-h-[calc(100vh-5rem)]` + `overflow-y-auto`
- Main content scrolls naturally
- No independent scroll containers

**Files changed:**
- `components/Navbar/Navbar.js`
- `components/Navbar/NavbarMobile.js`
- `components/Layout/Layout.js`
- `components/Shared/TableOfContents.js`
- `components/Sidebar/PersonalBlogSidebar.js`
- `styles/globals.css`
- `utils/themeClasses.js` — update layout/spacing/responsive utilities

**Status:** [x] Completed

### Phase 3: Redesign Post Cards — Consistent Components
Unify all post card variants using `BasePostItem.js` as the single source of truth.

**Target design (TopDev + Medium hybrid):**
- Clean white card with subtle border, `rounded-lg`
- Image: `aspect-[16/9]` consistently, `rounded-md`
- Title: serif font, `line-clamp-2`
- Excerpt: sans-serif, `line-clamp-2`, muted color
- Meta: author avatar + name, date, read time, category tag
- Actions: clap count, comment count — always visible (not hover-only)
- Consistent spacing: `p-5`, `gap-4`, `mb-4`

**Changes:**
1. **`BasePostItem.js`** — Rewrite as the single card component with variants: `default`, `compact`, `horizontal`, `profile`
2. **Delete** `PostItem.js`, `PostItemSmall.js`, `PostItemProfile.js` — migrate to BasePostItem variants
3. **Update** all pages/components that import the deleted files
4. **`RelatedPosts.js`** — Use BasePostItem `compact` variant
5. **`RelatedArticles.js`** — Use BasePostItem `default` variant in grid
6. **`PopularPosts.js`** — Use BasePostItem `compact` variant

**Status:** [x] Completed

### Phase 4: Redesign Navbar — TopDev + Medium Style
Clean, professional navbar matching the target aesthetic.

**Target design:**
- White background, subtle bottom border
- Left: Logo/brand name
- Center: Search bar (expandable on mobile)
- Right: Write button (green, prominent), user avatar/menu
- No theme toggle
- Mobile: hamburger menu with slide-in drawer

**Changes:**
- `components/Navbar/Navbar.js` — Full redesign
- `components/Navbar/NavbarMobile.js` — Simplified mobile menu
- Remove ThemeToggle references

**Status:** [x] Completed

### Phase 5: Redesign Homepage — TopDev + Medium Style
Clean, content-focused homepage.

**Target layout:**
```
[Navbar — 64px fixed]
[Hero/Featured Post — optional, full-width banner]
[Main Content Area — max-w-1200px, centered]
  ├── Posts Feed (2/3 width) — BasePostItem cards
  └── Sidebar (1/3 width) — sticky
      ├── Popular Posts
      ├── Categories
      └── Archive
```

**Changes:**
- `pages/index.js` — Update layout structure
- `components/Post/PostList.js` — Use new BasePostItem
- `components/Sidebar/PersonalBlogSidebar.js` — Redesign with consistent styling

**Status:** [x] Completed

### Phase 6: Redesign Post Detail — Reading Experience
Medium-inspired reading layout with proper TOC.

**Target layout:**
```
[Navbar — 64px fixed]
[Post Header — title, author, date, cover image]
[Content Area — max-w-1200px]
  ├── Article Content (3/4) — max-w-720px prose
  └── TOC Sidebar (1/4) — sticky, scrollable
[Related Posts]
[Comments]
```

**Changes:**
- `components/Post/PostDetail.js` — Redesign header and layout
- `components/Post/ArticleReader.js` — Consistent with PostDetail
- `components/Shared/TableOfContents.js` — Fix sticky behavior, responsive collapse
- `components/Post/EngagementActions.js` — Consistent action bar

**Status:** [x] Completed

### Phase 7: Redesign Editor — Responsive & Clean
Fix editor responsive issues.

**Changes:**
- `components/Editor/PostForm.js` — Fix toolbar overflow on mobile, proper padding
- `components/Editor/Toolbar.js` — Horizontal scroll on mobile instead of wrap
- `pages/write.js` — Proper fullscreen mode
- `pages/edit/[id].js` — Same fixes

**Status:** [x] Completed

### Phase 8: Global Style Cleanup
Final pass for consistency.

**Changes:**
1. **`styles/globals.css`** — Clean up orphaned dark mode CSS, standardize typography scale
2. **`utils/themeClasses.js`** — Remove dark-related utilities, ensure all components use this system
3. **`tailwind.config.ts`** — Clean up unused custom values
4. **Audit all components** — Replace hardcoded classes with `themeClasses` equivalents
5. **Standardize transitions** — `transition-colors duration-150` everywhere

**Status:** [x] Completed

---

## Implementation Order

| Phase | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 1 | Remove Dark Theme | Small | None |
| 2 | Standardize Layout System | Medium | Phase 1 |
| 3 | Redesign Post Cards | Medium | Phase 2 |
| 4 | Redesign Navbar | Medium | Phase 1 |
| 5 | Redesign Homepage | Medium | Phase 2, 3, 4 |
| 6 | Redesign Post Detail + TOC | Medium | Phase 2, 3 |
| 7 | Redesign Editor | Small | Phase 2 |
| 8 | Global Style Cleanup | Medium | All above |

**Recommended order:** 1 → 2 → 4 → 3 → 5 → 6 → 7 → 8

---

## Confirmed Decisions

1. **Brand color**: Keep green (`#1A8917`) ✅
2. **Font**: Serif for articles, sans-serif for UI ✅
3. **Homepage**: Add featured/hero post section ✅
4. **Sidebar**: Keep as-is (Popular Posts, Categories, Archive) ✅
5. **Post cards**: Don't show author avatar on cards ✅
6. **ThemeContext**: Fully delete ✅
