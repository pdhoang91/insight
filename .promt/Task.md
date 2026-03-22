C. Recommended Improvements
C1. Image Delivery — Direct S3/CDN URLs
Problem: Every image request flows through the Go API server, does a DB lookup, then redirects to S3.

Why it matters: Images are the heaviest assets. A single post with 10 inline images generates 10 API requests + 10 DB queries + 10 redirects. This makes the Go server a bottleneck for purely static content.

Proposed solution:

On upload, store the S3 public URL or CDN URL directly in the image record
In ProcessJSONContentForDisplay, emit the direct S3/CDN URL instead of /images/v2/{id}
Put CloudFront (or Cloudflare) in front of your S3 bucket — AWS free tier gives 1TB/month
For cover images and avatars, store the direct URL on the entity
Deprecate the redirect endpoint; keep it only as a legacy fallback with long cache headers
Expected impact: Eliminates 10+ API calls per post page view. Images load from CDN edge.

Complexity: Medium
When: NOW — this is your single biggest performance win.

C2. Batch Post Detail Queries
Problem: GetPostBySlug makes 7 sequential DB roundtrips.

Why it matters: This is the hottest endpoint. Every reader hits it. At p99, you're looking at 7 × network RTT + query time per page view.

Proposed solution:

Combine FindBySlug + content + user + categories + tags into a single query with JOINs, or at minimum use 2 parallel queries (post+relations and content)
Move CalculateCounts to a denormalized column updated asynchronously (you already have engagement_score — do the same for clap_count and comment_count on the posts table)
Cache the full post detail response for 30-60 seconds keyed by slug
Expected impact: Post detail drops from ~7 queries to 1-2 queries. Massive latency improvement.

Complexity: Medium
When: NOW

C3. Defer View Counting
Problem: IncrementViews does UPDATE posts SET views = views + 1 synchronously on every page view.

Why it matters: This is a write on your hottest read path. Under load, it causes row lock contention, WAL bloat, and prevents effective read caching.

Proposed solution:

Buffer view increments in the in-memory cache (or Redis) as a counter
Flush to DB in batches every 30-60 seconds via the background goroutine
Alternatively, use a separate post_views table with append-only inserts and periodic rollup
Expected impact: Removes write contention from the read path. Enables response caching for post detail.

Complexity: Low
When: NOW

C4. Enable Nginx Rate Limiting
Problem: Rate limiting is explicitly disabled everywhere with # Rate limiting disabled for now.

Why it matters: Any endpoint can be hammered without limit. Comment spam, clap abuse, search DDoS, upload abuse — all wide open.

Proposed solution:

limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=upload:10m rate=10r/m;
Apply limit_req zone=api burst=50 nodelay; to /api/, stricter zones for auth and upload.

Expected impact: Protection against abuse with zero code changes.

Complexity: Low
When: NOW

C5. Fix Double SSR Fetch on Post Page
Problem: In frontend/app/[locale]/p/[slug]/page.js, generateMetadata fetches the post, then the page component fetches it again.


page.js
Lines 3-13
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  // ...
  const post = await fetchPostBySlug(slug);
  // ...
}
export default async function PostPage({ params }) {
  // ...
  post = await fetchPostBySlug(slug);
  // ...
}
Why it matters: Each SSR render calls the API twice for the same data. Each call triggers IncrementViews, so views are inflated 2x.

Proposed solution: Next.js deduplicates fetch() calls within a single render. Make sure fetchPostBySlug uses native fetch() with the same URL (it likely already does via app/lib/api.js). Alternatively, use React cache() to memoize within a request.

Expected impact: 50% reduction in API calls for post detail SSR. Fixes view double-counting.

Complexity: Low
When: NOW

C6. Replace In-Memory Cache with Redis
Problem: sync.Map-based cache is single-process, lost on restart, and blocks horizontal scaling.

Why it matters: You can never run 2+ API instances. Every deploy cold-starts the cache. DeletePrefix does a full scan.

Proposed solution:

Add Redis (single instance, ~$5/month on a small VPS, or free tier on providers)
Replace MemoryCache with a Redis-backed implementation with the same interface
Keep the MemoryCache as an L1 cache in front of Redis for ultra-hot keys (home_data, popular_posts)
Expected impact: Horizontal scaling unlocked. Cache survives deploys. Shared across services.

Complexity: Medium
When: When you need to run 2+ instances OR when traffic exceeds single-instance capacity (~1k-5k DAU)

C7. Fix FindByYearMonth Query
Problem: EXTRACT(YEAR FROM created_at) prevents index usage.

Proposed solution:

Where("created_at >= ? AND created_at < ?", startOfMonth, startOfNextMonth)
This allows the idx_posts_created_at index to be used as a range scan.

Expected impact: Archive queries go from seq scan to index scan.

Complexity: Low
When: NOW

C8. Add Image Processing Pipeline
Problem: Images are uploaded as-is. A 5MB iPhone photo is served as a 5MB file. No thumbnails for list views. No WebP/AVIF conversion. No responsive sizes.

Proposed solution:

On upload, generate 3 variants: thumbnail (400w), medium (800w), full (1200w)
Convert to WebP (with JPEG fallback)
Store variants in S3 with predictable paths: {key}_thumb.webp, {key}_800.webp
Use <picture> with srcset on frontend
Use sharp (already in your frontend deps) for on-the-fly resize if you want to start simpler
Expected impact: 3-10x smaller image payloads. Dramatically faster page loads on mobile.

Complexity: High
When: Medium-term — after fixing the delivery path (C1)

C9. Fix DeletePost Transaction Bug
Problem:


post.go
Lines 417-422
	if err := s.CommentRepo.DeleteByPostID(id); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete comments", err)
	}
	if err := s.ReplyRepo.DeleteByPostID(id); err != nil {
These use s.CommentRepo and s.ReplyRepo (non-transactional), while the post delete above uses txPostRepo. If the post is soft-deleted but comment/reply deletion fails and rolls back, the post remains deleted outside the transaction.

Proposed solution: Use txCommentRepo and txReplyRepo (create them like you do for other repos at the start of the function).

Complexity: Low
When: NOW

C10. Denormalize Comment/Clap Counts
Problem: CalculateCounts and CalculateCountsForPosts run aggregate queries (SUM, COUNT) on every list/detail request.

Proposed solution:

Add clap_count and comment_count columns to posts
Increment/decrement on clap/comment creation/deletion
The engagement score recalculation background job can also reconcile these counts
Remove real-time aggregate queries from read paths
Expected impact: Eliminates 2 queries per post detail, 2 batch queries per list.

Complexity: Medium
When: Medium-term