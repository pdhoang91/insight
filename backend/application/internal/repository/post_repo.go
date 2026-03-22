package repository

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type postRepo struct{ db *gorm.DB }

func NewPostRepository(db *gorm.DB) PostRepository { return &postRepo{db: db} }

func (r *postRepo) WithTx(tx *gorm.DB) PostRepository { return &postRepo{db: tx} }

func (r *postRepo) Create(post *entities.Post) error {
	return r.db.Create(post).Error
}

func (r *postRepo) Update(post *entities.Post) error {
	return r.db.Save(post).Error
}

func (r *postRepo) Delete(post *entities.Post) error {
	return r.db.Delete(post).Error
}

func (r *postRepo) FindByID(id uuid.UUID) (*entities.Post, error) {
	var post entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").Where("id = ?", id).First(&post).Error
	return &post, err
}

func (r *postRepo) FindBySlug(slug string) (*entities.Post, error) {
	var post entities.Post
	err := r.db.Where("slug = ?", slug).First(&post).Error
	return &post, err
}

func (r *postRepo) FindByUserID(userID uuid.UUID, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Where("user_id = ?", userID).
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) FindAll(limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) Count() (int64, error) {
	var count int64
	err := r.db.Model(&entities.Post{}).Count(&count).Error
	return count, err
}

func (r *postRepo) CountByUserID(userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Post{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

func (r *postRepo) CountSearch(query string) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Post{}).
		Where("document @@ plainto_tsquery('english', ?) OR document @@ plainto_tsquery('simple', ?)", query, query).
		Count(&count).Error
	return count, err
}

func (r *postRepo) List(limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) Search(query string, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Where("document @@ plainto_tsquery('english', ?) OR document @@ plainto_tsquery('simple', ?)", query, query).
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) GetPopular(limit int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Order("engagement_score DESC").
		Limit(limit).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) RecalculateAllEngagementScores() error {
	return r.db.Exec(`
		UPDATE posts
		SET engagement_score = views * 0.7 + comment_count * 0.3
		WHERE deleted_at IS NULL
	`).Error
}

func (r *postRepo) FindByCategory(categoryID uuid.UUID, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Joins("JOIN post_categories ON posts.id = post_categories.post_id").
		Where("post_categories.category_id = ?", categoryID).
		Order("posts.created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) CountByCategory(categoryID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Post{}).
		Joins("JOIN post_categories ON posts.id = post_categories.post_id").
		Where("post_categories.category_id = ?", categoryID).
		Count(&count).Error
	return count, err
}

func (r *postRepo) FindByTag(tagID uuid.UUID, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Joins("JOIN post_tags ON posts.id = post_tags.post_id").
		Where("post_tags.tag_id = ?", tagID).
		Order("posts.created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) CountByTag(tagID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Post{}).
		Joins("JOIN post_tags ON posts.id = post_tags.post_id").
		Where("post_tags.tag_id = ?", tagID).
		Count(&count).Error
	return count, err
}

func (r *postRepo) FindByYearMonth(year, month int, limit, offset int) ([]*entities.Post, error) {
	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0)
	var posts []*entities.Post
	err := r.db.Preload("User").Preload("Categories").Preload("Tags").
		Where("created_at >= ? AND created_at < ?", start, end).
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) CountByYearMonth(year, month int) (int64, error) {
	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0)
	var count int64
	err := r.db.Model(&entities.Post{}).
		Where("created_at >= ? AND created_at < ?", start, end).
		Count(&count).Error
	return count, err
}

func (r *postRepo) GetArchiveSummary() ([]*ArchiveSummaryItem, error) {
	var items []*ArchiveSummaryItem
	err := r.db.Raw(`
		SELECT
			EXTRACT(YEAR FROM created_at)::int  AS year,
			EXTRACT(MONTH FROM created_at)::int AS month,
			COUNT(*)                            AS count
		FROM posts
		WHERE deleted_at IS NULL
		GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
		ORDER BY year DESC, month DESC
	`).Scan(&items).Error
	if err != nil {
		return nil, err
	}
	if items == nil {
		items = []*ArchiveSummaryItem{}
	}
	return items, nil
}

func (r *postRepo) IncrementViews(post *entities.Post) error {
	return r.db.Model(post).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error
}

func (r *postRepo) IncrementCommentCount(postID uuid.UUID) error {
	return r.db.Exec("UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?", postID).Error
}

func (r *postRepo) DecrementCommentCount(postID uuid.UUID) error {
	return r.db.Exec("UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = ?", postID).Error
}

func (r *postRepo) CalculateCounts(post *entities.Post) error {
	var commentCount int64
	if err := r.db.Model(&entities.Comment{}).
		Where("post_id = ?", post.ID).
		Count(&commentCount).Error; err != nil {
		return err
	}
	post.CommentsCount = uint64(commentCount)
	return nil
}

func (r *postRepo) AppendCategories(post *entities.Post, categories []entities.Category) error {
	return r.db.Model(post).Association("Categories").Append(&categories)
}

func (r *postRepo) ReplaceCategories(post *entities.Post, categories []entities.Category) error {
	return r.db.Model(post).Association("Categories").Replace(&categories)
}

func (r *postRepo) AppendTags(post *entities.Post, tags []entities.Tag) error {
	return r.db.Model(post).Association("Tags").Append(&tags)
}

func (r *postRepo) ReplaceTags(post *entities.Post, tags []entities.Tag) error {
	return r.db.Model(post).Association("Tags").Replace(&tags)
}

func (r *postRepo) LoadRelationships(post *entities.Post) error {
	return r.db.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error
}

func (r *postRepo) ExistsBySlugExcluding(slug string, excludeID uuid.UUID) bool {
	var count int64
	r.db.Model(&entities.Post{}).Where("slug = ? AND id != ?", slug, excludeID).Count(&count)
	return count > 0
}

func (r *postRepo) CalculateCountsForPosts(posts []*entities.Post) error {
	if len(posts) == 0 {
		return nil
	}
	postIDs := make([]uuid.UUID, len(posts))
	for i, post := range posts {
		postIDs[i] = post.ID
	}
	type CommentResult struct {
		PostID       uuid.UUID
		CommentCount int64
	}
	var commentCounts []CommentResult
	if err := r.db.Model(&entities.Comment{}).
		Select("post_id, COUNT(*) as comment_count").
		Where("post_id IN ?", postIDs).
		Group("post_id").
		Scan(&commentCounts).Error; err != nil {
		return err
	}
	commentMap := make(map[uuid.UUID]int64)
	for _, r := range commentCounts {
		commentMap[r.PostID] = r.CommentCount
	}
	for _, post := range posts {
		post.CommentsCount = uint64(commentMap[post.ID])
	}
	return nil
}
