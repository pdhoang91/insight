# UI Refactor Progress

## Issue 5: Remove reading progress bar — DONE
- Removed `ReadingProgressBar` import and usage from `PostDetail.js`
- Deleted `components/Shared/ReadingProgressBar.js`

## Issue 1: Profile edit/delete not showing for owner — DONE
- Root cause: URL `/@pdhoang91` passes `@pdhoang91` as `params.username`, but `loggedUser.username` is `pdhoang91` (no `@`), so `isOwner` was always `false`
- Fix: strip `@` prefix in `app/[locale]/[username]/page.js` line 39: `params?.username?.replace(/^@/, '')`

## Issue 4: Title input visibility in write/edit — DONE (Round 3 refined)
- `TitleInput` component was rendering but had subtle styling (transparent border, muted placeholder)
- Round 1: removed focus border, brighter placeholder (`#b3b3b3`), added `autoFocus`, adjusted line-height and letter-spacing
- Round 2: cover image button now hidden by default, appears on hover (`opacity-0 -> group-hover:opacity-100`), matching Medium's clean title area. Increased bottom margin (`mb-8`).
- Round 3: Title was being hidden behind the fixed navbar. Changed `pt-20` (80px) to `pt-28` (112px) in both `write/page.js` and `edit/[id]/page.js`, giving ~48px breathing room below the 64px navbar (matching Medium.com spacing).

## Issue 2: BubbleToolbar & FloatingToolbar restyle — DONE (Round 2 refined)
- Round 1: Restyled to Medium pill shape (`rounded-full`), changed H1/H2 to large T / small T, removed strikethrough/inline code
- Round 2: **BubbleToolbar switched to white background** (`bg-white border border-[#e0e0e0] shadow-lg`), dark text (`text-[#757575]` inactive, `text-[#292929]` hover, `text-[#1a8917]` active), separator color updated to `bg-[#e0e0e0]`
- **FloatingToolbar**: Already white bg, no changes needed in round 2

## Auth/Author Refactor — DONE
- **Critical bug fixed**: `PostDetail.js` was using `post.author` but backend sends `post.user`. Replaced all `post.author` references with `post.user`. Author info (name, avatar, bio) now displays correctly.
- **Owner edit/delete on post detail**: Added Edit/Delete buttons to the stats bar in `PostDetail.js` when `user.id === post.user.id`.
- **Edit page ownership guard**: Added check in `edit/[id]/page.js` — if user is not the post author and not admin, shows "no permission" message instead of the editor.
- **Edit page title race condition fixed**: Added `!isInitialized` guard so `PostForm` only renders after post data has been loaded into state. Prevents the empty-title flash.
- **Per-post ownership in BasePostItem**: `OwnerMenu` (edit/delete dropdown) now shows based on `post.user?.id === user.id` in addition to the parent-passed `isOwner` prop.

## Round 4: Edit page title input not visible — IN PROGRESS
**Symptom**: User reports title input not showing on `/edit` page (or covered by navbar).

**Hypotheses being tested with runtime instrumentation:**
- H1: `isInitialized` guard blocks rendering indefinitely (post never loads or race condition)
- H2: Ownership guard blocks rendering (post.user.id mismatch)
- H3: TitleInput renders but is visually hidden (styling/overlap)
- H4: Navbar `isWritePage` check fails with locale prefix (pathname `/en/edit/...` doesn't match `/edit/...`)
- H5: `usePostName` hook keeps `isLoading=true` indefinitely (SWR key/fetcher issue)

**Status**: Instrumentation added, awaiting runtime evidence.

## Fix: Editor Toolbar Background (#333 from tippy.js) — DONE
- **Problem**: Default `tippy.js/dist/tippy.css` applied `background-color: #333` to all `.tippy-box` elements, causing dark backgrounds on BubbleToolbar, FloatingToolbar, SlashCommands dropdown, and ToolbarButton tooltips
- **Root cause**: `tippy.css` was imported in `ToolbarButton.js` and `PostForm.js`
- **Fix**:
  - Added CSS overrides in `globals.css`: `.tippy-box { background-color: transparent; }`, hidden arrow, reset padding
  - Removed `tippy.css` import from `ToolbarButton.js` and `PostForm.js`
  - Removed `@tippyjs/react` Tippy component from `ToolbarButton.js`, relying on native `title` attr instead (matching Medium.com's minimal tooltip approach)
  - All toolbar components (BubbleToolbar, FloatingToolbar, SlashCommandsList) already had their own white bg + border styling via Tailwind — tippy wrapper is now transparent
