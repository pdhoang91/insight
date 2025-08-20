package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/dto"
	
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== BOOKMARK METHODS ====================

// CreateBookmark creates or reactivates a bookmark
func (s *InsightService) CreateBookmark(userID uuid.UUID, req *dto.CreateBookmarkRequest) (*dto.BookmarkResponse, error) {
	// Convert PostID from string to UUID
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, errors.New("bad request")
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
				return nil, errors.New("internal server error")
			}

			// Load related data
			if err = s.DB.Preload("Post.User").First(bookmark, bookmark.ID).Error; err != nil {
				return nil, errors.New("internal server error")
			}

			return dto.NewBookmarkResponse(bookmark), nil
		} else {
			// Other error
			return nil, errors.New("internal server error")
		}
	}

	if bookmark.IsBookmarked {
		// Bookmark already exists and is active
		return dto.NewBookmarkResponse(bookmark), nil
	}

	// Bookmark exists but is inactive, reactivate it
	bookmark.IsBookmarked = true
	bookmark.UpdatedAt = time.Now()
	if err = s.DB.Save(bookmark).Error; err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewBookmarkResponse(bookmark), nil
}

// Unbookmark removes or deactivates a bookmark
func (s *InsightService) Unbookmark(userID uuid.UUID, req *dto.CreateBookmarkRequest) error {
	// Convert PostID from string to UUID
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return errors.New("bad request")
	}

	var bookmark *entities.Bookmark
	err = s.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&bookmark).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Bookmark doesn't exist, nothing to do
			return nil
		} else {
			return errors.New("internal server error")
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
		return errors.New("internal server error")
	}

	return nil
}

// GetUserBookmarks retrieves user's bookmarks with posts
func (s *InsightService) GetUserBookmarks(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, string, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Get user information to return username
	user, err := s.User.FindByID(s.DB, userID)
	if err != nil {
		return nil, "", 0, errors.New("internal server error")
	}

	// Count total bookmarks
	var totalCount int64
	if err := s.DBR2.Model(&entities.Bookmark{}).
		Where("user_id = ? AND is_bookmarked = ?", userID, true).
		Count(&totalCount).Error; err != nil {
		return nil, "", 0, errors.New("internal server error")
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
		return nil, "", 0, errors.New("internal server error")
	}

	// Extract posts from bookmarks
	var posts []*entities.Post
	for _, bookmark := range bookmarks {
		posts = append(posts, &bookmark.Post)
	}

	// Calculate clap_count and comments_count for each post
	s.calculatePostCounts(posts)

	// Convert to response format
	var responses []*dto.PostResponse
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	return responses, user.Username, totalCount, nil
}

// CheckBookmarkStatus checks if a post is bookmarked by user
func (s *InsightService) CheckBookmarkStatus(userID uuid.UUID, postID uuid.UUID) (bool, error) {
	isBookmarked, err := s.Bookmark.CheckIsBookmarked(s.DBR2, userID, postID)
	if err != nil {
		return false, errors.New("internal server error")
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
