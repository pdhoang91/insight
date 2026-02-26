package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// CreateBookmark creates or reactivates a bookmark
func (s *InsightService) CreateBookmark(userID uuid.UUID, req *dto.CreateBookmarkRequest) (*dto.BookmarkResponse, error) {
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return nil, apperror.NewBadRequest("invalid post ID")
	}

	bookmark, err := s.BookmarkRepo.FindByUserAndPost(userID, postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			bookmark = &entities.Bookmark{
				ID: uuid.NewV4(), PostID: postID, UserID: userID,
				IsBookmarked: true, CreatedAt: time.Now(), UpdatedAt: time.Now(),
			}
			if err := s.BookmarkRepo.Create(bookmark); err != nil {
				return nil, apperror.NewInternal("failed to create bookmark", err)
			}
			bookmark, err = s.BookmarkRepo.FindByIDWithPost(bookmark.ID)
			if err != nil {
				return nil, apperror.NewInternal("failed to load bookmark", err)
			}
			return dto.NewBookmarkResponse(bookmark), nil
		}
		return nil, apperror.NewInternal("failed to check bookmark", err)
	}

	if bookmark.IsBookmarked {
		return dto.NewBookmarkResponse(bookmark), nil
	}

	bookmark.IsBookmarked = true
	bookmark.UpdatedAt = time.Now()
	if err := s.BookmarkRepo.Save(bookmark); err != nil {
		return nil, apperror.NewInternal("failed to reactivate bookmark", err)
	}
	return dto.NewBookmarkResponse(bookmark), nil
}

// Unbookmark removes or deactivates a bookmark
func (s *InsightService) Unbookmark(userID uuid.UUID, req *dto.CreateBookmarkRequest) error {
	postID, err := uuid.FromString(req.PostID)
	if err != nil {
		return apperror.NewBadRequest("invalid post ID")
	}

	bookmark, err := s.BookmarkRepo.FindByUserAndPost(userID, postID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return apperror.NewInternal("failed to find bookmark", err)
	}

	if !bookmark.IsBookmarked {
		return nil
	}

	bookmark.IsBookmarked = false
	bookmark.UpdatedAt = time.Now()
	if err := s.BookmarkRepo.Save(bookmark); err != nil {
		return apperror.NewInternal("failed to deactivate bookmark", err)
	}
	return nil
}

// GetUserBookmarks retrieves user's bookmarks with posts
func (s *InsightService) GetUserBookmarks(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, string, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	user, err := s.UserRepo.FindByID(userID)
	if err != nil {
		return nil, "", 0, apperror.NewInternal("failed to find user", err)
	}

	totalCount, err := s.BookmarkRepo.CountByUser(userID)
	if err != nil {
		return nil, "", 0, apperror.NewInternal("failed to count bookmarks", err)
	}

	bookmarks, err := s.BookmarkRepo.FindByUserID(userID, req.Limit, req.Offset)
	if err != nil {
		return nil, "", 0, apperror.NewInternal("failed to get bookmarks", err)
	}

	var posts []*entities.Post
	for _, bookmark := range bookmarks {
		posts = append(posts, &bookmark.Post)
	}

	s.calculatePostCounts(posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, user.Username, totalCount, nil
}

// CheckBookmarkStatus checks if a post is bookmarked by user
func (s *InsightService) CheckBookmarkStatus(userID uuid.UUID, postID uuid.UUID) (bool, error) {
	isBookmarked, err := s.BookmarkRepo.CheckIsBookmarked(userID, postID)
	if err != nil {
		return false, apperror.NewInternal("failed to check bookmark status", err)
	}
	return isBookmarked, nil
}

// calculatePostCounts calculates clap_count and comments_count for posts (best-effort)
func (s *InsightService) calculatePostCounts(posts []*entities.Post) {
	_ = s.PostRepo.CalculateCountsForPosts(posts)
}
