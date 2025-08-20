package service

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
	"github.com/pdhoang91/blog/pkg/image"
	"github.com/pdhoang91/blog/pkg/notification"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== POST METHODS ====================

// CreatePost creates a new post
func (s *InsightService) CreatePost(userID uuid.UUID, req *model.CreatePostRequest) (*model.PostResponse, error) {
	// Start transaction for data consistency
	tx := s.DB.Begin()
	if tx.Error != nil {
		return nil, appError.InternalServerError("Failed to start transaction", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create post
	post := &entities.Post{
		ID:             uuid.NewV4(),
		UserID:         userID,
		Title:          req.Title,
		PreviewContent: req.PreviewContent,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := tx.Create(post).Error; err != nil {
		tx.Rollback()
		return nil, appError.InternalServerError("Failed to create post", err)
	}

	// Handle post content creation using PostContentRepo
	if req.Content != "" {
		postContent := &entities.PostContent{
			ID:        uuid.NewV4(),
			PostID:    post.ID,
			Content:   req.Content,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := postContent.Create(tx); err != nil {
			tx.Rollback()
			return nil, appError.InternalServerError("Failed to create post content", err)
		}
	}

	// Handle category associations using CategoryRepo
	if len(req.CategoryIDs) > 0 {
		var categories []entities.Category
		for _, categoryIDStr := range req.CategoryIDs {
			categoryID, err := uuid.FromString(categoryIDStr)
			if err != nil {
				tx.Rollback()
				return nil, appError.BadRequest("Invalid category ID format", err)
			}

			category, err := s.Category.FindByID(tx, categoryID)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					tx.Rollback()
					return nil, appError.NotFound("Category not found", err)
				}
				tx.Rollback()
				return nil, appError.InternalServerError("Failed to find category", err)
			}
			categories = append(categories, *category)
		}

		// Associate categories with post
		if err := tx.Model(post).Association("Categories").Append(&categories); err != nil {
			tx.Rollback()
			return nil, appError.InternalServerError("Failed to associate categories", err)
		}
	}

	// Handle tag associations using TagRepo
	if len(req.TagNames) > 0 {
		var tags []entities.Tag
		for _, tagName := range req.TagNames {
			// Try to find existing tag
			tag, err := s.Tag.FindByName(tx, tagName)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					// Create new tag if it doesn't exist
					tag = &entities.Tag{
						ID:        uuid.NewV4(),
						Name:      tagName,
						CreatedAt: time.Now(),
						UpdatedAt: time.Now(),
					}
					if err := tag.Create(tx); err != nil {
						tx.Rollback()
						return nil, appError.InternalServerError("Failed to create tag", err)
					}
				} else {
					tx.Rollback()
					return nil, appError.InternalServerError("Failed to find tag", err)
				}
			}
			tags = append(tags, *tag)
		}

		// Associate tags with post
		if err := tx.Model(post).Association("Tags").Append(&tags); err != nil {
			tx.Rollback()
			return nil, appError.InternalServerError("Failed to associate tags", err)
		}
	}

	// Process images in content
	imageProcessor := image.GetDefaultProcessor()
	processedImages, err := imageProcessor.ProcessImagesInContent(req.Content)
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}
	_ = processedImages // Store processed image URLs for future use

	// Send notifications using EventProcessor
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	err = eventProcessor.SendPostNotification(notification.EventTypePostCreated, userID, post.ID, "New post created")
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, appError.InternalServerError("Failed to commit transaction", err)
	}

	// Load relationships for response
	if err := s.DB.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load post relationships", err)
	}

	return model.NewPostResponse(post), nil
}

// ListPosts retrieves all posts with pagination
func (s *InsightService) ListPosts(req *model.PaginationRequest) ([]*model.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	// Use read replica for better performance
	posts, err := s.Post.FindAll(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to get posts", err)
	}

	// Get total count
	total, err := s.Post.Count(s.DBR2)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to count posts", err)
	}

	var responses []*model.PostResponse
	for _, post := range posts {
		responses = append(responses, model.NewPostResponse(post))
	}

	// Ensure we return empty array instead of nil
	if responses == nil {
		responses = []*model.PostResponse{}
	}

	return responses, total, nil
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

	// Increment view count (use write database for this)
	if err := s.DB.Model(post).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error; err != nil {
		// Log error but don't fail the request
		// TODO: Use proper logger
	}

	// Load post content using PostContentRepo
	postContent, err := s.PostContent.FindByPostID(s.DBR2, id)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, appError.InternalServerError("Failed to load post content", err)
	}
	if postContent != nil {
		post.Content = postContent.Content
	}

	// Load categories and tags
	if err := s.DBR2.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load post relationships", err)
	}

	return model.NewPostResponse(post), nil
}

// GetPostByTitleName retrieves a post by title name
func (s *InsightService) GetPostByTitleName(titleName string) (*model.PostResponse, error) {
	// Use read replica for better performance
	post, err := s.Post.FindByTitleName(s.DBR2, titleName)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Post not found", err)
		}
		return nil, appError.InternalServerError("Failed to get post", err)
	}

	// Increment views count
	if err := s.DB.Model(post).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error; err != nil {
		// TODO: Use proper logger
	}

	// Load post content
	postContent, err := s.PostContent.FindByPostID(s.DBR2, post.ID)
	if err == nil && postContent != nil {
		post.Content = postContent.Content
	}

	// Preload relationships
	if err := s.DBR2.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load post relationships", err)
	}

	return model.NewPostResponse(post), nil
}

// UpdatePost updates a post by ID
func (s *InsightService) UpdatePost(userID uuid.UUID, id uuid.UUID, req *model.UpdatePostRequest) (*model.PostResponse, error) {
	// Start transaction for data consistency
	tx := s.DB.Begin()
	if tx.Error != nil {
		return nil, appError.InternalServerError("Failed to start transaction", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	post, err := s.Post.FindByID(tx, id)
	if err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Post not found", err)
		}
		return nil, appError.InternalServerError("Failed to get post", err)
	}

	// Check if user owns the post
	if post.UserID != userID {
		tx.Rollback()
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
	if err := tx.Save(post).Error; err != nil {
		tx.Rollback()
		return nil, appError.InternalServerError("Failed to update post", err)
	}

	// Update post content using PostContentRepo
	if req.Content != "" {
		postContent, err := s.PostContent.FindByPostID(tx, post.ID)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// Create new post content if it doesn't exist
				postContent = &entities.PostContent{
					ID:        uuid.NewV4(),
					PostID:    post.ID,
					Content:   req.Content,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}
				if err := postContent.Create(tx); err != nil {
					tx.Rollback()
					return nil, appError.InternalServerError("Failed to create post content", err)
				}
			} else {
				tx.Rollback()
				return nil, appError.InternalServerError("Failed to find post content", err)
			}
		} else {
			// Update existing post content
			postContent.Content = req.Content
			postContent.UpdatedAt = time.Now()
			if err := postContent.Update(tx); err != nil {
				tx.Rollback()
				return nil, appError.InternalServerError("Failed to update post content", err)
			}
		}
	}

	// Update category associations
	if len(req.CategoryIDs) > 0 {
		var categories []entities.Category
		for _, categoryIDStr := range req.CategoryIDs {
			categoryID, err := uuid.FromString(categoryIDStr)
			if err != nil {
				tx.Rollback()
				return nil, appError.BadRequest("Invalid category ID format", err)
			}

			category, err := s.Category.FindByID(tx, categoryID)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					tx.Rollback()
					return nil, appError.NotFound("Category not found", err)
				}
				tx.Rollback()
				return nil, appError.InternalServerError("Failed to find category", err)
			}
			categories = append(categories, *category)
		}

		// Replace categories
		if err := tx.Model(post).Association("Categories").Replace(&categories); err != nil {
			tx.Rollback()
			return nil, appError.InternalServerError("Failed to update categories", err)
		}
	}

	// Update tag associations
	if len(req.TagNames) > 0 {
		var tags []entities.Tag
		for _, tagName := range req.TagNames {
			// Try to find existing tag
			tag, err := s.Tag.FindByName(tx, tagName)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					// Create new tag if it doesn't exist
					tag = &entities.Tag{
						ID:        uuid.NewV4(),
						Name:      tagName,
						CreatedAt: time.Now(),
						UpdatedAt: time.Now(),
					}
					if err := tag.Create(tx); err != nil {
						tx.Rollback()
						return nil, appError.InternalServerError("Failed to create tag", err)
					}
				} else {
					tx.Rollback()
					return nil, appError.InternalServerError("Failed to find tag", err)
				}
			}
			tags = append(tags, *tag)
		}

		// Replace tags
		if err := tx.Model(post).Association("Tags").Replace(&tags); err != nil {
			tx.Rollback()
			return nil, appError.InternalServerError("Failed to update tags", err)
		}
	}

	// Process images in updated content
	imageProcessor := image.GetDefaultProcessor()
	processedImages, err := imageProcessor.ProcessImagesInContent(req.Content)
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}
	_ = processedImages // Store processed image URLs for future use

	// Send update notifications using EventProcessor
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	err = eventProcessor.SendPostNotification(notification.EventTypePostUpdated, userID, post.ID, "Post updated")
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, appError.InternalServerError("Failed to commit transaction", err)
	}

	// Load relationships for response
	if err := s.DB.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, appError.InternalServerError("Failed to load post relationships", err)
	}

	return model.NewPostResponse(post), nil
}

// DeletePost deletes a post by ID
func (s *InsightService) DeletePost(userID uuid.UUID, id uuid.UUID) error {
	// Start transaction for data consistency
	tx := s.DB.Begin()
	if tx.Error != nil {
		return appError.InternalServerError("Failed to start transaction", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	post, err := s.Post.FindByID(tx, id)
	if err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			return appError.NotFound("Post not found", err)
		}
		return appError.InternalServerError("Failed to get post", err)
	}

	// Check if user owns the post
	if post.UserID != userID {
		tx.Rollback()
		return appError.Forbidden("You can only delete your own posts", nil)
	}

	// Delete associated post content
	if err := s.PostContent.DeleteByPostID(tx, id); err != nil {
		tx.Rollback()
		return appError.InternalServerError("Failed to delete post content", err)
	}

	// Clear category and tag associations
	if err := tx.Model(post).Association("Categories").Clear(); err != nil {
		tx.Rollback()
		return appError.InternalServerError("Failed to clear category associations", err)
	}

	if err := tx.Model(post).Association("Tags").Clear(); err != nil {
		tx.Rollback()
		return appError.InternalServerError("Failed to clear tag associations", err)
	}

	// Delete the post
	if err := tx.Delete(post).Error; err != nil {
		tx.Rollback()
		return appError.InternalServerError("Failed to delete post", err)
	}

	// Delete associated images from S3
	// Get post content before deletion to extract image URLs
	postContent, err := s.PostContent.FindByPostID(s.DB, id)
	if err == nil && postContent != nil && postContent.Content != "" {
		imageProcessor := image.GetDefaultProcessor()
		// Extract image URLs from content and delete them
		// This is a simplified implementation - in practice you'd parse the content for image URLs
		// TODO: Implement proper image URL extraction from content
		_ = imageProcessor // Avoid unused variable error for now
	}

	// Send delete notifications using EventProcessor
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	err = eventProcessor.SendPostNotification(notification.EventTypePostDeleted, userID, id, "Post deleted")
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return appError.InternalServerError("Failed to commit transaction", err)
	}

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

// GetRecentPosts retrieves recent posts (alias for GetLatestPosts)
func (s *InsightService) GetRecentPosts(limit int) ([]*model.PostResponse, error) {
	return s.GetLatestPosts(limit)
}

// GetTopPosts retrieves top posts (alias for GetPopularPosts)
func (s *InsightService) GetTopPosts(limit int) ([]*model.PostResponse, error) {
	return s.GetPopularPosts(limit)
}
