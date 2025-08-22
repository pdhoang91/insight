package service

import (
	"context"
	"errors"
	"fmt"
	"os"
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
	if req.Content != "" {
		// Process content for saving (convert image URLs to data-image-id references)
		processedContent, err := s.ProcessContentForSaving(req.Content, post.ID)
		if err != nil {
			// Log warning but don't fail the operation
			// TODO: Use proper logger
			processedContent = req.Content // Use original content if processing fails
		}

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
	if len(req.CategoryIDs) > 0 {
		var categories []entities.Category
		for _, categoryIDStr := range req.CategoryIDs {
			categoryID, err := uuid.FromString(categoryIDStr)
			if err != nil {
				tx.Rollback()
				return nil, errors.New("bad request")
			}

			category, err := s.Category.FindByID(tx, categoryID)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					tx.Rollback()
					return nil, errors.New("not found")
				}
				tx.Rollback()
				return nil, errors.New("internal server error")
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
	if req.Content != "" {
		postContent, err := s.PostContent.FindByPostID(tx, post.ID)
		oldContent := ""

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// Create new post content if it doesn't exist
				processedContent, err := s.ProcessContentForSaving(req.Content, post.ID)
				if err != nil {
					// Log warning but don't fail the operation
					processedContent = req.Content
				}

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

			processedContent, err := s.ProcessContentForSaving(req.Content, post.ID)
			if err != nil {
				// Log warning but don't fail the operation
				processedContent = req.Content
			}

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
	if len(req.CategoryIDs) > 0 {
		var categories []entities.Category
		for _, categoryIDStr := range req.CategoryIDs {
			categoryID, err := uuid.FromString(categoryIDStr)
			if err != nil {
				tx.Rollback()
				return nil, errors.New("bad request")
			}

			category, err := s.Category.FindByID(tx, categoryID)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					tx.Rollback()
					return nil, errors.New("not found")
				}
				tx.Rollback()
				return nil, errors.New("internal server error")
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

	// Load relationships for response
	if err := s.DB.Preload("User").Preload("Categories").Preload("Tags").First(post, post.ID).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewPostResponse(post), nil
}

// DeletePost deletes a post by ID
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

	// Delete associated post content
	if err := s.PostContent.DeleteByPostID(tx, id); err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Clear category and tag associations
	if err := tx.Model(post).Association("Categories").Clear(); err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	if err := tx.Model(post).Association("Tags").Clear(); err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Delete the post
	if err := tx.Delete(post).Error; err != nil {
		tx.Rollback()
		return errors.New("internal server error")
	}

	// Delete associated images using V2 system
	// Get post content before deletion to extract image references
	postContent, err := s.PostContent.FindByPostID(s.DB, id)
	if err == nil && postContent != nil && postContent.Content != "" {
		// Delete images referenced in the post content
		if err := s.DeletePostImages(context.Background(), id, userID); err != nil {
			// Log error but don't fail the operation
			// TODO: Use proper logger
		}
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

// ClapPost adds or removes a clap for a post
func (s *InsightService) ClapPost(userID, postID uuid.UUID) (bool, error) {
	// Check if user already clapped
	hasClapped, err := s.HasUserClappedPost(userID, postID)
	if err != nil {
		return false, err
	}

	if hasClapped {
		// Remove clap (unclap)
		err = s.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userID, postID, "clap_post").
			Delete(&entities.UserActivity{}).Error
		if err != nil {
			return false, err
		}
		return false, nil // false means unclapped
	} else {
		// Add clap
		activity := &entities.UserActivity{
			ID:         uuid.NewV4(),
			UserID:     userID,
			PostID:     &postID,
			ActionType: "clap_post",
			CreatedAt:  time.Now(),
		}
		err = s.DB.Create(activity).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped
	}
}

// ClapComment adds or removes a clap for a comment
func (s *InsightService) ClapComment(userID, commentID uuid.UUID) (bool, error) {
	// Check if user already clapped this comment
	var activity entities.UserActivity
	err := s.DB.Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, commentID, "clap_comment").First(&activity).Error

	hasClapped := true
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			hasClapped = false
		} else {
			return false, err
		}
	}

	if hasClapped {
		// Remove clap (unclap)
		err = s.DB.Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, commentID, "clap_comment").
			Delete(&entities.UserActivity{}).Error
		if err != nil {
			return false, err
		}
		return false, nil // false means unclapped
	} else {
		// Add clap
		activity := &entities.UserActivity{
			ID:         uuid.NewV4(),
			UserID:     userID,
			CommentID:  &commentID,
			ActionType: "clap_comment",
			CreatedAt:  time.Now(),
		}
		err = s.DB.Create(activity).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped
	}
}

// ClapReply adds or removes a clap for a reply
func (s *InsightService) ClapReply(userID, replyID uuid.UUID) (bool, error) {
	// Check if user already clapped this reply
	var activity entities.UserActivity
	err := s.DB.Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, replyID, "clap_reply").First(&activity).Error

	hasClapped := true
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			hasClapped = false
		} else {
			return false, err
		}
	}

	if hasClapped {
		// Remove clap (unclap)
		err = s.DB.Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, replyID, "clap_reply").
			Delete(&entities.UserActivity{}).Error
		if err != nil {
			return false, err
		}
		return false, nil // false means unclapped
	} else {
		// Add clap
		activity := &entities.UserActivity{
			ID:         uuid.NewV4(),
			UserID:     userID,
			ReplyID:    &replyID,
			ActionType: "clap_reply",
			CreatedAt:  time.Now(),
		}
		err = s.DB.Create(activity).Error
		if err != nil {
			return false, err
		}
		return true, nil // true means clapped
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

	err := query.Count(&count).Error
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

// SearchPosts searches posts by query
