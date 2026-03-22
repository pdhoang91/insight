A. TỔNG QUAN (Executive Summary)
Đánh giá chung: 6.5/10 — Schema cơ bản tốt cho giai đoạn đầu, nhưng có nhiều vấn đề sẽ trở thành bottleneck khi scale.

Điểm mạnh:

Tách post_contents (JSONB nặng) ra khỏi posts — rất tốt cho listing queries
Denormalized comment_count trên posts — giảm aggregate queries
View buffering in-memory + flush batch — pattern tốt
Soft delete nhất quán trên posts/comments/replies
Engagement score pre-computed — tránh ORDER BY subquery
Điểm yếu lớn nhất:

Search dùng ILIKE '%query%' — full table scan, không dùng được bất kỳ index nào
Comment loading Preload("Replies.User") load TẤT CẢ replies — bom nổ chậm
UUID v4 random làm PK — fragmentation B-tree nghiêm trọng
Offset pagination khắp nơi — O(offset + limit) chi phí
Thiếu composite index cho hot queries — mỗi query filter + sort phải merge nhiều index
TOP 5 ƯU TIÊN FIX:

Thay search ILIKE bằng full-text search đã có index (document tsvector)
Không preload ALL replies khi load comments — lazy load hoặc limit
Thêm composite indexes cho hot queries
Chuyển offset → cursor pagination cho comments/replies
Chuẩn hóa junction table PKs (bỏ surrogate UUID)
B. RỦI RO SCHEMA CỐT LÕI
B1. UUID v4 random làm Primary Key
Vấn đề: uuid_generate_v4() tạo UUID random → INSERT phân tán khắp B-tree → page splits, fragmentation, cache miss cao
Ảnh hưởng: Mọi INSERT đều chậm dần theo kích thước bảng. Index bloat tăng. Buffer cache hit ratio giảm.
Severity: MEDIUM (ở quy mô blog cá nhân chưa đau, nhưng sẽ đau khi >100K rows)
Fix: Chuyển sang UUIDv7 (time-ordered) hoặc dùng gen_random_uuid() kết hợp ULID. UUIDv7 giữ được tính unique mà insert sequential.
B2. Junction tables có surrogate UUID PK thừa
Vấn đề: post_categories và post_tags có cột id UUID PRIMARY KEY riêng, trong khi đã có UNIQUE(post_id, category_id)
Ảnh hưởng: Mỗi junction row tốn thêm 16 bytes UUID + 1 index thừa. Query qua junction không bao giờ dùng id.
Severity: LOW
Fix: PK nên là (post_id, category_id) composite, bỏ cột id.
B3. dob VARCHAR(255) thay vì DATE
Severity: LOW — Sai kiểu dữ liệu, không validate được, không so sánh/sort được.
B4. email_verified còn nhưng verification flow đã bị drop
Severity: LOW — Dead column, gây confusion. Nên drop hoặc implement flow.
B5. Thiếu cột status trên posts
Vấn đề: Không có draft/published/archived state
Ảnh hưởng: Không hỗ trợ draft posts — feature cơ bản của blog
Severity: MEDIUM — Nên thêm status VARCHAR(20) DEFAULT 'published' và partial index WHERE status = 'published' AND deleted_at IS NULL
B6. post_contents quan hệ 1:1 nhưng không có UNIQUE constraint trên post_id
Vấn đề: Hiện tại chỉ có index trên post_id, không enforce 1 content per post ở DB level
Ảnh hưởng: Có thể tạo nhiều content rows cho 1 post → data corruption
Severity: MEDIUM
Fix: ALTER TABLE post_contents ADD CONSTRAINT uq_post_contents_post_id UNIQUE (post_id);
C. REVIEW MÔ HÌNH COMMENT/REPLY
Thiết kế hiện tại: 2 bảng riêng biệt
comments: id, post_id, user_id, content, deleted_at, ...
replies:  id, comment_id, post_id, user_id, content, deleted_at, ...
Mô hình này chỉ hỗ trợ 2 levels (comment → reply). Reply không thể reply reply.

Đánh giá: PHÙ HỢP cho blog, nhưng có vấn đề implementation
Ưu điểm của 2 bảng riêng:

Đơn giản, dễ hiểu
Query path rõ ràng: comments WHERE post_id = ? + replies WHERE comment_id = ?
Không cần recursive query
Phù hợp blog cá nhân (không cần deep threading như Reddit)
Nhược điểm:

Cùng logic (CRUD, soft delete, user preload) phải duplicate giữa 2 repo
Nếu sau này muốn 3+ levels → phải refactor hoàn toàn
replies.post_id redundant (đã derive được qua comment_id → comment.post_id)
So sánh các alternative:
Approach	Complexity	Query Cost	Flexibility	Recommendation
2 bảng riêng (hiện tại)	Thấp	Thấp	2 levels only	OK cho blog
Self-referencing parent_id	Thấp	Trung bình	N levels	Tốt hơn nếu muốn mở rộng
Materialized path	Trung bình	Thấp (LIKE prefix)	N levels	Over-engineering cho blog
Closure table	Cao	Thấp	N levels	Quá phức tạp
Nested set	Cao	Thấp read / Cao write	N levels	Không phù hợp
Khuyến nghị
Giữ 2 bảng riêng nếu chắc chắn chỉ cần 2 levels. Nhưng nếu muốn flexibility hơn mà không tốn công nhiều:

Gộp thành 1 bảng comments với parent_id UUID REFERENCES comments(id):

Top-level comments: parent_id IS NULL AND post_id = ?
Replies: parent_id = ?
Thêm depth SMALLINT DEFAULT 0 + CHECK depth <= 1 nếu muốn enforce 2 levels
Bỏ duplicate logic giữa comment repo và reply repo
post_id vẫn giữ trên mọi row để tránh recursive lookup
Trade-off: Migration effort trung bình, nhưng code đơn giản hơn dài hạn. Cân nhắc khi có thời gian, không urgent.

Vấn đề nghiêm trọng với implementation hiện tại
FindByPostID preload ALL replies:


comment_repo.go
Lines 34-40
func (r *commentRepo) FindByPostID(postID uuid.UUID, limit, offset int) ([]*entities.Comment, error) {
	var comments []*entities.Comment
	err := r.db.Preload("User").Preload("Replies.User").
		Where("post_id = ?", postID).
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&comments).Error
Vấn đề: Nếu 1 comment có 500 replies, GORM sẽ load TẤT CẢ 500 replies + 500 user records. Không có limit trên replies.

Fix cần thiết:

Bỏ Preload("Replies.User") khỏi FindByPostID
Chỉ trả replies_count (đã có CalculateReplyCounts)
Client gọi GET /comments/:id/replies?limit=10&offset=0 riêng để lazy load replies
Hoặc preload giới hạn: Preload("Replies", func(db *gorm.DB) *gorm.DB { return db.Order("created_at ASC").Limit(3) }) để show 3 replies đầu
D. QUERY PATH & INDEXING
D1. Hot Query: Homepage Feed (FindAll)

post_repo.go
Lines 50-57
func (r *postRepo) FindAll(limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
Query thực tế (GORM generates):

SELECT * FROM posts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 20 OFFSET 0;
-- + 1 query per relation: users WHERE id IN(...), post_categories + categories, post_tags + tags
Vấn đề:

idx_posts_created_at ON posts(created_at DESC) KHÔNG filter deleted_at IS NULL → Postgres phải scan index rồi filter → Partial index WHERE deleted_at IS NULL đã có ở migration 006 nhưng tên trùng với index gốc → cần verify index nào thực sự tồn tại
GORM Preload tạo N+1 pattern ẩn: 1 query posts + 1 query users + 1 query post_categories JOIN categories + 1 query post_tags JOIN tags = 4 queries per page load
Offset pagination: page 100 → scan 2000 rows rồi skip
Index cần thiết:

CREATE INDEX idx_posts_list ON posts(created_at DESC) 
  WHERE deleted_at IS NULL;
(Đã có tương tự ở migration 006, nhưng cần verify không bị trùng tên với index gốc)

D2. Hot Query: Post Detail (FindBySlug + FindByID)

post_repo.go
Lines 35-38
func (r *postRepo) FindBySlug(slug string) (*entities.Post, error) {
	var post entities.Post
	err := r.db.Where("slug = ?", slug).First(&post).Error
Rồi gọi loadPostRelationsParallel → 2 goroutines parallel:

FindByPostID (post_contents)
LoadRelationships → Preload User + Categories + Tags
Tổng queries cho 1 post detail: 4-5 queries (post by slug + content + user + categories + tags). Acceptable ở quy mô nhỏ, nhưng có thể giảm xuống 1-2 queries bằng JOIN.

Index: slug đã có UNIQUE index → OK.

D3. Hot Query: Search (ILIKE)

post_repo.go
Lines 87-94
func (r *postRepo) Search(query string, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Where("title ILIKE ? OR excerpt ILIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(limit).Offset(offset).
		Find(&posts).Error
CRITICAL: ILIKE '%query%' = FULL TABLE SCAN mọi lần. Bạn đã tạo:

document tsvector column (generated stored)
idx_posts_document GIN index
Trigram indexes
...nhưng KHÔNG DÙNG chúng. Code đang bypass hoàn toàn hệ thống full-text search.

Fix:

WHERE document @@ plainto_tsquery('english', $1)
   OR document @@ plainto_tsquery('simple', $1)
Hoặc dùng trigram nếu muốn fuzzy:

WHERE title % $1 OR excerpt % $1
D4. Hot Query: Comments by Post
4 queries cho 1 comment page:

COUNT(*) FROM comments WHERE post_id = ? (CountByPostID)
SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC LIMIT 10 (FindByPostID)
SELECT * FROM replies WHERE comment_id IN (...) (Preload — unbounded!)
COUNT(*) FROM replies WHERE post_id = ? (CountByPostID)
SELECT comment_id, COUNT(*) FROM replies WHERE comment_id IN (...) GROUP BY comment_id (CalculateReplyCounts)
= 5 queries + preload ALL replies. Đây là điểm nóng nhất.

Index thiếu:

-- Composite cho comment listing (filter + sort + soft delete)
CREATE INDEX idx_comments_post_active ON comments(post_id, created_at DESC) 
  WHERE deleted_at IS NULL;
-- Composite cho reply listing
CREATE INDEX idx_replies_comment_active ON replies(comment_id, created_at ASC) 
  WHERE deleted_at IS NULL;
D5. Missing Indexes Summary
Query Path	Cần Index	Ưu tiên
Posts by user + sort	(user_id, created_at DESC) WHERE deleted_at IS NULL	HIGH
Posts by category + sort	post_categories(category_id, post_id)	MEDIUM
Posts by tag + sort	post_tags(tag_id, post_id)	MEDIUM
Comments by post + sort	comments(post_id, created_at DESC) WHERE deleted_at IS NULL	HIGH
Replies by comment + sort	replies(comment_id, created_at ASC) WHERE deleted_at IS NULL	HIGH
Post content by post	UNIQUE(post_id) WHERE deleted_at IS NULL trên post_contents	MEDIUM
D6. N+1 Patterns
GORM Preload: Mỗi Preload("User") là 1 query riêng SELECT * FROM users WHERE id IN (...). Cho 20 posts = 1 post query + 1 user query + 1 categories query + 1 tags query = 4 queries cố định. Acceptable vì dùng IN, nhưng nếu categories/tags có nhiều → payload lớn.

CalculateCountsForPosts chỉ gọi trong SearchPosts, không gọi trong ListPosts, GetLatestPosts, GetPopularPosts. Lý do: các path đó dùng denormalized comment_count. Nhưng SearchPosts gọi CalculateCountsForPosts thay vì đọc comment_count → inconsistent logic.

E. CẢI THIỆN CỤ THỂ
E1. Search dùng ILIKE → Full-text search
Problem: Full table scan
Root cause: Code không dùng tsvector/trigram index đã tạo
Change: Đổi WHERE title ILIKE... → WHERE document @@ plainto_tsquery(...) trong Search() và CountSearch()
Impact: Từ O(N) → O(log N). Tốc độ search tăng 10-100x
Complexity: LOW
Priority: DO NOW
E2. Unbounded reply preload → Lazy load
Problem: Load tất cả replies cho mọi comment
Root cause: Preload("Replies.User") không có limit
Change: Bỏ preload replies, chỉ trả replies_count. Client lazy load replies riêng.
Impact: Giảm data transfer 10-100x cho comment-heavy posts
Complexity: LOW
Priority: DO NOW
E3. Thêm composite indexes
Problem: Single-column indexes không cover filter + sort
Root cause: Indexes tạo từng cột riêng lẻ
Change: Tạo composite indexes (xem D5)
Impact: Query planner dùng 1 index thay vì merge/bitmap scan
Complexity: LOW (chỉ thêm migration)
Priority: DO NOW
E4. Offset → Cursor pagination cho comments/replies
Problem: Offset O(n) cost
Root cause: Dùng LIMIT/OFFSET truyền thống
Change: Dùng WHERE created_at < ? ORDER BY created_at DESC LIMIT ? (keyset pagination)
Impact: Trang 100 cũng nhanh như trang 1
Complexity: MEDIUM (đổi API contract)
Priority: DO LATER (ở quy mô nhỏ chưa đau lắm)
E5. CalculateCountsForPosts trong SearchPosts → dùng comment_count
Problem: Search path chạy thêm aggregate query không cần thiết
Root cause: Code chưa dùng denormalized column
Change: Bỏ CalculateCountsForPosts call trong SearchPosts, comment_count đã có trên posts
Impact: Giảm 1 query mỗi search request
Complexity: LOW
Priority: DO NOW
E6. post_contents.post_id cần UNIQUE
Problem: Không enforce 1:1 ở DB level
Change: Thêm unique constraint
Complexity: LOW
Priority: DO NOW
E7. FlushViewCounts batch thay vì từng UPDATE
Problem: FlushViewCounts chạy 1 UPDATE per post
Change: Batch thành 1 query:
UPDATE posts SET views = views + c.delta
FROM (VALUES ($1,$2), ($3,$4), ...) AS c(id, delta)
WHERE posts.id = c.id;
Impact: 100 posts buffered = 1 query thay vì 100
Complexity: LOW
Priority: DO LATER
E8. RecalculateAllEngagementScores full table UPDATE mỗi 5 phút
Problem: UPDATE posts SET engagement_score = ... WHERE deleted_at IS NULL lock + write mọi row
Change: Chỉ recalculate posts có views/comments thay đổi. Track dirty posts.
Impact: Giảm WAL/IO 90%+ khi phần lớn posts không thay đổi
Complexity: MEDIUM
Priority: DO LATER
F. ROADMAP
Quick Wins (1-2 ngày)
Fix search dùng full-text search thay ILIKE
Bỏ Preload("Replies.User") trong FindByPostID, trả replies_count only
Bỏ CalculateCountsForPosts trong SearchPosts
Thêm UNIQUE constraint trên post_contents.post_id
Thêm composite indexes (comments, replies, posts by user)
Medium-term (1-2 tuần)
Bỏ surrogate UUID trên junction tables → composite PK
Batch FlushViewCounts thành 1 query
Thêm status column cho draft/published
Incremental engagement score recalculation
Cursor pagination cho comments/replies API
Long-term (khi scale)
UUIDv7 thay UUIDv4 cho mọi table
Gộp comments + replies thành 1 bảng self-referencing (nếu cần > 2 levels)
Read replicas cho listing queries
Connection pooling (PgBouncer) nếu concurrent connections tăng
Materialized view cho homepage aggregates (latest + popular + categories)
G. CALLOUTS CỤ THỂ
Post listing efficiency: Tốt nhờ tách content ra bảng riêng. Cần partial composite index cho soft delete filter. 4 queries per page (GORM preload) là acceptable.

Post detail query efficiency: 4-5 queries là hơi nhiều. Parallel loading (2 goroutines) giúp latency. Caching 60s là đủ. Có thể giảm còn 2 queries bằng JOIN nhưng không urgent.

Comment/reply loading performance: ĐÂY LÀ ĐIỂM ĐAU LỚN NHẤT. 5 queries + unbounded reply preload. Fix ngay bằng cách bỏ preload replies.

Counter strategy: Tốt. comment_count denormalized + increment/decrement best-effort. View buffering pattern tốt. Chỉ cần batch flush.

Index strategy: Cơ bản có đủ single-column indexes. Thiếu composite indexes cho hot paths. Full-text search indexes tạo rồi nhưng không dùng.

Denormalization opportunities: comment_count đã denorm (tốt). Có thể denorm replies_count trên comments nếu traffic tăng (hiện tại compute on-the-fly chấp nhận được). KHÔNG cần denorm thêm cho blog cá nhân.

Future scalability: Schema handle được vài trăm nghìn posts + vài triệu comments nếu fix indexes. Bottleneck đầu tiên sẽ là comment loading (unbounded replies) và search (ILIKE). Fix 2 cái đó trước.

DB resource usage: RecalculateAllEngagementScores mỗi 5 phút là WAL-heavy nhất. JSONB content tách riêng giữ posts table lean — tốt cho buffer cache. UUID random gây index bloat nhưng ở quy mô blog chưa đáng lo.