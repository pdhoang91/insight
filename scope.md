# UI/UX Refactor Plan — Round 2

## Goals
1. Remove unnecessary hover effects (green/gray background hovers)
2. Redesign Publish Article popup (categories, tags UX)
3. Redesign editor to match Medium's writing flow
4. Redesign comment/clap UX and verify count logic
5. Redesign TOC + Post Detail to match 200lab.io/blog style
6. Add language switcher (Vietnamese / English)

---

## Phase 1: Remove Unnecessary Hover Effects

Strip distracting hover backgrounds across the app. Keep only meaningful hover states (links → color change, buttons → subtle opacity/color).

**Principle:** Hover should communicate "this is clickable", not decorate. No `hover:bg-*` on non-button elements. No `hover:scale-*` anywhere.

**Files & specific changes:**

### 1a. `BasePostItem.js`
- Category tags: Remove `hover:bg-medium-accent-green hover:text-white` → use `hover:text-medium-accent-green` only
- Horizontal variant: Remove `hover:bg-medium-hover` from link wrapper
- Profile variant: Remove `hover:shadow-md` from article

### 1b. `CategoryTagsPopup.js`
- Close button: Remove `hover:bg-medium-hover`
- Category buttons: Remove `hover:bg-medium-hover hover:shadow-md hover:scale-102`
- Selected tags: Remove `hover:scale-105`
- Cancel button: Remove `hover:bg-medium-hover hover:scale-105`
- Publish button: Remove `hover:shadow-xl hover:scale-105 hover:-translate-y-0.5`

### 1c. `Navbar.js`
- User menu items: Remove `hover:bg-medium-bg-secondary` → keep `hover:text-medium-accent-green` only
- Mobile menu items: Same treatment

### 1d. `PopularPosts.js`
- Post links: Remove `hover:bg-medium-accent-green/5`

### 1e. `PostDetail.js`
- Action buttons (clap, comment, share): Remove `hover:bg-medium-hover` → keep `hover:text-medium-accent-green`

### 1f. `CommentItem.js`
- Uses `themeClasses.text.accentHover` which is fine (text color only)
- No background hover to remove

### 1g. `AddCommentForm.js`
- Submit button: Remove `hover:scale-105`

### 1h. `LimitedCommentList.js`
- Load more button: Remove `hover:bg-medium-hover hover:shadow-md`

### 1i. `PersonalBlogSidebar.js`
- Category links: Remove `hover:bg-medium-accent-green hover:text-white` → use `hover:text-medium-accent-green`

**Status:** [x] Completed

---

## Phase 2: Redesign Publish Article Popup

Current issues: Over-decorated, too many icons, excessive animations, `themeClasses` indirection makes it hard to read.

**Target design:** Clean modal like Medium's publish flow — simple, focused, minimal chrome.

**Changes to `CategoryTagsPopup.js`:**

1. **Header**: Simplify — just title + close X, no subtitle
2. **Categories section**:
   - Replace grid cards with simple checkbox list or pill toggles
   - Remove FaTag icons from each category
   - Remove green check badge overlay
   - Simple selected state: filled pill (green bg + white text)
   - Unselected: outlined pill (border + gray text)
3. **Tags section**:
   - Replace comma-separated input with tag chips input (type → Enter to add)
   - Show tags as removable pills below input
   - Remove suggested tags section (or make it subtle)
4. **Footer**: Simple two buttons — "Cancel" (text) and "Publish" (green filled)
5. **Remove all**: `hover:scale-*`, `hover:shadow-*`, `transform`, excessive `themeClasses` usage
6. **Use plain Tailwind** classes directly (consistent with Navbar rewrite)

**Status:** [x] Completed

---

## Phase 3: Redesign Editor — Medium-style Writing Flow

Current issues: Toolbar is cluttered, PostForm uses heavy `themeClasses` indirection, editor area doesn't feel like Medium's clean writing surface.

**Target:** Medium.com's writing experience — clean white canvas, minimal toolbar, focus on content.

**Changes:**

### 3a. `PostForm.js`
- Remove `themeClasses`/`combineClasses` — use plain Tailwind
- Editor area: white background, generous padding, `max-w-[720px]` centered
- Title input: Large serif font, no border, placeholder "Title"
- Content area: Serif font for body text, clean prose styling
- Word count: subtle, bottom-right

### 3b. `Toolbar.js`
- Already fixed for horizontal scroll — keep that
- Reduce visual weight: lighter border, smaller icons
- Consider hiding toolbar on scroll (show on hover/focus)

### 3c. `TitleInput.js`
- Large, clean title field — Medium uses ~42px serif bold
- Cover image upload: subtle "Add cover image" button, not a separate section

### 3d. `pages/write.js` & `pages/edit/[id].js`
- Remove `themeClasses` usage
- Clean layout: just the editor, centered, white background

**Status:** [x] Completed

---

## Phase 4: Redesign Comment & Clap UX + Verify Counts

### 4a. Comment Design
Current `CommentItem.js` uses heavy `themeClasses` indirection. Redesign to be cleaner.

**Target design (Medium-inspired):**
- Avatar + name + time on one line
- Comment text below
- Actions: heart + reply — inline, subtle
- Reply form: inline textarea, appears on click
- Nested replies: left border indent (not card-in-card)

**Files:**
- `CommentItem.js` — full rewrite with plain Tailwind
- `AddCommentForm.js` — simplify, remove hover:scale
- `LimitedCommentList.js` — simplify load more button
- `ReplyList.js` — check and align style

### 4b. Clap UX
- Current: `useClapsCount` hook fetches `getClapInfo(type, id)` returning `{ clapCount, hasClapped }`
- Verify: Does `clapPost()` increment correctly? Does `mutateClaps()` refetch?
- UX: Clap button should animate on click (brief scale pulse), show count update immediately (optimistic)

**Files to verify:**
- `hooks/useClapsCount.js` — check SWR key and mutate behavior
- `services/activityService.js` — check `clapPost()` and `getClapInfo()` API calls
- `BasePostItem.js` — clap handler
- `PostDetail.js` — clap handler

**Status:** [x] Completed

---

## Phase 5: Redesign TOC + Post Detail — 200lab.io Style

### Reference: 200lab.io/blog
- TOC: "Mục Lục" header, collapsible, shows numbered headings
- Post detail: Clean article layout, author info at top, tags at bottom
- Reading progress indicator (optional)
- Content: well-spaced, serif body, code blocks with language labels

### 5a. `TableOfContents.js` — Redesign
Current: left-border indicator, "On this page" header. Good start but needs:
- **Collapsible** on mobile (accordion)
- **Numbered items** matching heading hierarchy
- **Progress indicator**: highlight current section as user scrolls
- **200lab style**: Card with "Mục Lục" header, list items with dotted lines or numbers
- Position: sticky sidebar on desktop, collapsible card above content on mobile

### 5b. `PostDetail.js` — Redesign
Current layout is good (article + TOC sidebar). Enhance:
- **Author info section**: avatar + name + date + read time (like 200lab)
- **Tags at bottom**: pill-style tags after content
- **Share buttons**: at bottom of article, not in header
- **Related articles**: card grid at bottom (like 200lab's "Bài viết liên quan")
- **Reading progress bar**: thin green bar at top of page showing scroll progress

### 5c. `pages/p/[id].js`
- Add reading progress bar
- Ensure TOC is properly positioned in sidebar

**Status:** [x] Completed

---

## Phase 6: Language Switcher (Vietnamese / English)

No i18n system exists currently. Need to add one.

**Approach: `next-i18next`** (most popular for Next.js Pages Router)

### 6a. Setup
- Install `next-i18next` + `i18next` + `react-i18next`
- Create `next-i18next.config.js` with locales: `['vi', 'en']`, default: `'vi'`
- Update `next.config.js` with i18n config
- Create translation files: `public/locales/vi/common.json` and `public/locales/en/common.json`

### 6b. Translation Files
Extract all user-facing strings:
- Navbar: "Viết bài", "Đăng nhập", "Đăng xuất", "Tìm kiếm..."
- Post cards: "min read", "Featured"
- Comments: "Viết bình luận...", "Gửi", "Xem thêm bình luận"
- Editor: "Nhập / để xem các lệnh...", "Publish Article", "Cancel"
- TOC: "Mục Lục" / "Table of Contents"
- Errors: "Đã xảy ra lỗi", "Thử lại"

### 6c. Language Switcher Component
- Small dropdown or toggle in Navbar (right side, before user menu)
- Shows "VI" / "EN" flags or text
- Persists choice in localStorage + cookie (for SSR)

### 6d. Wrap Components
- Wrap `_app.js` with `appWithTranslation`
- Use `useTranslation('common')` hook in components
- Replace hardcoded strings with `t('key')`

**Status:** [x] Completed

---

## Implementation Order

**Recommended:** 1 → 2 → 3 → 4 → 5 → 6

Phases 1-5 are independent UI changes. Phase 6 (i18n) touches many files so should be last.

---

## Confirmed Decisions

1. **i18n**: Use `next-i18next` ✅
2. **Editor**: Hide top toolbar, use BubbleMenu/FloatingMenu only (Medium style) ✅
3. **TOC mobile**: Collapsible card above content (200lab style) ✅
4. **Reading progress bar**: Yes, thin green bar below navbar ✅
5. **Comment nesting**: Cap at 2 levels (comment → reply) ✅
