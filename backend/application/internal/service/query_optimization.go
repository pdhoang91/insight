package service

import (
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== OPTIMIZED QUERY METHODS ====================

// GetPostsWithRelations retrieves posts with all relations preloaded (optimized)
func (s *InsightService) GetPostsWithRelations(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	var posts []*entities.Post
	// Single query with all preloads to avoid N+1
	err := s.DBR2.Preload("User").
		Preload("Categories").
		Preload("Tags").
		Order("created_at DESC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&posts).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count in separate optimized query
	var total int64
	err = s.DBR2.Model(&entities.Post{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to responses
	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, total, nil
}

// GetUserPostsOptimized retrieves user posts with optimized queries
func (s *InsightService) GetUserPostsOptimized(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	var posts []*entities.Post
	// Optimized query with selective preloading
	err := s.DBR2.Preload("Categories").
		Preload("Tags").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&posts).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count for this user
	var total int64
	err = s.DBR2.Model(&entities.Post{}).Where("user_id = ?", userID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to responses
	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, total, nil
}

// GetCommentsWithRepliesOptimized retrieves comments with replies in optimized way
func (s *InsightService) GetCommentsWithRepliesOptimized(postID uuid.UUID, req *dto.PaginationRequest) ([]*dto.CommentResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	var comments []*entities.Comment
	// Single query with all necessary preloads
	err := s.DBR2.Preload("User").
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Preload("User").Order("created_at ASC")
		}).
		Where("post_id = ?", postID).
		Order("created_at DESC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&comments).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	var total int64
	err = s.DBR2.Model(&entities.Comment{}).Where("post_id = ?", postID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to responses
	var responses []*dto.CommentResponse
	for _, comment := range comments {
		responses = append(responses, dto.NewCommentResponse(comment))
	}

	return responses, total, nil
}

// GetPopularPostsOptimized retrieves popular posts with single optimized query
func (s *InsightService) GetPopularPostsOptimized(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 10
	}

	var posts []*entities.Post
	// Single optimized query with all preloads
	err := s.DBR2.Preload("User").
		Preload("Categories").
		Preload("Tags").
		Order("views DESC, created_at DESC").
		Limit(limit).
		Find(&posts).Error
	if err != nil {
		return nil, err
	}

	// Convert to responses
	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, nil
}

// GetCategoriesWithPostCountOptimized retrieves categories with post counts in single query
func (s *InsightService) GetCategoriesWithPostCountOptimized(req *dto.PaginationRequest) ([]dto.CategoryWithCount, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	type CategoryWithPostCount struct {
		entities.Category
		PostCount int64 `json:"post_count"`
	}

	var results []CategoryWithPostCount
	// Single optimized query with JOIN and COUNT
	err := s.DBR2.Table("categories").
		Select("categories.*, COUNT(post_categories.post_id) as post_count").
		Joins("LEFT JOIN post_categories ON categories.id = post_categories.category_id").
		Group("categories.id").
		Order("post_count DESC, categories.name ASC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&results).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	var total int64
	err = s.DBR2.Model(&entities.Category{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to responses
	var responses []dto.CategoryWithCount
	for _, result := range results {
		responses = append(responses, dto.CategoryWithCount{
			CategoryResponse: *dto.NewCategoryResponse(&result.Category),
			PostCount:        result.PostCount,
		})
	}

	return responses, total, nil
}

// GetUserBookmarksOptimized retrieves user bookmarks with optimized preloading
func (s *InsightService) GetUserBookmarksOptimized(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	var bookmarks []*entities.Bookmark
	// Single query with all necessary preloads
	err := s.DBR2.Preload("Post").
		Preload("Post.User").
		Preload("Post.Categories").
		Preload("Post.Tags").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(req.Limit).
		Offset(req.Offset).
		Find(&bookmarks).Error
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	var total int64
	err = s.DBR2.Model(&entities.Bookmark{}).Where("user_id = ?", userID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to post responses
	var responses []*dto.PostResponse
	for _, bookmark := range bookmarks {
		responses = append(responses, dto.NewPostResponse(&bookmark.Post))
	}

	return responses, total, nil
}

// BatchGetPostStats retrieves multiple post statistics in optimized batches
func (s *InsightService) BatchGetPostStats(postIDs []uuid.UUID) (map[uuid.UUID]*dto.PostStats, error) {
	if len(postIDs) == 0 {
		return make(map[uuid.UUID]*dto.PostStats), nil
	}

	// Batch query for clap counts
	var clapResults []struct {
		PostID     uuid.UUID `json:"post_id"`
		TotalClaps int64     `json:"total_claps"`
		ClapCount  int64     `json:"clap_count"`
	}
	err := s.DBR2.Table("claps").
		Select("post_id, SUM(count) as total_claps, COUNT(*) as clap_count").
		Where("post_id IN ?", postIDs).
		Group("post_id").
		Find(&clapResults).Error
	if err != nil {
		return nil, err
	}

	// Batch query for comment counts
	var commentResults []struct {
		PostID       uuid.UUID `json:"post_id"`
		CommentCount int64     `json:"comment_count"`
	}
	err = s.DBR2.Table("comments").
		Select("post_id, COUNT(*) as comment_count").
		Where("post_id IN ?", postIDs).
		Group("post_id").
		Find(&commentResults).Error
	if err != nil {
		return nil, err
	}

	// Batch query for rating averages
	var ratingResults []struct {
		PostID        uuid.UUID `json:"post_id"`
		AverageRating float64   `json:"average_rating"`
		RatingCount   int64     `json:"rating_count"`
	}
	err = s.DBR2.Table("ratings").
		Select("post_id, AVG(score) as average_rating, COUNT(*) as rating_count").
		Where("post_id IN ?", postIDs).
		Group("post_id").
		Find(&ratingResults).Error
	if err != nil {
		return nil, err
	}

	// Combine results
	statsMap := make(map[uuid.UUID]*dto.PostStats)
	for _, postID := range postIDs {
		statsMap[postID] = &dto.PostStats{
			PostID: postID,
		}
	}

	// Fill clap data
	for _, result := range clapResults {
		if stats, exists := statsMap[result.PostID]; exists {
			stats.TotalClaps = result.TotalClaps
			stats.ClapCount = result.ClapCount
		}
	}

	// Fill comment data
	for _, result := range commentResults {
		if stats, exists := statsMap[result.PostID]; exists {
			stats.CommentCount = result.CommentCount
		}
	}

	// Fill rating data
	for _, result := range ratingResults {
		if stats, exists := statsMap[result.PostID]; exists {
			stats.AverageRating = result.AverageRating
			stats.RatingCount = result.RatingCount
		}
	}

	return statsMap, nil
}
