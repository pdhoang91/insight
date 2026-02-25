# UI/UX Refactor Plan — Round 4 (True Medium.com Alignment)

## Goals
1. Final hover cleanup — follow Medium's grayscale hover philosophy (no green accent on hover for icons/buttons)
2. Redesign FloatingToolbar + BubbleToolbar to match Medium's exact style
3. Redesign Publish popup — separate full-page route (not inside editor), Medium submission flow
4. Redesign Comment/Reply UX — no avatar in form, Medium's exact comment style
5. Redesign Post Detail page — closer to Medium's layout (content width, author section, stats bar, bottom actions)

---

## Phase 1: Hover & Interaction Cleanup — True Medium Style

**Reference:** Medium uses **grayscale** for hover states. Icons go from `#6b6b6b` → slightly darker on hover. No green accent on hover. Green is ONLY used for filled CTA buttons and active/clapped states.

### 1a. Global hover philosophy change
- **Icons/action buttons** (clap, comment, share, etc.): `text-[#6b6b6b]` → `hover:text-[#242424]` (darker gray, NOT green)
- **Clapped/active state**: Keep green for active/clapped state only
- **CTA buttons** (Publish, Login): `hover:opacity-90` — already correct
- **Text links** (titles, categories): `hover:underline` instead of `hover:text-green`
- **Category pills**: `hover:bg-gray-100` (subtle bg) or `hover:underline`

### 1b. Files to update
- `PostDetail.js`: Clap/comment/share buttons → `hover:text-[#242424]` instead of `hover:text-medium-accent-green`
- `BasePostItem.js`: Title hover → `group-hover:underline` instead of `group-hover:text-medium-accent-green`; action buttons → grayscale hover
- `CommentItem.js`: Clap/reply buttons → grayscale hover
- `ReplyItem.js`: Clap button → grayscale hover
- `PopularPosts.js`: Title hover → underline
- `PersonalBlogSidebar.js`: Category links → `hover:underline`
- `Navbar.js`: Write/logo links → `hover:opacity-80` or `hover:underline`
- `FloatingToolbar.js`: Icon hover → darker gray, not green
- `BubbleToolbar.js`: Already dark bg with white icons — OK, but tweak active states

**Status:** [x] Completed

---

## Phase 2: FloatingToolbar + BubbleToolbar — Medium Style

### 2a. FloatingToolbar (the "+" button)

**Current issues:**
- Hover goes green — should stay grayscale
- Active/expanded state goes green — should go dark gray/black
- Has too many options (Table, TaskList) — Medium only shows ~4-5 icons

**Target (Medium exact):**
- `+` button: 33px circle, 1px border `#b3b3b1`, icon `#b3b3b1`
- Hover: border and icon go to `#6b6b6b` (darker gray), NO green
- Expanded: `+` rotates 45° to `×`, color goes to `#242424`
- Icon row slides in horizontally: Image, Code, Embed (YouTube), Separator (---), Quote
- Each icon: outline-style, ~20px, `#6b6b6b`, hover → `#242424`
- Remove Table and TaskList from floating menu (keep them in slash commands only)

### 2b. BubbleToolbar (text selection popup)

**Current issues:**
- Has highlight colors (yellow, green, blue, pink) — Medium doesn't have these
- Missing heading toggles (H1, H2) — Medium has these
- Missing blockquote toggle — Medium has this
- Background is `bg-gray-900` — close but should be `#292929`

**Target (Medium exact):**
- Background: `#292929`, border-radius `4px`, subtle shadow
- Icons left to right: **Bold** | **Italic** | **Link** | separator | **H1** | **H2** | separator | **Quote** | **Code** (inline)
- Remove: Underline, Strikethrough, Highlight colors, Clear format
- Icon style: white outline, 16px, `opacity-0.7` default → `opacity-1` on hover/active
- Active state: icon goes full white (opacity 1), no background highlight
- No `bg-white/20` active background — just brightness change

**Status:** [x] Completed

---

## Phase 3: Publish Flow — Medium Full-Page Submission

**Current:** `CategoryTagsPopup.js` is a full-page overlay opened from within the editor page. This is already close but needs refinement.

**Target (Medium exact):**
- Full-page white overlay, `fixed inset-0 z-50 bg-white`
- Top bar: `×` close left, "Publish now" green pill button right
- Two-column grid (desktop): left = story preview, right = publishing options
- **Left column:**
  - "Story Preview" label
  - Cover image thumbnail (if exists) or gray placeholder
  - Title in serif font
  - Editable subtitle/excerpt textarea (max 280 chars)
  - Helper text: "Changes here will affect how your story appears in public places..."
- **Right column:**
  - "Publishing to:" label
  - Topics/categories: pill toggles (max 3), selected = dark fill
  - Tags: chip input with autocomplete (max 5)
- Mobile: stacks vertically

**Changes needed:**
- Refine the existing `CategoryTagsPopup.js` layout to match Medium more closely
- Add helper text below excerpt
- Improve category pill styling (selected = `bg-[#242424] text-white`, unselected = `border border-[#b3b3b1]`)
- Improve tag chip styling

**Status:** [x] Completed

---

## Phase 4: Comment & Reply UX — Medium Style

**Current issues:**
- `AddCommentForm` shows user avatar — Medium does NOT show avatar in the form
- Form has cancel/respond buttons — Medium shows just a textarea that expands, with "Respond" appearing on focus
- Comment clap uses `FaHandsClapping` — correct, but hover should be grayscale not green
- Reply text says "Reply" — Medium uses just the count or "Reply"

### 4a. `AddCommentForm.js`
- **Remove avatar** from the form
- Textarea: borderless, placeholder "What are your thoughts?", bottom border appears on focus
- On focus: textarea expands, "Cancel" and "Respond" buttons appear
- "Respond" button: green text, no fill, no border
- No avatar displayed

### 4b. `CommentItem.js`
- Clap button hover: `hover:text-[#242424]` (grayscale, not green)
- Active/clapped state: keep green
- Reply button: plain text "Reply", grayscale hover

### 4c. `ReplyItem.js`
- Same grayscale hover treatment for clap

### 4d. `CommentSection.js`
- Header: "Responses ({count})" — already correct
- Separator: thin `border-top` above section — already in `p/[id].js`

**Status:** [x] Completed

---

## Phase 5: Post Detail Page — Medium Layout

**Current issues:**
- Cover image is below the stats bar — Medium shows it above the title or just below title
- Stats bar has `FaEye` (views) — Medium doesn't show view count publicly
- Bottom action bar duplicates the top stats bar — Medium has a floating bottom bar or just the top one
- Author section uses 200lab style — should be more Medium-like
- Content max-width is 720px — Medium uses ~680px for the text column
- TOC sidebar on desktop — Medium doesn't have a TOC sidebar (keep it but make it optional/subtle)

### 5a. Layout changes
- Move cover image to just below the title (before author info)
- Remove `FaEye` view count from stats bar (not Medium-like)
- Content area: `max-w-[680px]` for the text column
- Author section: avatar (44px) + name (bold, hover:underline) + date + read time
- Stats bar: clap + comment on left, share + bookmark on right (no views)

### 5b. Bottom actions
- Remove the duplicate bottom action bar
- Instead, add an author bio card at the bottom (avatar larger ~72px, name, bio, "Follow" concept)
- Tags displayed as plain text with `#` prefix, not pills

### 5c. Mobile
- Keep mobile TOC collapsible — already good
- Content padding: `px-5` on mobile for comfortable reading

### 5d. Typography refinement
- Body text: `text-[21px]` on desktop, `text-[18px]` on mobile
- Line-height: `leading-[1.58]` (Medium's exact ratio)
- Paragraph spacing: `mb-[29px]`
- Text color: `text-[#242424]` (near-black, not pure black)

**Status:** [x] Completed

---

## Implementation Order

**Recommended:** 1 → 2 → 5 → 3 → 4

Phase 1 is quick global cleanup. Phase 2 is editor toolbars. Phase 5 is the biggest visual change (post detail). Phase 3 is publish flow refinement. Phase 4 is comment polish.

**All 5 phases completed.**

---

## Confirmed Decisions

1. **TOC sidebar**: Remove entirely (no TOC on post detail) ✅
2. **View count**: Remove `FaEye` from stats bar ✅
3. **Author bio card**: Add Medium-style author bio card at bottom ✅
4. **Tags style**: Plain text with `·` separators (Medium style) ✅
