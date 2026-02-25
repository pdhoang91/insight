# UI/UX Refactor Plan — Round 3 (Medium-style Polish)

## Goals
1. Clean up remaining hover effects — follow Medium.com's subtle hover patterns
2. Redesign FloatingToolbar to Medium's "+" toggle pattern
3. Redesign Publish popup to Medium's full-page publish flow
4. Fix i18n — move LanguageSwitcher into user dropdown, translate sidebar & footer strings
5. Redesign comment/clap UX to match Medium's inline style

---

## Phase 1: Hover & Interaction Cleanup (Medium-style)

**Reference:** Medium uses almost no background hovers. Links get underline or subtle color shift. Buttons get slight opacity change. No bg-green, no bg-gray on text elements.

### 1a. `Navbar.js`
- Logo: keep `hover:text-medium-accent-green` — that's fine
- "Viết bài" button: keep text color hover — OK
- "Đăng bài" green button: change `hover:bg-medium-accent-green/90` → `hover:opacity-90` (Medium pattern)
- "Đăng nhập" border button: remove `hover:bg-medium-accent-green hover:text-white` → use `hover:opacity-80` only
- Mobile login button: same treatment
- User avatar: no hover ring needed — already clean

### 1b. `BasePostItem.js`
- Post title: `hover:text-medium-accent-green` — keep, but ensure it's underline-free (Medium uses no underline on titles)
- Category pills: already `hover:text-medium-accent-green` — OK
- Clap/comment/view buttons: already text-color-only hover — OK
- FeaturedPost in `index.js`: remove `hover:shadow-md` from article, remove `hover:scale-[1.02]` from image

### 1c. `PostDetail.js`
- Clap/comment/share buttons: already text-color-only — OK
- Category tags at bottom: already `hover:text-medium-accent-green` — OK

### 1d. `Layout.js` — MobileSidebarContent
- Remove `hover:bg-medium-hover` from the expand button

### 1e. `PostList.js`
- "You've reached the end!" → translate with `t()` key

**Status:** [x] Completed

---

## Phase 2: FloatingToolbar — Medium "+" Toggle

**Reference:** Medium's editor shows a single `+` circle icon at the left of empty lines. Clicking it expands a horizontal row of block-type buttons (image, embed, separator, code). NOT a vertical dropdown.

### Changes to `FloatingToolbar.js`
- **Default state:** Show only a `+` circle button (32×32, border, green on hover)
- **Expanded state:** On click, animate open a horizontal row of icons to the right of the `+`
- **Icons:** Image, Code, Table, YouTube, Quote, Horizontal Rule, Task List (same as current, but icon-only, no labels)
- **Close:** Click `+` again (rotates to `×`) or click outside
- **Animation:** Smooth horizontal expand with `framer-motion`
- **Positioning:** Still uses TipTap `FloatingMenu`, but renders the toggle + expandable row instead of the dropdown

### Implementation
- Add `isOpen` state to `FloatingToolbar`
- Render `+` button always; render icon row conditionally
- Each icon is a small circle button (28×28) with tooltip
- Use `AnimatePresence` + `motion.div` for the expand animation

**Status:** [x] Completed

---

## Phase 3: Publish Popup — Medium Full-Page Flow

**Reference:** Medium's publish flow is a full-page overlay (not a small modal). It has:
- Left side: Story preview (title, subtitle, cover image thumbnail)
- Right side: Publishing options (tags, topic selection)
- Clean white background, no border/shadow modal
- "Publish now" green button at top-right

### Changes to `CategoryTagsPopup.js` → Full rewrite
- **Layout:** Full-screen overlay (`fixed inset-0 z-50 bg-white`)
- **Header:** Simple top bar with "X" close on left, "Publish now" green button on right
- **Two-column layout** (desktop):
  - **Left column:** Story preview card — title, subtitle/excerpt (first ~160 chars of content), cover image thumbnail
  - **Right column:** Publishing options — Categories (pill toggles), Tags (chip input, same as current)
- **Mobile:** Stack vertically (preview on top, options below)
- **No backdrop blur** — just solid white
- **Subtitle field:** Add a text input for excerpt/subtitle that user can edit before publishing

### Props change
- Add `excerpt` prop (auto-generated from content, editable)
- Keep `onPublish(categories, tags)` signature but could extend to include excerpt

**Status:** [x] Completed

---

## Phase 4: i18n Fixes — LanguageSwitcher in Dropdown + Sidebar/Footer Translation

### 4a. Move LanguageSwitcher into user dropdown
- **Remove** standalone `<LanguageSwitcher />` from desktop nav and mobile menu
- **Add** language toggle inside the user dropdown menu (below profile link, above logout)
- **For logged-out users:** Add language toggle in mobile menu only (small, subtle)
- **Style:** Simple "VI | EN" text toggle, not pill buttons

### 4b. Translate sidebar strings
- `PersonalBlogSidebar.js`: Use `t('sidebar.popularPosts')`, `t('sidebar.categories')`, `t('sidebar.archive')`
- `PopularPosts.js`: Translate "Hiện tại chưa có bài viết phổ biến nào." and "Không có bài viết phổ biến"
- `CommentSection.js`: Translate "Bình luận" header

### 4c. Translate footer/end-of-list
- `PostList.js`: Translate "You've reached the end!" → `t('post.reachedEnd')`
- `PostList.js`: Translate "Đã xảy ra lỗi", "Không thể tải bài viết", "Thử lại", "No stories yet", "Be the first..."

### 4d. Update translation files
- Add missing keys to both `vi/common.json` and `en/common.json`

**Status:** [x] Completed

---

## Phase 5: Comment & Clap UX Redesign (Medium-inspired)

**Reference:** Medium shows comments inline below the article (not in a sidebar popup). Each comment has:
- Avatar + name + time on one line
- Comment text
- Clap (heart) count + Reply link
- Replies indented with a thin left border
- Clean, minimal — no card borders, no shadows on individual comments

### 5a. `CommentSection.js`
- Remove `themeClasses` usage → plain Tailwind
- Header: "Responses ({count})" — Medium calls them "Responses"
- Add comment form: Simple textarea with avatar, "Respond" button

### 5b. `CommentItem.js`
- Already close to Medium style (avatar + name + time, content, heart + reply)
- **Tweak:** Use `FaHandsClapping` instead of `FaHeart` for claps (consistency with post claps)
- **Tweak:** "Reply" text should show reply count only when > 0, otherwise just "Reply"
- Already capped at 2 levels — good

### 5c. `AddCommentForm.js`
- Medium style: Show user avatar next to textarea
- Textarea: No visible border initially, just a bottom line. On focus, expand and show border
- Submit button: "Respond" text button (green), not an icon

### 5d. `ReplyItem.js`
- Use `FaHandsClapping` instead of `FaHeart` for consistency
- Otherwise already clean

### 5e. `LimitedCommentList.js`
- "Xem thêm" → translate
- Already clean style

### 5f. Clap animation
- Add a brief scale pulse on clap button click (CSS `animate-ping` for 200ms)
- Optimistic update: increment count immediately, then revalidate

**Status:** [x] Completed

---

## Implementation Order

**Recommended:** 1 → 2 → 3 → 4 → 5

Phase 1 is quick cleanup. Phase 2 is self-contained editor change. Phase 3 is the biggest visual change. Phase 4 is i18n plumbing. Phase 5 is comment polish.

**All 5 phases completed.**

---

## Confirmed Decisions

1. **Publish flow**: Full-page white overlay with two columns (Medium-style exactly) ✅
2. **Excerpt field**: Add editable excerpt field in publish flow ✅
3. **Comment clap icon**: Switch FaHeart → FaHandsClapping everywhere ✅
