package service

import (
	"context"
	"errors"
	"fmt"
	"os"
	"regexp"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"

	"github.com/pdhoang91/blog/pkg/notification"
	"github.com/pdhoang91/blog/pkg/utils"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== POST METHODS ====================

// CreatePost creates a new post
func (s *InsightService) CreatePost(userID uuid.UUID, req *dto.CreatePostRequest) (*dto.PostResponse, error) {
	// Start transaction for data consistency
	tx := s.DB.Begin()
	if tx.Error != nil {
		return nil, errors.New("internal server error")
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Generate image_title if not provided
	imageTitle := ""
	if imageTitle == "" {
		feURL := os.Getenv("BASE_FE_URL")
		if feURL == "" {
			feURL = "http://localhost:3000" // fallback
		}
		imageTitle = feURL + "/images/insight.jpg"
	}

	// Generate title_name (slug) from title
	titleName := utils.CreateSlug(req.Title)

	// Ensure unique title_name
	var existingPost entities.Post
	if err := s.DB.Where("title_name = ?", titleName).First(&existingPost).Error; err == nil {
		// Title name already exists, add unique prefix
		uniquePrefix := utils.GetUniquePrefix()
		titleName = fmt.Sprintf("%s-%s", titleName, uniquePrefix)
	}

	// Generate preview_content from content (first 55 words)
	previewContent := req.PreviewContent
	if previewContent == "" && req.Content != "" {
		previewContent = utils.ExtractPreviewContent(req.Content, 55)
	}

	// Create post
	post := &entities.Post{
		ID:             uuid.NewV4(),
		UserID:         userID,
		Title:          req.Title,
		ImageTitle:     imageTitle,
		TitleName:      titleName,
		PreviewContent: previewContent,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := tx.Create(post).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("internal server error")
	}

	// Handle post content creation using PostContentRepo
	var processedContent string
	if req.Content != "" {
		// First, just convert URLs to data-image-id without creating references yet
		processedContent = s.ProcessContentForSavingWithoutReferences(req.Content)

		postContent := &entities.PostContent{
			ID:        uuid.NewV4(),
			PostID:    post.ID,
			Content:   processedContent,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := postContent.Create(tx); err != nil {
			tx.Rollback()
			return nil, errors.New("internal server error")
		}
	}

	// Handle category associations using CategoryRepo
	if len(req.CategoryNames) > 0 {
		var categories []entities.Category
		for _, categoryName := range req.CategoryNames {
			// Try to find existing category by name
			category, err := s.Category.FindByName(tx, categoryName)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					// Create new category if it doesn't exist
					category = &entities.Category{
						ID:        uuid.NewV4(),
						Name:      categoryName,
						CreatedAt: time.Now(),
						UpdatedAt: time.Now(),
					}
					if err := category.Create(tx); err != nil {
						tx.Rollback()
						return nil, errors.New("internal server error")
					}
				} else {
					tx.Rollback()
					return nil, errors.New("internal server error")
				}
			}
			categories = append(categories, *category)
		}

		// Associate categories with post
		if err := tx.Model(post).Association("Categories").Append(&categories); err != nil {
			tx.Rollback()
			return nil, errors.New("internal server error")
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
						return nil, errors.New("internal server error")
					}
				} else {
					tx.Rollback()
					return nil, errors.New("internal server error")
				}
			}
			tags = append(tags, *tag)
		}

		// Associate tags with post
		if err := tx.Model(post).Association("Tags").Append(&tags); err != nil {
			tx.Rollback()
			return nil, errors.New("internal server error")
		}
	}

	// Process images in content using V2 system
	// The content processing is now handled by Storage Manager in ProcessContentForSaving above
	// No additional processing needed here

	// Send notifications using EventProcessor
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	notifyErr := eventProcessor.SendPostNotification(notification.EventTypePostCreated, userID, post.ID, "New post created")
	if notifyErr != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, errors.New("internal server error")
	}

	// After successful commit, create image references
	if processedContent != "" {
		if err := s.CreateImageReferencesFromContent(context.Background(), post.ID, processedContent); err != nil {
			// Log error but don't fail the operation since post is already created
			// TODO: Use proper logger
		}
	}

	// Load relationships for response
	if err := s.DB.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewPostResponse(post), nil
}

// ListPosts retrieves all posts with pagination
func (s *InsightService) ListPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	// Use read replica for better performance
	posts, err := s.Post.FindAll(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get total count
	total, err := s.Post.Count(s.DBR2)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Calculate counts for all posts efficiently
	if err := entities.CalculateCountsForPosts(s.DBR2, posts); err != nil {
		// Log error but don't fail the request
		// TODO: Use proper logger
	}

	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	// Ensure we return empty array instead of nil
	if responses == nil {
		responses = []*dto.PostResponse{}
	}

	return responses, total, nil
}

// GetPost retrieves a post by ID
func (s *InsightService) GetPost(id uuid.UUID) (*dto.PostResponse, error) {
	// Use read replica for better performance
	post, err := s.Post.FindByID(s.DBR2, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Increment view count (use write database for this)
	if err := s.DB.Model(post).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error; err != nil {
		// Log error but don't fail the request
		// TODO: Use proper logger
	}

	// Load post content using PostContentRepo
	postContent, err := s.PostContent.FindByPostID(s.DBR2, id)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, errors.New("internal server error")
	}
	if postContent != nil {
		// Process content for display (convert data-image-id to URLs)
		post.Content = s.ProcessContentForDisplay(postContent.Content)
	}

	// Load categories and tags
	if err := s.DBR2.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	// Calculate clap_count and comments_count
	if err := post.CalculateCounts(s.DBR2); err != nil {
		// Log error but don't fail the request
		// TODO: Use proper logger
	}

	return dto.NewPostResponse(post), nil
}

// GetPostByTitleName retrieves a post by title name
func (s *InsightService) GetPostByTitleName(titleName string) (*dto.PostResponse, error) {
	// Use read replica for better performance
	post, err := s.Post.FindByTitleName(s.DBR2, titleName)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Increment views count
	if err := s.DB.Model(post).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error; err != nil {
		// TODO: Use proper logger
	}

	// Load post content
	postContent, err := s.PostContent.FindByPostID(s.DBR2, post.ID)
	if err == nil && postContent != nil {
		// Process content for display (convert data-image-id to URLs)
		post.Content = s.ProcessContentForDisplay(postContent.Content)
	}

	// Preload relationships
	if err := s.DBR2.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	// Calculate clap_count and comments_count
	if err := post.CalculateCounts(s.DBR2); err != nil {
		// Log error but don't fail the request
		// TODO: Use proper logger
	}

	return dto.NewPostResponse(post), nil
}

// GetPostEntity returns the raw post entity (for internal use)
func (s *InsightService) GetPostEntity(id uuid.UUID) (*entities.Post, error) {
	post, err := s.Post.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}
	return post, nil
}

// UpdatePost updates a post by ID
func (s *InsightService) UpdatePost(userID uuid.UUID, id uuid.UUID, req *dto.UpdatePostRequest) (*dto.PostResponse, error) {
	// Start transaction for data consistency
	tx := s.DB.Begin()
	if tx.Error != nil {
		return nil, errors.New("internal server error")
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
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Check if user owns the post
	if post.UserID != userID {
		tx.Rollback()
		return nil, errors.New("forbidden")
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
		return nil, errors.New("internal server error")
	}

	// Update post content using PostContentRepo with V2 image processing
	var oldContent string
	if req.Content != "" {
		postContent, err := s.PostContent.FindByPostID(tx, post.ID)
		oldContent = ""

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// Create new post content if it doesn't exist
				processedContent := s.ProcessContentForSavingWithoutReferences(req.Content)

				postContent = &entities.PostContent{
					ID:        uuid.NewV4(),
					PostID:    post.ID,
					Content:   processedContent,
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}
				if err := postContent.Create(tx); err != nil {
					tx.Rollback()
					return nil, errors.New("internal server error")
				}
			} else {
				tx.Rollback()
				return nil, errors.New("internal server error")
			}
		} else {
			// Update existing post content with cleanup
			oldContent = postContent.Content

			processedContent := s.ProcessContentForSavingWithoutReferences(req.Content)

			postContent.Content = processedContent
			postContent.UpdatedAt = time.Now()
			if err := postContent.Update(tx); err != nil {
				tx.Rollback()
				return nil, errors.New("internal server error")
			}

			// Update image references after successful content update
			if oldContent != processedContent {
				if err := s.UpdateImageReferences(context.Background(), post.ID, oldContent, processedContent); err != nil {
					// Log error but don't fail the operation
					// TODO: Use proper logger
				}
			}
		}
	}

	// Update category associations
	if len(req.CategoryNames) > 0 {
		var categories []entities.Category
		for _, categoryName := range req.CategoryNames {
			// Try to find existing category by name
			category, err := s.Category.FindByName(tx, categoryName)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					// Create new category if it doesn't exist
					category = &entities.Category{
						ID:        uuid.NewV4(),
						Name:      categoryName,
						CreatedAt: time.Now(),
						UpdatedAt: time.Now(),
					}
					if err := category.Create(tx); err != nil {
						tx.Rollback()
						return nil, errors.New("internal server error")
					}
				} else {
					tx.Rollback()
					return nil, errors.New("internal server error")
				}
			}
			categories = append(categories, *category)
		}

		// Replace categories
		if err := tx.Model(post).Association("Categories").Replace(&categories); err != nil {
			tx.Rollback()
			return nil, errors.New("internal server error")
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
						return nil, errors.New("internal server error")
					}
				} else {
					tx.Rollback()
					return nil, errors.New("internal server error")
				}
			}
			tags = append(tags, *tag)
		}

		// Replace tags
		if err := tx.Model(post).Association("Tags").Replace(&tags); err != nil {
			tx.Rollback()
			return nil, errors.New("internal server error")
		}
	}

	// Process images in updated content using V2 system
	// The content processing is now handled by Storage Manager in ProcessContentForSaving
	// No additional processing needed here

	// Send update notifications using EventProcessor
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	err = eventProcessor.SendPostNotification(notification.EventTypePostUpdated, userID, post.ID, "Post updated")
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, errors.New("internal server error")
	}

	// After successful commit, update image references if content was changed
	if req.Content != "" {
		processedContent := s.ProcessContentForSavingWithoutReferences(req.Content)
		if err := s.UpdateImageReferences(context.Background(), post.ID, oldContent, processedContent); err != nil {
			// Log error but don't fail the operation since post is already updated
			// TODO: Use proper logger
		}
	}

	// Load relationships for response
	if err := s.DB.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewPostResponse(post), nil
}

// DeletePost soft deletes a post by ID
func (s *InsightService) DeletePost(userID uuid.UUID, id uuid.UUID) error {
	// Start transaction for data consistency
	tx := s.DB.Begin()
	if tx.Error != nil {
		return errors.New("internal server error")
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
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	// Check if user owns the post
	if post.UserID != userID {
		tx.Rollback()
		return errors.New("forbidden")
	}

	// Soft delete the post (GORM will automatically set deleted_at)
	if err := tx.Delete(post).Error; err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Soft delete associated comments
	if err := tx.Where("post_id = ?", id).Delete(&entities.Comment{}).Error; err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Soft delete associated replies
	if err := tx.Where("post_id = ?", id).Delete(&entities.Reply{}).Error; err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Soft delete associated post content
	if err := tx.Where("post_id = ?", id).Delete(&entities.PostContent{}).Error; err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Note: We keep category and tag associations as they are many-to-many relationships
	// and don't need to be deleted. They will be filtered out when querying posts.

	// Send delete notifications using EventProcessor
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	err = eventProcessor.SendPostNotification(notification.EventTypePostDeleted, userID, id, "Post deleted")
	if err != nil {
		// Log error but don't fail the operation
		// TODO: Use proper logger
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return errors.New("internal server error")
	}

	return nil
}

// DeletePostImages deletes all images referenced in a post
func (s *InsightService) DeletePostImages(ctx context.Context, postID uuid.UUID, userID uuid.UUID) error {
	// Get storage manager
	manager := GetStorageManager()
	if manager == nil {
		return fmt.Errorf("storage manager not initialized")
	}

	// Find all image references for this post
	var imageRefs []entities.ImageReference
	if err := s.DB.Where("post_id = ?", postID).Find(&imageRefs).Error; err != nil {
		return fmt.Errorf("failed to find image references: %w", err)
	}

	// Delete each referenced image
	for _, ref := range imageRefs {
		// Verify the image belongs to the user before deleting
		if err := s.DeleteImageV2(ctx, ref.ImageID.String(), userID); err != nil {
			// Log error but continue with other images
			// TODO: Use proper logger
		}
	}

	return nil
}

// GetUserPosts retrieves posts by user ID
func (s *InsightService) GetUserPosts(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	// Use read replica for better performance
	posts, err := s.Post.FindByUserID(s.DBR2, userID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, int64(len(responses)), nil
}

// SearchPosts searches for posts
func (s *InsightService) SearchPosts(query string, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	// Use read replica for search queries
	posts, err := s.Post.Search(s.DBR2, query, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	// TODO: Log search queries for analytics
	// TODO: Use external search service if available

	return responses, int64(len(responses)), nil
}

// GetAllPosts retrieves all posts (admin only)
func (s *InsightService) GetAllPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 50
	}

	posts, err := s.Post.List(s.DB, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
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
func (s *InsightService) GetLatestPosts(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	// Use read replica for better performance
	posts, err := s.Post.List(s.DBR2, limit, 0)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, nil
}

// GetPopularPosts retrieves popular posts based on engagement
func (s *InsightService) GetPopularPosts(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	// Use read replica for better performance
	posts, err := s.Post.GetPopular(s.DBR2, limit)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, nil
}

// GetRecentPosts retrieves recent posts (alias for GetLatestPosts)
func (s *InsightService) GetRecentPosts(limit int) ([]*dto.PostResponse, error) {
	return s.GetLatestPosts(limit)
}

// GetTopPosts retrieves top posts (alias for GetPopularPosts)
func (s *InsightService) GetTopPosts(limit int) ([]*dto.PostResponse, error) {
	return s.GetPopularPosts(limit)
}

// GetPostsByCategory retrieves posts by category name
func (s *InsightService) GetPostsByCategory(categoryName string, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Find category by name first
	category, err := s.Category.FindByName(s.DBR2, categoryName)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, 0, errors.New("not found")
		}
		return nil, 0, errors.New("internal server error")
	}

	// Get posts by category ID
	posts, err := s.Post.FindByCategory(s.DBR2, category.ID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get total count for this category
	total, err := s.Post.CountByCategory(s.DBR2, category.ID)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	// Ensure we return empty array instead of nil
	if responses == nil {
		responses = []*dto.PostResponse{}
	}

	return responses, total, nil
}

// HasUserClappedPost checks if a user has clapped a specific post
func (s *InsightService) HasUserClappedPost(userID, postID uuid.UUID) (bool, error) {
	var activity entities.UserActivity
	err := s.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userID, postID, "clap_post").First(&activity).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// ClapPost adds a clap for a post (supports multiple claps per user)
func (s *InsightService) ClapPost(userID, postID uuid.UUID) (bool, error) {
	// Check if user already has activity for this post
	var existingActivity entities.UserActivity
	err := s.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userID, postID, "clap_post").
		First(&existingActivity).Error

	if err != nil && err != gorm.ErrRecordNotFound {
		return false, err
	}

	if err == gorm.ErrRecordNotFound {
		// Create new activity with count = 1
		activity := &entities.UserActivity{
			ID:         uuid.NewV4(),
			UserID:     userID,
			PostID:     &postID,
			ActionType: "clap_post",
			Count:      1,
			CreatedAt:  time.Now(),
		}
		err = s.DB.Create(activity).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped
	} else {
		// Increment existing count
		err = s.DB.Model(&existingActivity).
			Update("count", gorm.Expr("count + ?", 1)).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped (incremented)
	}
}

// ClapComment adds a clap for a comment (supports multiple claps per user)
func (s *InsightService) ClapComment(userID, commentID uuid.UUID) (bool, error) {
	// Check if user already has activity for this comment
	var existingActivity entities.UserActivity
	err := s.DB.Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, commentID, "clap_comment").
		First(&existingActivity).Error

	if err != nil && err != gorm.ErrRecordNotFound {
		return false, err
	}

	if err == gorm.ErrRecordNotFound {
		// Create new activity with count = 1
		activity := &entities.UserActivity{
			ID:         uuid.NewV4(),
			UserID:     userID,
			CommentID:  &commentID,
			ActionType: "clap_comment",
			Count:      1,
			CreatedAt:  time.Now(),
		}
		err = s.DB.Create(activity).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped
	} else {
		// Increment existing count
		err = s.DB.Model(&existingActivity).
			Update("count", gorm.Expr("count + ?", 1)).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped (incremented)
	}
}

// ClapReply adds a clap for a reply (supports multiple claps per user)
func (s *InsightService) ClapReply(userID, replyID uuid.UUID) (bool, error) {
	// Check if user already has activity for this reply
	var existingActivity entities.UserActivity
	err := s.DB.Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, replyID, "clap_reply").
		First(&existingActivity).Error

	if err != nil && err != gorm.ErrRecordNotFound {
		return false, err
	}

	if err == gorm.ErrRecordNotFound {
		// Create new activity with count = 1
		activity := &entities.UserActivity{
			ID:         uuid.NewV4(),
			UserID:     userID,
			ReplyID:    &replyID,
			ActionType: "clap_reply",
			Count:      1,
			CreatedAt:  time.Now(),
		}
		err = s.DB.Create(activity).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped
	} else {
		// Increment existing count
		err = s.DB.Model(&existingActivity).
			Update("count", gorm.Expr("count + ?", 1)).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped (incremented)
	}
}

// GetClapsCount returns clap count for post/comment/reply
func (s *InsightService) GetClapsCount(itemType string, itemID uuid.UUID) (int64, error) {
	var count int64
	var actionType string
	var query *gorm.DB

	switch itemType {
	case "post":
		actionType = "clap_post"
		query = s.DB.Model(&entities.UserActivity{}).Where("post_id = ? AND action_type = ?", itemID, actionType)
	case "comment":
		actionType = "clap_comment"
		query = s.DB.Model(&entities.UserActivity{}).Where("comment_id = ? AND action_type = ?", itemID, actionType)
	case "reply":
		actionType = "clap_reply"
		query = s.DB.Model(&entities.UserActivity{}).Where("reply_id = ? AND action_type = ?", itemID, actionType)
	default:
		return 0, fmt.Errorf("invalid item type: %s", itemType)
	}

	// Use SUM(count) instead of COUNT(*) to support multiple claps per user
	err := query.Select("COALESCE(SUM(count), 0)").Row().Scan(&count)
	return count, err
}

// GetPostIDFromComment gets post ID from comment ID
func (s *InsightService) GetPostIDFromComment(commentID uuid.UUID) (*uuid.UUID, error) {
	var comment entities.Comment
	err := s.DB.Select("post_id").Where("id = ?", commentID).First(&comment).Error
	if err != nil {
		return nil, err
	}
	return &comment.PostID, nil
}

// HasUserClapped checks if user has clapped an item
func (s *InsightService) HasUserClapped(userID uuid.UUID, itemType string, itemID uuid.UUID) (bool, error) {
	var count int64
	var actionType string
	var query *gorm.DB

	switch itemType {
	case "post":
		actionType = "clap_post"
		query = s.DB.Model(&entities.UserActivity{}).Where("user_id = ? AND post_id = ? AND action_type = ?", userID, itemID, actionType)
	case "comment":
		actionType = "clap_comment"
		query = s.DB.Model(&entities.UserActivity{}).Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, itemID, actionType)
	case "reply":
		actionType = "clap_reply"
		query = s.DB.Model(&entities.UserActivity{}).Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, itemID, actionType)
	default:
		return false, fmt.Errorf("invalid item type: %s", itemType)
	}

	err := query.Count(&count).Error
	return count > 0, err
}

// ProcessContentForSavingWithoutReferences converts image URLs to data-image-id without creating references
func (s *InsightService) ProcessContentForSavingWithoutReferences(content string) string {
	// Find all image URLs in content and replace with data-image-id
	re := regexp.MustCompile(`src=['"]([^'"]*\/images\/v2\/([^'"\/]+))['"]`)

	processedContent := re.ReplaceAllStringFunc(content, func(match string) string {
		// Extract image ID from URL
		matches := re.FindStringSubmatch(match)
		if len(matches) < 3 {
			return match
		}

		imageID := matches[2]
		return fmt.Sprintf(`data-image-id="%s"`, imageID)
	})

	return processedContent
}

// CreateImageReferencesFromContent creates image references after post is committed
func (s *InsightService) CreateImageReferencesFromContent(ctx context.Context, postID uuid.UUID, content string) error {
	// Extract image IDs from content
	re := regexp.MustCompile(`data-image-id=['"]([^'"]+)['"]`)
	matches := re.FindAllStringSubmatch(content, -1)

	for _, match := range matches {
		if len(match) > 1 {
			imageID := match[1]
			if err := s.createImageReference(imageID, postID, "content"); err != nil {
				// Log error but continue with other images
				// TODO: Use proper logger
				fmt.Printf("Warning: failed to create image reference %s: %v\n", imageID, err)
			}
		}
	}

	return nil
}

// createImageReference creates a single image reference
func (s *InsightService) createImageReference(imageID string, postID uuid.UUID, refType string) error {
	id, err := uuid.FromString(imageID)
	if err != nil {
		return err
	}

	// Check if reference already exists
	var existing entities.ImageReference
	err = s.DB.Where("image_id = ? AND post_id = ? AND ref_type = ?", id, postID, refType).First(&existing).Error
	if err == nil {
		return nil // Already exists
	}
	if err != gorm.ErrRecordNotFound {
		return err // Some other error
	}

	// Create new reference
	ref := &entities.ImageReference{
		ID:        uuid.NewV4(),
		ImageID:   id,
		PostID:    postID,
		RefType:   refType,
		CreatedAt: time.Now(),
	}

	return s.DB.Create(ref).Error
}

// SearchPosts searches posts by query
