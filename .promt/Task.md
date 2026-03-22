# **RE-REVIEW SAU REFACTORING — INSIGHT BLOG FRONTEND**

---

## **A. Executive Summary**

**Đánh giá: 5.5/10 → 7/10** (cải thiện đáng kể)

### **Những gì đã làm tốt**


| **#** | **Item**                                              | **Chất lượng**                      |
| ----- | ----------------------------------------------------- | ----------------------------------- |
| 1     | `useInfiniteList` generic hook                        | Rất tốt — API rõ ràng, JSDoc đầy đủ |
| 2     | `useInfiniteCursor` generic hook                      | Rất tốt — cùng pattern              |
| 3     | 8 hooks refactored thành thin wrappers                | Xuất sắc — mỗi hook giờ 10-17 dòng  |
| 4     | `useInfinitePostByTag` cache key fix                  | Bug đã fix đúng                     |
| 5     | Dedup chuẩn hóa O(n) Set                              | Đúng                                |
| 6     | `themeClasses.js` 901 → 10 dòng shim + `utils/theme/` | Tách đúng cách                      |
| 7     | PostContext `setHandlePublish(() => fn)`              | Bug đã fix                          |
| 8     | `tiptapBaseExtensions.js` factory                     | Loại bỏ ~70 dòng duplicate          |
| 9     | `renderContentServer.js` dùng shared factory          | Clean                               |
| 10    | `CommentItem` + `ReplyItem` dùng `UI/Avatar`          | Đúng hướng                          |


### **Những gì chưa làm**

Khoảng **60% recommendation từ review trước vẫn chưa được thực hiện**. Dưới đây là phân tích chi tiết.

---

## **B. Checklist: Đã làm vs Chưa làm**

### **BUGS — 2/3 đã fix**


| **Bug**                                                           | **Status**    | **Chi tiết**                  |
| ----------------------------------------------------------------- | ------------- | ----------------------------- |
| PostContext `setHandlePublish(fn)` → `setHandlePublish(() => fn)` | ✅ Fixed       | Line 18 đúng rồi              |
| `useInfinitePostByTag` thiếu `tagName` trong cache key            | ✅ Fixed       | `key: ['posts-tag', tagName]` |
| `imageService.js` named imports vs default exports                | ❌ **Vẫn lỗi** | Xem bên dưới                  |


**Bug** `imageService.js` **còn sót:**

imageService.jsLines 2-3

import {axiosPublicInstance} from '../utils/axiosPublicInstance';

import {axiosPrivateInstance} from '../utils/axiosPrivateInstance';

Cả 2 axios files export **default**, nhưng `imageService.js` dùng **named import** `{axiosPrivateInstance}`. Kết quả: `axiosPrivateInstance` sẽ là `undefined` → `uploadImage` và `updateProfileWithAvatar` sẽ crash khi gọi `.post()` trên `undefined`. Tất cả service khác đều import đúng bằng default import.

---

### **Green Shadow Colors — Một phần fix**

`effects.shadowAccent` đã dùng `var(--accent-shadow,...)` nhưng module `interactions` vẫn hardcode `rgba(26,137,23,...)` ở **7 chỗ**:

interactive.jsLines 132-132

  buttonHover: 'hover:shadow-[0_8px_25px_rgba(26,137,23,0.25)] ...',

interactive.jsLines 135-136

  buttonFocus: '... focus:shadow-[0_0_0_3px_rgba(26,137,23,0.1)]',

  buttonMagnetic: 'hover:shadow-[0_10px_30px_rgba(26,137,23,0.3)] ...',

interactive.jsLines 145-145

  iconPulse: '... hover:shadow-[0_0_10px_rgba(26,137,23,0.3)] ...',

interactive.jsLines 147-149

  inputFocus: '... focus:shadow-[0_0_0_3px_rgba(26,137,23,0.1)] ...',

  inputHover: '...',

  inputFloating: '... focus:shadow-[0_8px_25px_rgba(26,137,23,0.15)] ...',

Và trong `effects`:

interactive.jsLines 87-88

  glow: 'shadow-[0_0_20px_rgba(26,137,23,0.3)]',

  glowSubtle: 'shadow-[0_0_10px_rgba(26,137,23,0.15)]',

Tổng cộng ~9 hardcoded green values còn sót. Nên thống nhất dùng CSS variable `var(--accent-shadow)` hoặc nếu Tailwind không support, define shadow colors trong `tailwind.config.ts`.

---

### **Files nên xóa — 0/4 đã xóa**


| **File**                                   | **Reason**                                 | **Status**    |
| ------------------------------------------ | ------------------------------------------ | ------------- |
| `components/Category/CategoryTagsPopup.js` | Thay thế bởi `PublishPanel.js`             | ❌ Vẫn tồn tại |
| `components/Profile/ProfileSection.js`     | Duplicate ProfileHeader + UserPostsSection | ❌ Vẫn tồn tại |
| `components/Layout/PageLayout.js`          | Thay thế bởi `Layout.js`                   | ❌ Vẫn tồn tại |
| `constants/roles.js` — `hasAdminAccess`    | Identical với `isAdmin`                    | ❌ Vẫn tồn tại |


`Profile/index.js` đã cập nhật không export `ProfileSection` nữa — tốt, nhưng file vẫn nằm đó gây confusion.

---

### **Skeleton Consolidation — Chưa làm**

Vẫn có **inline skeleton duplicate** trong:

`PostList.js` (lines 10-19):

PostList.jsLines 10-19

const PostSkeleton = () => (

<div style={{ display: 'flex', gap: '1.25rem', paddingBottom: '2rem', marginBottom: '2rem' }}>

<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

<div className="skeleton-warm" style={{ height: '1.1rem', width: '75%', borderRadius: '2px' }} />

      // ...

</div>

</div>

);

`UserPostsSection.js` (lines 30-45) — **gần y hệt**, chỉ khác `width: '70%'` vs `'75%'`:

UserPostsSection.jsLines 30-45

if (isLoading && posts.length === 0) return (

<div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

{[...Array(3)].map((_, i) => (

<div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: '2rem', marginBottom: '2rem' }}>

<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

<div className="skeleton-warm" style={{ height: '1.1rem', width: '70%', borderRadius: '2px' }} />

            // ...

Đồng thời `Shared/PostSkeleton.js` (216 dòng) và `UI/Skeleton.js` (212 dòng) vẫn song song tồn tại.

---

### **ErrorState/EmptyState — Chưa replace**

`PostList.js` lines 64-87 vẫn hand-roll error state inline. `Shared/ErrorState.js` vẫn 0 consumer.

---

### **Service Layer — 0/6 items đã làm**


| **Item**                         | **Status**                                  |
| -------------------------------- | ------------------------------------------- |
| `fetchPaginatedList` utility     | ❌ Không tạo                                 |
| `withFallback` HOF               | ❌ Không tạo                                 |
| Standardize error handling       | ❌ Vẫn 4 pattern khác nhau                   |
| camelCase axios interceptor      | ❌ Không thêm                                |
| Deduplicate `getCurrentUser`     | ❌ Vẫn duplicate ở authService + userService |
| Deduplicate `getPostsByCategory` | ❌ Vẫn ở cả postService + categoryService    |


---

### **Write/Edit Pages — Chưa gộp**

`write/page.js` (175 dòng) và `edit/[id]/page.js` (241 dòng) vẫn **~80% duplicate**:

- Cùng state declarations (lines 26-30 vs 36-41)
- Cùng keyboard shortcut handler (lines 42-58 vs 67-84 — character-for-character)
- Cùng fullscreen button + styling (lines 127-150 vs 191-214)
- Cùng loading state JSX pattern (line 103-111 vs 124-132, 137-147, 154-165, 169-177)
- `edit/page.js` có 4 copies của centered loading/error JSX

---

### **Folder cleanup — Chưa làm**


| **Vấn đề**                                         | **Status**                       |
| -------------------------------------------------- | -------------------------------- |
| `components/Shared/` → consolidate vào `UI/`       | ❌                                |
| `components/Utils/` → move vào `utils/` hoặc `UI/` | ❌                                |
| `components/common/index.js` barrel shim           | ❌ Vẫn tồn tại                    |
| `styles/mobile.css` dọn dẹp                        | ❌ 202 dòng, vẫn overlap Tailwind |


---

## **C. Review Chất Lượng Code Mới**

### `useInfiniteList` **— Đánh giá: 9/10**

useInfiniteList.jsLines 1-75

*// hooks/useInfiniteList.js*

*// Generic hook for offset-based infinite scroll pagination.*

*// ... (75 lines total)*

**Tốt:**

- JSDoc rõ ràng, parameter types documented
- `key` support cả string và array — flexible
- `dedupe` optional, dùng Set O(n) — đúng
- `enabled` flag cho conditional fetching — pattern chuẩn SWR
- Return shape đầy đủ: `posts`, `totalCount`, `isLoading`, `isError`, `size`, `setSize`, `isReachingEnd`, `isEmpty`, `hasMore`, `isValidating`

**Nhỏ — có thể cải thiện:**

- Line 25: `previousPageData.posts?.length` — hardcoded `posts` key. Nếu consumer return `{ items: [...] }` thay vì `{ posts: [...] }` thì break. Nên thêm `itemsKey` option giống `useInfiniteCursor` để consistent, hoặc document rõ ràng rằng fetcher PHẢI return `{ posts, totalCount }`.
- Line 50: cùng vấn đề — `page.posts || []` hardcoded.

### `useInfiniteCursor` **— Đánh giá: 9/10**

**Tốt:**

- `itemsKey` configurable — flexible hơn `useInfiniteList`
- URL parsing pattern clean
- `loadMore` method encapsulated — consumer không cần tự handle

**Nhỏ:**

- Line 35: `new URL(key, 'http://localhost')` — cần comment giải thích tại sao dùng localhost (vì key là path-only, cần full URL cho URL constructor)

### **Consumer hooks — Đánh giá: 10/10**

`useInfinitePosts`, `useInfinitePostByCategory`, `useInfinitePostByTag`, `useInfiniteUserPosts`, `useSearch`, `useArchivePosts`, `useInfiniteComments`, `useCommentReplies` — tất cả đều clean, ngắn gọn (10-35 dòng), interface rõ ràng.

`useInfiniteUserPosts` xử lý edge case tốt:

useInfiniteUserPosts.jsLines 7-17

    fetcher: async (page, limit) => {

const data = await fetchUserPosts(username, page, limit);

return {

posts: data.posts || data.data || [],

totalCount: data.totalCount || data.total_count || 0,

};

},

    enabled: !!username && username.trim() !== '',

Adapter pattern ở đây là đúng — service trả về format không chuẩn, hook normalize trước khi pass vào base hook. Tuy nhiên, lý tưởng hơn là fix ở service layer để không cần `data.data ||` fallback.

### **Theme split — Đánh giá: 8/10**

`utils/theme/` split hợp lý: `tokens.js` (29 dòng), `typography.js` (69), `layout.js` (59), `interactive.js` (150), `components.js` (283), `index.js` (34). Shim `themeClasses.js` backward-compatible.

**Vấn đề:** `components.js` vẫn 283 dòng — có thể tách thêm `forms.js`, `modals.js`. Nhưng acceptable ở mức hiện tại.

### **TipTap extension refactor — Đánh giá: 10/10**

tiptapBaseExtensions.jsLines 1-59

*// Factory pattern: getBaseExtensions(imageExtension)*

tiptapExtensions.jsLines 1-8

*// Client wrapper: getExtensions() = getBaseExtensions(ImageBlock)*

renderContentServer.jsLines 55-59

*// Server: renderPostContent → getBaseExtensions(ImageBlockServer)*

Clean factory pattern. Thêm/sửa extension giờ chỉ 1 chỗ.

### **PostContext fix — Đánh giá: 10/10**

PostContext.jsLines 4-9

const PostContext = createContext({

handlePublish: null,

setHandlePublish: () => {},

handleUpdate: null,

setHandleUpdate: () => {},

});

Default values đầy đủ — không còn trả `undefined` khi thiếu Provider. `useMemo` cho value object. Bug fixed đúng.

### **Avatar reuse — Đánh giá: 9/10**

`CommentItem` và `ReplyItem` giờ đều dùng `<Avatar>` từ `UI/Avatar.js`. Clean.

---

## **D. Remaining Refactor Priorities (cập nhật)**

### **Priority 1 — Quick Wins (< 1 ngày)**


| **#** | **Việc**                                                                                                                      | **Impact**             |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1     | **Fix** `imageService.js` **imports**: `{axiosPrivateInstance}` → `axiosPrivateInstance`                                      | Fix runtime crash      |
| 2     | **Fix remaining green shadows** trong `interactive.js` (9 chỗ)                                                                | Đúng màu               |
| 3     | **Xóa** `CategoryTagsPopup.js`                                                                                                | -549 dòng dead code    |
| 4     | **Xóa** `ProfileSection.js`                                                                                                   | -280 dòng dead code    |
| 5     | **Xóa** `PageLayout.js`                                                                                                       | -67 dòng dead code     |
| 6     | **Xóa** `hasAdminAccess` trong `roles.js` — alias `isAdmin`                                                                   | Dead code              |
| 7     | **Replace** `PostList.js` **inline skeleton** bằng import từ `UI/Skeleton` hoặc extract `PostSkeleton` thành shared component | -10 dòng + consistency |
| 8     | **Replace** `UserPostsSection.js` **inline skeleton** — import cùng skeleton                                                  | -15 dòng               |


### **Priority 2 — Medium (2-3 ngày)**


| **#** | **Việc**                                                                                                                         | **Impact**                |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1     | **Gộp write/edit pages** thành shared `PostEditorPage`                                                                           | -100+ dòng                |
| 2     | **Tạo** `fetchPaginatedList` trong services                                                                                      | -150 dòng ở service layer |
| 3     | **Replace inline error states** bằng `Shared/ErrorState.js` (PostList, CategoryList, CategoryPosts, UserPostsSection)            | Consistency               |
| 4     | **Consolidate Shared/ vào UI/** — move `EmptyState`, `ErrorState`, `LoadingSpinner`                                              | 1 import path             |
| 5     | **Xóa** `components/Utils/` — move `SafeImage`, `TimeAgo` vào `UI/`, `TextUtils` vào `utils/`, `InfiniteScrollWrapper` vào `UI/` | Clean structure           |
| 6     | **Resolve duplicate services**: pick 1 `getCurrentUser`, pick 1 `getPostsByCategory`                                             | Remove confusion          |


### **Priority 3 — Larger (1 tuần+)**


| **#** | **Việc**                                                                  | **Impact**        |
| ----- | ------------------------------------------------------------------------- | ----------------- |
| 1     | **Standardize styling** — phase out inline styles                         | Consistency       |
| 2     | **Dọn** `mobile.css`                                                      | -200 dòng overlap |
| 3     | **Standardize error handling** trong services                             | Predictability    |
| 4     | **Standardize icon library**                                              | Bundle size       |
| 5     | **Thêm** `useInfiniteList` ****`itemsKey` **option** hoặc rename contract | API consistency   |


---

## **E. Tóm tắt**

**Điểm cộng lớn nhất của đợt refactor này:** Hook layer giờ rất clean. Từ ~450 dòng duplicate code trong 8 hooks → 2 generic hooks (146 dòng) + 8 thin wrappers (~100 dòng). Giảm ~200 dòng và quan trọng hơn: fix bugs, chuẩn hóa behavior, và mỗi hook giờ chỉ express **cái gì khác biệt** thay vì copy-paste cả đống boilerplate.

**Phần chưa chạm tới:** Service layer, component consolidation (skeleton/error/empty states), dead file cleanup, và write/edit page merge. Đây là phần sẽ mang lại giá trị cao nhất tiếp theo.

**1 bug cần fix ngay:** `imageService.js` named imports — đây là runtime error sẽ crash khi user upload ảnh.