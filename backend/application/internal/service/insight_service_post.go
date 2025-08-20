package service

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== POST METHODS ====================

// CreatePost creates a new post
func (s *InsightService) CreatePost(userID uuid.UUID, req *model.CreatePostRequest) (*model.PostResponse, error) {
	// Create post
	post := &entities.Post{
		ID:             uuid.NewV4(),
		UserID:         userID,
		Title:          req.Title,
		PreviewContent: req.PreviewContent,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := post.Create(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to create post", err)
	}

	// TODO: Handle post content creation using PostContentRepo
	// TODO: Handle category associations using CategoryRepo
	// TODO: Handle tag associations using TagRepo
	// TODO: Process images using ImgCvt
	// TODO: Send notifications using EventProcessor

	return model.NewPostResponse(post), nil
}

// ListPosts retrieves all posts with pagination
func (s *InsightService) ListPosts(req *model.PaginationRequest) ([]*model.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	// Use read replica for better performance
	posts, err := s.Post.List(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to get posts", err)
	}

	var responses []*model.PostResponse
	for _, post := range posts {
		responses = append(responses, model.NewPostResponse(post))
	}

	return responses, int64(len(responses)), nil
}

// GetPost retrieves a post by ID
func (s *InsightService) GetPost(id uuid.UUID) (*model.PostResponse, error) {
	// Use read replica for better performance
	post, err := s.Post.FindByID(s.DBR2, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Post not found", err)
		}
		return nil, appError.InternalServerError("Failed to get post", err)
	}

	// TODO: Increment view count
	// TODO: Load post content using PostContentRepo
	// TODO: Load categories and tags

	return model.NewPostResponse(post), nil
}

// UpdatePost updates a post by ID
func (s *InsightService) UpdatePost(userID uuid.UUID, id uuid.UUID, req *model.UpdatePostRequest) (*model.PostResponse, error) {
	post, err := s.Post.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Post not found", err)
		}
		return nil, appError.InternalServerError("Failed to get post", err)
	}

	// Check if user owns the post
	if post.UserID != userID {
		return nil, appError.Forbidden("You can only update your own posts", nil)
	}

	// Update fields
	if req.Title != "" {
		post.Title = req.Title
	}
	if req.PreviewContent != "" {
		post.PreviewContent = req.PreviewContent
	}

	post.UpdatedAt = time.Now()
	if err := post.Update(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to update post", err)
	}

	// TODO: Update post content using PostContentRepo
	// TODO: Update category associations
	// TODO: Update tag associations
	// TODO: Process images using ImgCvt
	// TODO: Send update notifications using EventProcessor

	return model.NewPostResponse(post), nil
}

// DeletePost deletes a post by ID
func (s *InsightService) DeletePost(userID uuid.UUID, id uuid.UUID) error {
	post, err := s.Post.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appError.NotFound("Post not found", err)
		}
		return appError.InternalServerError("Failed to get post", err)
	}

	// Check if user owns the post
	if post.UserID != userID {
		return appError.Forbidden("You can only delete your own posts", nil)
	}

	if err := s.Post.DeleteByID(s.DB, id); err != nil {
		return appError.InternalServerError("Failed to delete post", err)
	}

	// TODO: Delete associated post content
	// TODO: Delete associated images using S3
	// TODO: Send delete notifications using EventProcessor

	return nil
}

// GetUserPosts retrieves posts by user ID
func (s *InsightService) GetUserPosts(userID uuid.UUID, req *model.PaginationRequest) ([]*model.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	// Use read replica for better performance
	posts, err := s.Post.FindByUserID(s.DBR2, userID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to get user posts", err)
	}

	var responses []*model.PostResponse
	for _, post := range posts {
		responses = append(responses, model.NewPostResponse(post))
	}

	return responses, int64(len(responses)), nil
}

// SearchPosts searches for posts
func (s *InsightService) SearchPosts(query string, req *model.PaginationRequest) ([]*model.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	// Use read replica for search queries
	posts, err := s.Post.Search(s.DBR2, query, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to search posts", err)
	}

	var responses []*model.PostResponse
	for _, post := range posts {
		responses = append(responses, model.NewPostResponse(post))
	}

	// TODO: Log search queries for analytics
	// TODO: Use external search service if available

	return responses, int64(len(responses)), nil
}

// GetAllPosts retrieves all posts (admin only)
func (s *InsightService) GetAllPosts(req *model.PaginationRequest) ([]*model.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 50
	}

	posts, err := s.Post.List(s.DB, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to get posts", err)
	}

	var responses []*model.PostResponse
	for _, post := range posts {
		responses = append(responses, model.NewPostResponse(post))
	}

	return responses, int64(len(responses)), nil
}

// SearchAll searches across all content
func (s *InsightService) SearchAll(query string) (interface{}, error) {
	// TODO: Implement comprehensive search across posts, users, categories, tags
	// TODO: Use external search service if available
	// TODO: Return structured search results

	return map[string]interface{}{
		"message": "Search all not implemented yet",
		"query":   query,
	}, nil
}

// GetLatestPosts retrieves latest posts
func (s *InsightService) GetLatestPosts(limit int) ([]*model.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	// Use read replica for better performance
	posts, err := s.Post.List(s.DBR2, limit, 0)
	if err != nil {
		return nil, appError.InternalServerError("Failed to get latest posts", err)
	}

	var responses []*model.PostResponse
	for _, post := range posts {
		responses = append(responses, model.NewPostResponse(post))
	}

	return responses, nil
}

// GetPopularPosts retrieves popular posts based on engagement
func (s *InsightService) GetPopularPosts(limit int) ([]*model.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	// Use read replica for better performance
	posts, err := s.Post.GetPopular(s.DBR2, limit)
	if err != nil {
		return nil, appError.InternalServerError("Failed to get popular posts", err)
	}

	var responses []*model.PostResponse
	for _, post := range posts {
		responses = append(responses, model.NewPostResponse(post))
	}

	return responses, nil
}
