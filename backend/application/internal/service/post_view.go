package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== POST VIEW METHODS ====================

// TrackPostView tracks a post view with duplicate prevention
func (s *InsightService) TrackPostView(postID uuid.UUID, userID *uuid.UUID, ipAddress, userAgent string) error {
	// Check if this is a recent view (within 1 hour) to prevent spam
	recentView, err := s.PostView.FindRecentView(s.DBR2, postID, userID, ipAddress, time.Hour)
	if err == nil && recentView != nil {
		// Recent view exists, don't track again
		return nil
	}

	// Create new view record
	view := &entities.PostView{
		ID:        uuid.NewV4(),
		PostID:    postID,
		UserID:    userID,
		IPAddress: ipAddress,
		UserAgent: userAgent,
		CreatedAt: time.Now(),
	}

	// Track view in background (don't fail request if this fails)
	go func() {
		if err := view.Create(s.DB); err != nil {
			// TODO: Log error
		}
		
		// Also increment the post views counter for quick access
		if err := s.DB.Model(&entities.Post{}).Where("id = ?", postID).
			UpdateColumn("views", gorm.Expr("views + ?", 1)).Error; err != nil {
			// TODO: Log error
		}
	}()

	return nil
}

// GetPostViewStats gets detailed view statistics for a post
func (s *InsightService) GetPostViewStats(postID uuid.UUID) (*dto.PostViewStats, error) {
	// Check if post exists
	_, err := s.Post.FindByID(s.DBR2, postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Get total views
	totalViews, err := s.PostView.CountByPostID(s.DBR2, postID)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Get unique views
	uniqueViews, err := s.PostView.CountUniqueViewsByPostID(s.DBR2, postID)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Get views in last 24 hours
	yesterday := time.Now().Add(-24 * time.Hour)
	today := time.Now()
	dailyViews, err := s.PostView.GetViewsByDateRange(s.DBR2, postID, yesterday, today)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Get views in last 7 days
	weekAgo := time.Now().Add(-7 * 24 * time.Hour)
	weeklyViews, err := s.PostView.GetViewsByDateRange(s.DBR2, postID, weekAgo, today)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	return &dto.PostViewStats{
		PostID:      postID,
		TotalViews:  totalViews,
		UniqueViews: uniqueViews,
		DailyViews:  dailyViews,
		WeeklyViews: weeklyViews,
	}, nil
}

// GetTopViewedPosts gets most viewed posts
func (s *InsightService) GetTopViewedPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	posts, err := s.PostView.GetTopViewedPosts(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get total count (simplified)
	total := int64(len(posts))
	if len(posts) == req.Limit {
		total = int64(req.Offset + req.Limit + 1) // Estimate
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
