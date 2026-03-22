Fix GetUserPosts/SearchPosts total count — thêm CountByUserID, CountSearch vào repo
Thêm SetConnMaxLifetime(5 * time.Minute) — 1 dòng trong config.go
Fix RecalculateAllEngagementScores — dùng comment_count column thay vì subquery
Bỏ scan thứ 2 trong RedisCache.DeletePrefix
Fix search service N+1 — batch load categories/tags
Cleanup FlushViewCounts — delete entries sau khi flush
Thêm env.example vars — REDIS_URL, AWS_CDN_DOMAIN
Log errors trong Redis cache thay vì silent fail
Simplify SafeImage component
WebP conversion trong image pipeline
Cursor-based pagination
Observability (structured logging, request latency metrics)

B1. GetUserPosts và SearchPosts trả sai total count — BUG

post.go
Lines 502-502
	return responses, int64(len(responses)), nil
len(responses) = page size, không phải total. Frontend pagination sẽ không biết có bao nhiêu page.

Mức ảnh hưởng: MEDIUM — Infinite scroll có thể hoạt động (dựa vào empty page), nhưng nếu frontend hiển thị "X bài viết" thì sẽ sai.

Fix: Thêm CountByUserID(userID) vào PostRepository và gọi nó. Tương tự cho SearchPosts.

B2. ConnMaxLifetime chưa set — DỄ FIX

config.go
Lines 120-123
			sqlDB.SetMaxIdleConns(cfg.MAX_IDLE_CONNS)
			sqlDB.SetMaxOpenConns(cfg.MAX_OPEN_CONNS)
			// THIẾU: sqlDB.SetConnMaxLifetime(5 * time.Minute)
Mức ảnh hưởng: LOW — Nhưng nếu PostgreSQL restart hoặc connection stale, pool sẽ giữ dead connections.

Fix: Thêm 1 dòng sqlDB.SetConnMaxLifetime(5 * time.Minute).

B3. Search Service N+1 chưa fix
fillPostMetadata trong search-service vẫn chạy 2 query/post (categories + tags). 20 kết quả = 40 extra queries.

Mức ảnh hưởng: MEDIUM — Search không phải hot path như post detail, nhưng sẽ chậm dần khi dùng nhiều.

Fix: Batch load categories và tags cho tất cả post IDs trong 2 query, rồi map in-memory.

B4. usePostName thiếu SWR options — DỄ FIX

usePost.js
Lines 16-24
export const usePostName = (slug) => {
  const { data, error, mutate } = useSWR(slug ? `/p/${slug}` : null, () => getPostBySlug(slug));
  // Không có dedupingInterval, revalidateOnFocus, v.v.
Mức ảnh hưởng: LOW-MEDIUM — SWR default dedupingInterval là 2 giây, revalidateOnFocus là true. Mỗi lần user tab back sẽ re-fetch post detail.

Fix:

useSWR(key, fetcher, {
  dedupingInterval: 30000,
  revalidateOnFocus: false,
})
B5. SafeImage vẫn giữ 3-retry chain
Backend đã chuyển sang direct CDN URLs, nhưng SafeImage vẫn có logic transform S3 URL + 3-retry fallback. Code này giờ phần lớn là dead code vì image URLs đã là direct CDN.

Mức ảnh hưởng: LOW — Không gây lỗi, chỉ là code thừa. Retry chain vẫn hữu ích cho legacy images chưa có public_url.

Fix (medium-term): Simplify SafeImage — giữ 1 retry + fallback, bỏ transform logic.

B7. FlushViewCounts không cleanup entries đã flush

base_service.go
Lines 44-54
func (s *BaseService) FlushViewCounts() {
	s.viewBuffer.Range(func(k, v interface{}) bool {
		postID := k.(uuid.UUID)
		ptr := v.(*int64)
		delta := atomic.SwapInt64(ptr, 0)
		if delta > 0 {
			s.DB.Exec("UPDATE posts SET views = views + ? WHERE id = ?", delta, postID)
		}
		return true
	})
}
Sau khi flush, entry vẫn tồn tại trong sync.Map với counter = 0. Theo thời gian, nếu có hàng nghìn post được view rồi không bao giờ view lại, map sẽ phình lên.

Mức ảnh hưởng: LOW — Với blog cá nhân, sẽ không bao giờ đủ lớn để thành vấn đề. Nhưng fix cũng đơn giản.

Fix: Thêm s.viewBuffer.Delete(postID) sau khi flush xong delta.

B8. RecalculateAllEngagementScores dùng correlated subquery

post_repo.go
Lines 91-103
func (r *postRepo) RecalculateAllEngagementScores() error {
	return r.db.Exec(`
		UPDATE posts SET engagement_score = (
			views * 0.7 + COALESCE((
				SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id AND ...
			), 0) * 0.3
		) WHERE deleted_at IS NULL
	`).Error
}
Bây giờ đã có comment_count denormalized, query này nên dùng nó:

UPDATE posts SET engagement_score = views * 0.7 + comment_count * 0.3
WHERE deleted_at IS NULL
Mức ảnh hưởng: LOW — Chạy mỗi 5 phút, nhưng query hiện tại scan toàn bộ comments table. Dùng denormalized count sẽ instant.

C. Vấn đề mới phát hiện
C1. Redis DeletePrefix dùng SCAN — O(N) trên toàn bộ keyspace

redis_cache.go
Lines 62-82
func (r *RedisCache) DeletePrefix(prefix string) {
	iter := r.client.Scan(context.Background(), 0, r.key(prefix)+"*", 0).Iterator()
	// ... collect keys and delete
	// PLUS: duplicate scan without prefix
}
SCAN trên Redis iterate toàn bộ keyspace. Với ít key thì không sao, nhưng nếu cache lớn sẽ chậm. Plus, method scan 2 lần (một lần với prefix, một lần không) — đoạn scan thứ 2 có vẻ thừa.

Mức ảnh hưởng: LOW cho hiện tại. Sẽ thành vấn đề nếu Redis có 100k+ keys.

Fix: Bỏ đoạn scan thứ 2 (duplicate). Nếu cần optimize sau, dùng Redis keyspace notifications hoặc tổ chức key theo hash tags.

C2. Gob encoding cho Redis cache — fragile

redis_cache.go
Lines 38-44
func (r *RedisCache) Set(key string, value any, ttl time.Duration) {
	var buf bytes.Buffer
	if err := gob.NewEncoder(&buf).Encode(&value); err != nil {
		return // SILENT FAIL
	}
Gob encoding fail silently. Nếu quên gob.Register cho một type mới, cache sẽ không lưu được mà không báo lỗi. Đã thấy init() register các type chính, nhưng nếu thêm type mới (VD: []*dto.CategoryResponse) mà quên register → cache miss mãi mãi, khó debug.

Mức ảnh hưởng: LOW — Nhưng sẽ gây confusion khi thêm cache cho data mới.

Fix: Log error thay vì silent return. Hoặc chuyển sang JSON encoding cho simplicity.

C3. Comment Preload("Replies.User") vẫn eager
Backend FindByPostID cho comments vẫn preload tất cả replies cho mỗi comment. Nếu 1 comment có 100 replies → load hết 100.

Mức ảnh hưởng: LOW cho blog cá nhân (ít comment). MEDIUM nếu muốn scale.

