A. Tóm tắt điều hành
Đánh giá tổng thể: Đây là một monolith Golang khá tốt cho một blog platform. Layer boundaries rõ ràng hơn phần lớn codebase cùng quy mô. Có ý thức về Clean Architecture, ISP, và error handling. Tuy nhiên tồn tại một số vấn đề thiết kế ở service layer và infrastructure leaking cần xử lý.

Điểm mạnh lớn nhất:

apperror package clean, nhất quán
Controller handlers rất mỏng — chỉ parse, delegate, respond
Repository interfaces tốt, WithTx pattern đúng hướng
Two-tier cache design thực tế
respondError / parsePagination / requireUserID shared helpers tốt
Điểm yếu lớn nhất:

InsightService là God Service — implement tất cả domain interfaces trên 1 concrete type
BaseService leak *gorm.DB và toàn bộ repos qua public exported fields — phá vỡ encapsulation
Transaction management verbose, error-prone, không consistent
Duplicate JWT generation code giữa middleware/ và pkg/jwt/
Response format không nhất quán giữa các controllers
Top 5 ưu tiên refactor:

Ẩn BaseService fields (private), bỏ direct DB access từ service
Extract transaction helper để giảm boilerplate
Xóa duplicate GenerateJWT trong middleware/auth.go
Di chuyển ArchiveSummaryItem / CategoryPostCount ra khỏi repository package
Chuẩn hóa response format
B. Các vấn đề kiến trúc chính
1. BaseService với public exported fields

Nằm ở: internal/service/base_service.go
Vấn đề: DB, Cache, S3Client, StorageManager, UserRepo, PostRepo... tất cả là public. Code bên ngoài package có thể access baseService.DB trực tiếp, bypass toàn bộ abstraction.
Ảnh hưởng: cao
2. *gorm.DB leak vào service layer

Nằm ở: service/base_service.go field DB *gorm.DB, và usage trong service/post.go — tx := s.DB.Begin()
Vấn đề: Service layer biết rõ đang dùng GORM. Nếu sau này muốn đổi ORM hay dùng raw sql, phải sửa toàn bộ service. Đây là infra detail không nên exposed lên service.
Ảnh hưởng: trung bình (đủ thực tế để chấp nhận tạm thời, nhưng nên refactor)
3. God Service — InsightService implements 8 interfaces

Nằm ở: service/interfaces.go — var _ Service = (*InsightService)(nil)
Vấn đề: Toàn bộ business logic nằm trên 1 struct 1000+ dòng. File service/user.go, service/post.go, service/comment.go tất cả đều method của cùng 1 type. Đây là structural ISP, không phải real ISP — interface tách nhưng implementation vẫn là monolith.
Ảnh hưởng: trung bình (chấp nhận cho quy mô hiện tại, nhưng sẽ đau khi scale)
4. config.Get() sẽ panic nếu OAuth chưa init

Nằm ở: config/config.go dòng 184-188, gọi trong service/user.go — cfg := config.Get()
Vấn đề: Global mutable state, panic thay vì error return. Nếu OAuth không được config (chạy dev không có credentials), server crash ngay khi hit /auth/google.
Ảnh hưởng: cao
5. Duplicate JWT generation

Nằm ở: middleware/auth.go có GenerateJWT() + pkg/jwt/jwt.go cũng có GenerateJWT()
Vấn đề: Hai implementations tồn tại song song. Service/user.go gọi jwtUtil.GenerateJWT (đúng), nhưng middleware/auth.go expose một bản khác — nếu ai đó gọi nhầm middleware.GenerateJWT thì secret/claim behavior có thể khác.
Ảnh hưởng: trung bình
C. Các vấn đề theo từng layer
Handler/Controller
Tốt:

Handlers thực sự mỏng — parse → delegate → respond
Shared helpers respondError, parsePagination, requireUserID, ensureNotNil rất tốt
Mỗi sub-controller chỉ nhận interface mình cần
Vấn đề:

Response format không nhất quán. So sánh:

GetPost → gin.H{"data": gin.H{"post": response}}
ListPosts → gin.H{"data": responses, "total_count": total, ...}
CreatePost → gin.H{"data": response}
Register → ctx.JSON(http.StatusCreated, response) (không wrap)
Frontend sẽ cần handle 3-4 kiểu response struct khác nhau.

Route trùng lặp. Trong router.go:

public.GET("/users/:id/posts", ...)   // dòng 57
protected.GET("/users/:id/posts", ...) // dòng 82
Gin sẽ ưu tiên route đầu tiên — protected route này vô nghĩa.

GetPostsByYearMonth validate req.Limit == 0 ở cả controller lẫn service — duplicate guard.

/debug-jwt route là public endpoint trong production code — nguy cơ thông tin leak.

Usecase/Service
Tốt:

Business logic đúng chỗ, không rò vào handler hay repo
invalidatePostListCaches() / invalidatePostDetailCaches() tách riêng gọn
Vấn đề:

Transaction pattern verbose và error-prone. CreatePost, UpdatePost, DeletePost đều có pattern:

tx := s.DB.Begin()
defer func() { if r := recover(); r != nil { tx.Rollback() } }()
// ...
if err != nil {
    tx.Rollback()   // manual rollback tại từng điểm lỗi
    return nil, err
}
Vừa dài vừa dễ quên Rollback(). Pattern chuẩn nên là:

tx := s.DB.Begin()
defer tx.Rollback() // chỉ rollback nếu chưa commit
// ... nếu OK thì tx.Commit()
defer tx.Rollback() sau tx.Commit() là no-op, không gây hại.

FlushViewCounts trực tiếp gọi s.DB.Exec() trong service — bypass hoàn toàn repository layer. IncrementViews đã có trong PostRepository nhưng không được dùng (dùng buffer riêng là hợp lý), tuy nhiên flush nên đi qua repo.

loadPostRelationsParallel bỏ qua error:

var relErr error
// ...
go func() { relErr = s.PostRepo.LoadRelationships(post) }()
wg.Wait()
_ = relErr  // lỗi bị bỏ qua hoàn toàn
Nếu relationship load fail, response sẽ trả về post thiếu categories/tags mà không báo lỗi.

UpdateUserAvatarV2 có logic bug tiềm ẩn:

user.AvatarURL = uploadResponse.URL  // set new URL
s.UserRepo.Update(user)
// Sau đó check:
if user.AvatarURL != "" && user.AvatarURL != uploadResponse.URL {
    // Condition này LUÔN false vì vừa set = uploadResponse.URL
Old avatar sẽ không bao giờ bị xóa.

GetHomeData tạo cache stacking: Nó gọi GetLatestPosts() và GetPopularPosts() — vốn đã có cache riêng — sau đó cache lại toàn bộ HomeResponse. Khi invalidate, phải nhớ xóa cả 3 levels cache. Hiện tại RecalculateEngagementScores xóa popular_posts: nhưng không xóa home_data cùng lúc (thực ra có, nhưng các goroutine background interval lệch nhau có thể gây stale window).

DeleteComment không dùng transaction. Delete replies và delete comment là 2 operations riêng — nếu delete replies thành công nhưng delete comment fail, data sẽ inconsistent.

Hầu hết service methods không nhận context.Context — không có cách để cancel/timeout DB queries từ HTTP request. Chỉ image methods mới có context. Về dài hạn đây là thiếu sót lớn.

SearchPosts không nằm trong PostService interface nhưng lại được expose. Nó được route qua SearchController sử dụng SearchService → GetSearchClient(). Thực tế search logic trong service/post.go vẫn gọi PostRepo.Search trực tiếp — hai luồng search tồn tại song song không rõ ràng.

Repository/Data Access
Tốt:

Repository interfaces clean, không biết về business rules
WithTx pattern tốt — không inject DB mới, wrap existing connection
Cursor pagination cho comments/replies: tốt
Vấn đề:

Duplicate method FindAll và List trong PostRepository:

FindAll(limit, offset int) — có order created_at DESC, Preload User/Categories/Tags
List(limit, offset int) — không có order, Preload User/Categories/Tags
Hai method khác nhau ở ORDER BY, nhưng naming không thể hiện điều đó. GetLatestPosts trong service gọi FindAll (đúng), List dường như không được dùng.

ArchiveSummaryItem và CategoryPostCount khai báo trong repository package. Đây là response/DTO types, không phải repository internals. Khi service return chúng, và gob-encode chúng (main.go), ta đã couple service/transport layer với repository naming.

PostRepository interface quá fat. Nhiều methods như AppendCategories, ReplaceCategories, AppendTags, ReplaceTags, LoadRelationships, RecalculateAllEngagementScores thuộc về GORM association logic, không phải pure data access. Đặc biệt RecalculateAllEngagementScores chứa business formula.

PostRepo.FindByID luôn Preload User/Categories/Tags kể cả khi chỉ cần check existence (e.g., CreateComment gọi PostRepo.FindByID chỉ để verify post tồn tại). N+1 không có, nhưng over-fetching có.

Magic number trong RecalculateAllEngagementScores:

SET engagement_score = views * 0.7 + comment_count * 0.3
Business formula này hardcode trong SQL trong repository layer — nên là constant hoặc config.

Domain/Model
Tốt:

Entities clean, mapping GORM tags rõ ràng
Soft delete dùng gorm.DeletedAt đúng cách
Content json.RawMessage với gorm:"-" tách content storage logic sạch
Vấn đề:

Post entity có cả Comments []Comment và PostContent PostContent trong struct nhưng không bao giờ được populate qua GORM Preload trong bất kỳ repo query nào. Dễ gây nhầm lẫn — những field này chỉ được populate thủ công trong service. Nên dùng comment hoặc xóa khỏi struct.
Infrastructure
Tốt:

pkg/cache với interface + memory + redis + two-tier clean
pkg/storage với provider pattern tốt
Vấn đề:

config/config.go dùng logger.Default.LogMode(logger.Info) — log toàn bộ SQL queries trong production, gây noise và performance overhead.
Global package-level vars GoogleOauthConfig và S3Client trong config/ được mark deprecated nhưng vẫn được sử dụng trong main.go — inconsistent migration.
config.Get() panic thay vì return error — nên inject oauth config vào service, không dùng global accessor.
Dependency Direction
Nhìn chung dependency direction đúng: controller → service → repository → entities. Tuy nhiên:

service/user.go import config package — service biết về infra config. Nên inject *oauth2.Config qua constructor.
repository/interfaces.go expose ArchiveSummaryItem, CategoryPostCount — repository types leak vào service/transport layer.
main.go import repository trực tiếp (để gob register) — coupling main với internal types.
D. Các cơ hội refactor và tái sử dụng
1. Transaction helper

Vấn đề: CreatePost, UpdatePost, DeletePost đều lặp pattern begin/defer-recover/multi-rollback ~15 dòng
Hướng: Extract func withTx(db *gorm.DB, fn func(*gorm.DB) error) error
Lợi ích: Loại bỏ ~45 dòng boilerplate, không quên rollback
Độ phức tạp: thấp
func withTx(db *gorm.DB, fn func(tx *gorm.DB) error) error {
    tx := db.Begin()
    if tx.Error != nil {
        return tx.Error
    }
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()
    if err := fn(tx); err != nil {
        tx.Rollback()
        return err
    }
    return tx.Commit().Error
}
2. Response wrapper chuẩn hóa

Vấn đề: 4 kiểu response format trong codebase
Hướng: Tạo helper respondOK(ctx, data), respondList(ctx, data, total, limit, offset), respondCreated(ctx, data)
Lợi ích: Frontend nhất quán, ít code trong controller
Độ phức tạp: thấp
3. Di chuyển DTO types ra khỏi repository

Vấn đề: ArchiveSummaryItem, CategoryPostCount trong repository/interfaces.go
Hướng: Move vào dto/ package
Lợi ích: Bỏ coupling repo → dto trong service, bỏ gob registration của repo types trong main.go
Độ phức tạp: thấp
4. Private BaseService fields

Vấn đề: Tất cả deps là public exported
Hướng: Lowercase tất cả fields, thêm getter methods hoặc chỉ access trong package
Lợi ích: Enforce encapsulation, không code ngoài package có thể touch DB trực tiếp
Độ phức tạp: thấp (chỉ rename)
5. Tách findOrCreateCategories / findOrCreateTags thành CategoryService/TagService

Vấn đề: Logic này nằm trong post.go service nhưng thuộc về category/tag domain
Hướng: Move vào respective service
Lợi ích: Single responsibility, tái sử dụng nếu có flow khác cần find-or-create
Độ phức tạp: thấp
E. Đề xuất cấu trúc thư mục/module
Cấu trúc hiện tại về cơ bản đã hợp lý. Chỉ một vài điều chỉnh nhỏ:

backend/application/
├── cmd/                        # (đổi từ main.go trực tiếp)
│   └── server/main.go
├── config/
├── constants/
├── internal/
│   ├── apperror/
│   ├── controller/
│   ├── dto/                    # thêm ArchiveSummaryItem, CategoryPostCount vào đây
│   ├── entities/
│   ├── middleware/             # chỉ giữ middleware, bỏ GenerateJWT
│   ├── repository/
│   ├── service/
│   └── router.go
└── pkg/
    ├── cache/
    ├── httpclient/
    ├── image/
    ├── jwt/                    # single source of JWT logic
    ├── revalidation/
    ├── storage/
    └── utils/
Không cần tổ chức lại theo feature (e.g., internal/post/, internal/user/) ở quy mô hiện tại — hybrid hiện tại là practical.

F. Đề xuất cải thiện Clean Architecture
Đang đúng:

Controller → Service → Repository dependency direction
Interface-driven service layer
apperror tách error types khỏi HTTP concerns
Repository pattern với entity types
Đang sai/chưa rõ:

Service layer biết về *gorm.DB (transaction management) — đây là infrastructure concern
config.Get() global accessor trong service — service không nên biết về config package
Repository types (ArchiveSummaryItem) leak lên transport layer
Nên sửa thế nào:

Inject *oauth2.Config vào constructor thay vì gọi config.Get() trong service method
Transaction management: hoặc dùng helper function như trên, hoặc về dài hạn có thể dùng Unit of Work pattern — nhưng chưa cần ở quy mô hiện tại
Move DTO types về dto/ package
Chỗ không nên áp dụng Clean Architecture quá cứng:

InsightService là God Service — điều này thực ra chấp nhận được cho blog monolith. Ép split thành nhiều service độc lập với injection riêng sẽ tăng complexity không cần thiết. Chỉ cần đảm bảo mỗi method đặt đúng file là đủ.
Repository không nhất thiết phải pure CRUD — AppendCategories, ReplaceCategories là GORM association ops, giữ trong repo là hợp lý.
G. Roadmap Refactor
Quick wins (1-2 ngày)

Fix
UpdateUserAvatarV2
bug — old avatar không bị xóa

Fix
loadPostRelationsParallel
— không bỏ qua
relErr

Xóa
GenerateJWT
duplicate trong
middleware/auth.go

Fix route trùng
/users/:id/posts
(public vs protected)

Remove/protect
/debug-jwt
endpoint

defer tx.Rollback()
pattern thay vì manual rollback tại từng error point

Private
BaseService
fields

logger.Default.LogMode(logger.Silent)
hoặc
logger.Warn
trong production
Refactor trung hạn (1-2 tuần)

Move
ArchiveSummaryItem
,
CategoryPostCount
→
dto/

Chuẩn hóa response format —
respondOK
,
respondList
,
respondCreated
helpers

withTx
helper function để giảm boilerplate transaction

Inject
*oauth2.Config
vào service constructor thay vì
config.Get()

DeleteComment
wrap trong transaction

Xóa duplicate
FindAll
/
List
trong PostRepository, rename rõ ràng

Di chuyển engagement formula vào constants
Cải tổ cấu trúc lớn hơn (tùy chọn, không bắt buộc)

Context propagation cho toàn bộ service methods — cần nếu muốn proper timeout/cancellation

Tách
FlushViewCounts
/
RecalculateEngagementScores
thành background worker package riêng thay vì goroutine trong
main.go

cmd/server/
entrypoint structure nếu cần thêm multiple binary
H. Nhận xét bắt buộc
Layer boundaries: Tốt nhìn chung, nhưng bị phá vỡ ở hai điểm: service biết *gorm.DB, và service gọi config.Get().

Dependency direction: Đúng chiều, ngoại trừ repository/ package export DTO types lên trên.

Duplicated business logic: findOrCreateCategories / findOrCreateTags lặp hoàn toàn. Validate post ID trong CreateComment service có thể là redundant nếu DB đã có FK constraint.

Duplicated DB logic: GenerateJWT duplicate giữa middleware/ và pkg/jwt/.

Interface overuse/underuse: Interface service và repository đúng mức. Service composite interface là backward compat, hợp lý. Không có interface pollution.

Error handling: apperror package rất tốt. Nhất quán. Duy nhất vấn đề là config.Get() panic thay vì error, và _ = relErr bỏ qua lỗi.

Testability: Khá tốt — controllers nhận interfaces, repos nhận interfaces. Vấn đề duy nhất là BaseService.DB public làm khó mock transaction. config.Get() global state khó test.

Maintainability: Tốt. Codebase nhỏ gọn, không over-engineered. Naming rõ ràng. Risks chính: transaction boilerplate dễ copy-paste sai, response format inconsistency sẽ đau khi scale API.

Performance trade-offs: loadPostRelationsParallel tốt. Buffer view counts tốt. Cache stacking GetHomeData → GetLatestPosts → cache lại là acceptable nhưng phức tạp khi debug stale. FindByID always preload toàn bộ relations ngay cả khi chỉ cần check existence — over-fetching nhỏ nhưng accumulated.

Không nên trừu tượng hóa thêm: InsightService monolith hiện tại ổn — không cần split. Repository GORM associations không cần wrapping thêm. Two-tier cache không cần thêm layer.