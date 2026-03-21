Review: Infinite Scroll & Archive Sidebar
1. Search Page (/search) — Infinite Scroll
Status: Implemented correctly

SearchResults.js uses react-infinite-scroll-component + useSearch hook built on useSWRInfinite. Data flow:

useSearch (useSWRInfinite, PAGE_SIZE=10)
  → fetchStories (GET /search/posts?q=&page=&limit=)
    → SearchResults (InfiniteScroll component)
No issues found. hasMore logic checks posts.length < totalCount, loadMore increments setSize, and the InfiniteScroll component receives correct dataLength, next, hasMore, and loader props.

2. Archive Page (/archive/[year]/[month]) — Infinite Scroll
Status: Implemented, but has bugs

Bug 1: posts prop wrapping (Critical)
In ArchivePageClient.js line 72:


ArchivePageClient.js
Lines 72-72
          posts={[posts]}
posts from useArchivePosts is already a flat array (allPosts). Wrapping it in [posts] creates [[post1, post2, ...]]. While PostList does posts.flat() so it works accidentally, this is semantically wrong — PostList expects an array-of-arrays pattern from useSWRInfinite (where each element is a page). Passing a manually wrapped array creates a mismatch in the contract.

Bug 2: setSize / loadMore signature mismatch (Works accidentally)
PostList calls setSize((prev) => prev + 1) — it expects setSize from useSWRInfinite which accepts a callback. But loadMore from useArchivePosts takes zero arguments:


useArchivePosts.js
Lines 42-46
  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };
This works because loadMore simply ignores the argument, but it's fragile.

Bug 3: useArchivePosts uses useSWR instead of useSWRInfinite
The hook manually manages pagination with useState + useEffect to accumulate posts. This creates:

Race conditions: If year/month changes while a fetch is in-flight, the useEffect on [data, page] can append stale data
No SWR cache per page: Each page overwrites the same cache key pattern, losing previous page data on revalidation
Double loading guard: Both PostList.fetchMore and loadMore check !isLoading, but the outer guard uses isReachingEnd while inner uses hasMore — these can desync
Verdict
The archive page kinda works for basic cases but is built on a fragile foundation. It needs to be refactored to use useSWRInfinite like the search hook.

3. Archive Sidebar (Right Sidebar) — Data Query
Status: Logic is fundamentally wrong

Problem

PersonalBlogSidebar.js
Lines 124-126
      <SidebarSection title={t('sidebar.archive')}>
        <Archive posts={latestPosts} />
      </SidebarSection>
latestPosts comes from:

useHomeData → fetchHomeData() → GET /home → data.latest_posts
The Archive component then groups these posts by created_at month/year and counts them:


Archive.js
Lines 13-34
  const createArchiveList = (posts) => {
    const grouped = {};
    posts.forEach(post => {
      const date = new Date(post.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();
      // ...groups and counts
    });
    // ...
  };
Issues
Issue	Severity	Description
Wrong data source	Critical	latest_posts from /home API is a small subset (probably 10-20 recent posts). The archive sidebar should show ALL months that have posts, not just months covered by the latest few.
Inaccurate counts	Critical	Post counts per month are derived from the subset, not the real totals. If a month has 50 posts but only 3 appear in latest_posts, the sidebar shows "3".
Missing months	Critical	Any month not represented in latest_posts simply won't appear in the sidebar at all. Older months are completely invisible.
Client-side grouping	Minor	Grouping should be done server-side via a dedicated endpoint, not by iterating over a random subset of posts.
4. Implementation Plan
Task 1: Create /archive/summary backend endpoint
A new API endpoint that returns aggregated archive data:

GET /api/archive/summary
Response:
{
  "data": [
    { "year": 2026, "month": 3, "count": 12 },
    { "year": 2026, "month": 2, "count": 8 },
    { "year": 2026, "month": 1, "count": 15 },
    ...
  ]
}
This is a simple GROUP BY YEAR(created_at), MONTH(created_at) SQL query.

Task 2: Create useArchiveSummary hook
// hooks/useArchiveSummary.js
import useSWR from 'swr';
import { getArchiveSummary } from '../services/postService';
export const useArchiveSummary = () => {
  const { data, error } = useSWR('archive-summary', getArchiveSummary, {
    revalidateOnFocus: false,
    dedupingInterval: 10 * 60 * 1000,
  });
  return {
    archiveList: data || [],
    isLoading: !error && !data,
    isError: error,
  };
};
Task 3: Refactor Archive component
Replace client-side grouping with server-provided data:

// Archive.js — receives archiveList directly
const Archive = ({ archiveList = [], limit = 12 }) => {
  // archiveList = [{ year, month, count }, ...]
  // No more client-side grouping from posts
  const displayList = isShowingAll ? archiveList : archiveList.slice(0, limit);
  // ... render links
};
Task 4: Update PersonalBlogSidebar
// PersonalBlogSidebar.js
const { archiveList } = useArchiveSummary();
// ...
<SidebarSection title={t('sidebar.archive')}>
  <Archive archiveList={archiveList} />
</SidebarSection>
Task 5: Refactor useArchivePosts to use useSWRInfinite
// hooks/useArchivePosts.js
import useSWRInfinite from 'swr/infinite';
import { getPostsByYearMonth } from '../services/postService';
const PAGE_SIZE = 20;
export const useArchivePosts = (year, month) => {
  const getKey = (pageIndex, previousPageData) => {
    if (!year || !month) return null;
    if (previousPageData && previousPageData.posts.length < PAGE_SIZE) return null;
    return { year, month, page: pageIndex + 1, limit: PAGE_SIZE };
  };
  const fetcher = ({ year, month, page, limit }) =>
    getPostsByYearMonth(year, month, page, limit);
  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });
  const posts = data ? data.flatMap(d => d.posts) : [];
  const totalCount = data?.[0]?.totalCount || 0;
  const hasMore = data ? posts.length < totalCount : false;
  return { posts, totalCount, isLoading: !data && !error, isError: error, hasMore, size, setSize };
};
Task 6: Fix ArchivePageClient to use refactored hook
// ArchivePageClient.js
const { posts, totalCount, isLoading, isError, hasMore, size, setSize } = useArchivePosts(yearInt, monthInt);
<PostList
  posts={posts}        // no wrapping in array — let PostList handle flat array
  isLoading={isLoading}
  isError={isError}
  setSize={setSize}    // real useSWRInfinite setSize
  isReachingEnd={!hasMore}
/>
Or if PostList expects array-of-arrays from useSWRInfinite, pass the raw data pages directly.

Priority Order
#	Task	Impact	Effort
1	Backend: GET /archive/summary endpoint	Critical (sidebar)	Low
2	useArchiveSummary hook	Critical (sidebar)	Low
3	Refactor Archive + PersonalBlogSidebar	Critical (sidebar)	Low
4	Refactor useArchivePosts → useSWRInfinite	Medium (archive page)	Medium
5	Fix ArchivePageClient props to PostList	Medium (archive page)	Low
Tasks 1-3 fix the sidebar. Tasks 4-5 fix the archive page infinite scroll. Search page needs no changes.