package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type postRepo struct{}

func NewPostRepository() PostRepository { return &postRepo{} }

func (r *postRepo) Create(db *gorm.DB, post *entities.Post) error {
	return db.Create(post).Error
}

func (r *postRepo) Update(db *gorm.DB, post *entities.Post) error {
	return db.Save(post).Error
}

func (r *postRepo) Delete(db *gorm.DB, post *entities.Post) error {
	return db.Delete(post).Error
}

func (r *postRepo) FindByID(db *gorm.DB, id uuid.UUID) (*entities.Post, error) {
	var post entities.Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").Where("id = ?", id).First(&post).Error
	return &post, err
}

func (r *postRepo) FindByTitleName(db *gorm.DB, titleName string) (*entities.Post, error) {
	var post entities.Post
	err := db.Where("title_name = ?", titleName).First(&post).Error
	return &post, err
}

func (r *postRepo) FindByUserID(db *gorm.DB, userID uuid.UUID, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Where("user_id = ?", userID).
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) FindAll(db *gorm.DB, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) Count(db *gorm.DB) (int64, error) {
	var count int64
	err := db.Model(&entities.Post{}).Count(&count).Error
	return count, err
}

func (r *postRepo) List(db *gorm.DB, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) Search(db *gorm.DB, query string, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Where("title ILIKE ? OR preview_content ILIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) GetPopular(db *gorm.DB, limit int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Select("posts.*, COALESCE((SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id), 0) as comments_count").
		Order("(posts.views * 0.7 + COALESCE((SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id), 0) * 0.3) DESC").
		Limit(limit).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) FindByCategory(db *gorm.DB, categoryID uuid.UUID, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Joins("JOIN post_categories ON posts.id = post_categories.post_id").
		Where("post_categories.category_id = ?", categoryID).
		Order("posts.created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) CountByCategory(db *gorm.DB, categoryID uuid.UUID) (int64, error) {
	var count int64
	err := db.Model(&entities.Post{}).
		Joins("JOIN post_categories ON posts.id = post_categories.post_id").
		Where("post_categories.category_id = ?", categoryID).
		Count(&count).Error
	return count, err
}

func (r *postRepo) FindByYearMonth(db *gorm.DB, year, month int, limit, offset int) ([]*entities.Post, error) {
	var posts []*entities.Post
	err := db.Preload("User").Preload("Categories").Preload("Tags").
		Where("EXTRACT(YEAR FROM created_at) = ? AND EXTRACT(MONTH FROM created_at) = ?", year, month).
		Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&posts).Error
	return posts, err
}

func (r *postRepo) CountByYearMonth(db *gorm.DB, year, month int) (int64, error) {
	var count int64
	err := db.Model(&entities.Post{}).
		Where("EXTRACT(YEAR FROM created_at) = ? AND EXTRACT(MONTH FROM created_at) = ?", year, month).
		Count(&count).Error
	return count, err
}

func (r *postRepo) IncrementViews(db *gorm.DB, post *entities.Post) error {
	return db.Model(post).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error
}

func (r *postRepo) CalculateCounts(db *gorm.DB, post *entities.Post) error {
	var clapCount int64
	if err := db.Model(&entities.UserActivity{}).
		Where("post_id = ? AND action_type = ?", post.ID, "clap_post").
		Select("COALESCE(SUM(count), 0)").Row().Scan(&clapCount); err != nil {
		return err
	}
	post.ClapCount = uint64(clapCount)

	var commentCount int64
	if err := db.Model(&entities.Comment{}).
		Where("post_id = ?", post.ID).
		Count(&commentCount).Error; err != nil {
		return err
	}
	post.CommentsCount = uint64(commentCount)
	return nil
}

func (r *postRepo) AppendCategories(db *gorm.DB, post *entities.Post, categories []entities.Category) error {
	return db.Model(post).Association("Categories").Append(&categories)
}

func (r *postRepo) ReplaceCategories(db *gorm.DB, post *entities.Post, categories []entities.Category) error {
	return db.Model(post).Association("Categories").Replace(&categories)
}

func (r *postRepo) AppendTags(db *gorm.DB, post *entities.Post, tags []entities.Tag) error {
	return db.Model(post).Association("Tags").Append(&tags)
}

func (r *postRepo) ReplaceTags(db *gorm.DB, post *entities.Post, tags []entities.Tag) error {
	return db.Model(post).Association("Tags").Replace(&tags)
}

func (r *postRepo) LoadRelationships(db *gorm.DB, post *entities.Post) error {
	return db.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error
}

func (r *postRepo) ExistsByTitleNameExcluding(db *gorm.DB, titleName string, excludeID uuid.UUID) bool {
	var count int64
	db.Model(&entities.Post{}).Where("title_name = ? AND id != ?", titleName, excludeID).Count(&count)
	return count > 0
}

func (r *postRepo) CalculateCountsForPosts(db *gorm.DB, posts []*entities.Post) error {
	if len(posts) == 0 {
		return nil
	}

	postIDs := make([]uuid.UUID, len(posts))
	for i, post := range posts {
		postIDs[i] = post.ID
	}

	type ClapResult struct {
		PostID    uuid.UUID
		ClapCount int64
	}
	var clapCounts []ClapResult
	if err := db.Model(&entities.UserActivity{}).
		Select("post_id, COALESCE(SUM(count), 0) as clap_count").
		Where("post_id IN ? AND action_type = ?", postIDs, "clap_post").
		Group("post_id").
		Scan(&clapCounts).Error; err != nil {
		return err
	}

	type CommentResult struct {
		PostID       uuid.UUID
		CommentCount int64
	}
	var commentCounts []CommentResult
	if err := db.Model(&entities.Comment{}).
		Select("post_id, COUNT(*) as comment_count").
		Where("post_id IN ?", postIDs).
		Group("post_id").
		Scan(&commentCounts).Error; err != nil {
		return err
	}

	clapMap := make(map[uuid.UUID]int64)
	for _, r := range clapCounts {
		clapMap[r.PostID] = r.ClapCount
	}
	commentMap := make(map[uuid.UUID]int64)
	for _, r := range commentCounts {
		commentMap[r.PostID] = r.CommentCount
	}

	for _, post := range posts {
		post.ClapCount = uint64(clapMap[post.ID])
		post.CommentsCount = uint64(commentMap[post.ID])
	}
	return nil
}
