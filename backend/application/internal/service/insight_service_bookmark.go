package service

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== BOOKMARK METHODS ====================

// CreateBookmark creates or reactivates a bookmark
func (s *InsightService) CreateBookmark(userID uuid.UUID, req *model.CreateBookmarkRequest) (*model.BookmarkResponse, error) {
	// Convert PostID from string to UUID
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, appError.BadRequest("Invalid post ID", err)
	}

	// Check if bookmark already exists
	var bookmark *entities.Bookmark
	err = s.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&bookmark).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Bookmark doesn't exist, create new one
			bookmark = &entities.Bookmark{
				ID:           uuid.NewV4(),
				PostID:       postID,
				UserID:       userID,
				IsBookmarked: true,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			}
			if err = bookmark.Create(s.DB); err != nil {
				return nil, appError.InternalServerError("Failed to create bookmark", err)
			}

			// Load related data
			if err = s.DB.Preload("Post.User").First(bookmark, bookmark.ID).Error; err != nil {
				return nil, appError.InternalServerError("Failed to load bookmark details", err)
			}

			return model.NewBookmarkResponse(bookmark), nil
		} else {
			// Other error
			return nil, appError.InternalServerError("Failed to check existing bookmark", err)
		}
	}

	if bookmark.IsBookmarked {
		// Bookmark already exists and is active
		return model.NewBookmarkResponse(bookmark), nil
	}

	// Bookmark exists but is inactive, reactivate it
	bookmark.IsBookmarked = true
	bookmark.UpdatedAt = time.Now()
	if err = s.DB.Save(bookmark).Error; err != nil {
		return nil, appError.InternalServerError("Failed to reactivate bookmark", err)
	}

	return model.NewBookmarkResponse(bookmark), nil
}

// Unbookmark removes or deactivates a bookmark
func (s *InsightService) Unbookmark(userID uuid.UUID, req *model.CreateBookmarkRequest) error {
	// Convert PostID from string to UUID
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return appError.BadRequest("Invalid post ID", err)
	}

	var bookmark *entities.Bookmark
	err = s.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&bookmark).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Bookmark doesn't exist, nothing to do
			return nil
		} else {
			return appError.InternalServerError("Failed to check bookmark", err)
		}
	}

	if !bookmark.IsBookmarked {
		// Bookmark is already inactive
		return nil
	}

	// Deactivate bookmark
	bookmark.IsBookmarked = false
	bookmark.UpdatedAt = time.Now()
	if err = s.DB.Save(bookmark).Error; err != nil {
		return appError.InternalServerError("Failed to remove bookmark", err)
	}

	return nil
}

// GetUserBookmarks retrieves user's bookmarks with posts
func (s *InsightService) GetUserBookmarks(userID uuid.UUID, req *model.PaginationRequest) ([]*model.PostResponse, string, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Get user information to return username
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		return nil, "", 0, appError.InternalServerError("Failed to fetch user information", err)
	}

	// Count total bookmarks
	var totalCount int64
	if err := s.DBR2.Model(&entities.Bookmark{}).
		Where("user_id = ? AND is_bookmarked = ?", userID, true).
		Count(&totalCount).Error; err != nil {
		return nil, "", 0, appError.InternalServerError("Failed to count bookmarks", err)
	}

	// Get bookmarks with preloaded posts and users
	var bookmarks []*entities.Bookmark
	offset := req.Offset
	if err := s.DBR2.
		Where("user_id = ? AND is_bookmarked = ?", userID, true).
		Preload("Post.User").
		Limit(req.Limit).
		Offset(offset).
		Find(&bookmarks).Error; err != nil {
		return nil, "", 0, appError.InternalServerError("Failed to fetch bookmarks", err)
	}

	// Extract posts from bookmarks
	var posts []*entities.Post
	for _, bookmark := range bookmarks {
		posts = append(posts, &bookmark.Post)
	}

	// Calculate clap_count and comments_count for each post
	s.calculatePostCounts(posts)

	// Convert to response format
	var responses []*model.PostResponse
	for _, post := range posts {
		responses = append(responses, model.NewPostResponse(post))
	}

	return responses, user.Username, totalCount, nil
}

// CheckBookmarkStatus checks if a post is bookmarked by user
func (s *InsightService) CheckBookmarkStatus(userID uuid.UUID, postID uuid.UUID) (bool, error) {
	isBookmarked, err := s.Bookmark.CheckIsBookmarked(s.DBR2, userID, postID)
	if err != nil {
		return false, appError.InternalServerError("Failed to check bookmark status", err)
	}

	return isBookmarked, nil
}

// ==================== HELPER METHODS ====================

// calculatePostCounts calculates clap_count and comments_count for posts
func (s *InsightService) calculatePostCounts(posts []*entities.Post) {
	for _, post := range posts {
		// Calculate clap count (ratings)
		var clapCount int64
		if err := s.DBR2.Model(&entities.Rating{}).Where("post_id = ?", post.ID).Count(&clapCount).Error; err == nil {
			post.ClapCount = uint64(clapCount)
		}

		// Calculate comments count
		var commentsCount int64
		if err := s.DBR2.Model(&entities.Comment{}).Where("post_id = ?", post.ID).Count(&commentsCount).Error; err == nil {
			post.CommentsCount = uint64(commentsCount)
		}

		// TODO: Calculate average rating
		// TODO: Get post content if needed
	}
}
