package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== CLAP METHODS ====================

// ClapPost adds claps to a post (Medium-style)
func (s *InsightService) ClapPost(userID uuid.UUID, req *dto.ClapPostRequest) (*dto.ClapResponse, error) {
	// Validate clap count (1-50 like Medium)
	if req.Count < 1 || req.Count > 50 {
		return nil, errors.New("bad request")
	}

	// Check if post exists
	_, err := s.Post.FindByID(s.DBR2, req.PostID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Check if user already clapped this post
	existingClap, err := s.Clap.FindByUserAndPost(s.DB, userID, req.PostID)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, errors.New("internal server error")
	}

	if existingClap != nil {
		// Update existing clap count (add more claps)
		existingClap.Count += req.Count
		if existingClap.Count > 50 { // Max 50 claps per user per post
			existingClap.Count = 50
		}
		existingClap.UpdatedAt = time.Now()
		
		if err := existingClap.Update(s.DB); err != nil {
			return nil, errors.New("internal server error")
		}
		return dto.NewClapResponse(existingClap), nil
	}

	// Create new clap
	clap := &entities.Clap{
		ID:        uuid.NewV4(),
		PostID:    req.PostID,
		UserID:    userID,
		Count:     req.Count,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := clap.Create(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewClapResponse(clap), nil
}

// GetPostClaps gets all claps for a post
func (s *InsightService) GetPostClaps(postID uuid.UUID, req *dto.PaginationRequest) ([]*dto.ClapResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	claps, err := s.Clap.FindByPostID(s.DBR2, postID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	total, err := s.Clap.CountByPostID(s.DBR2, postID)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.ClapResponse
	for _, clap := range claps {
		responses = append(responses, dto.NewClapResponse(clap))
	}

	// Ensure we return empty array instead of nil
	if responses == nil {
		responses = []*dto.ClapResponse{}
	}

	return responses, total, nil
}

// GetPostClapStats gets clap statistics for a post
func (s *InsightService) GetPostClapStats(postID uuid.UUID) (*dto.PostClapStats, error) {
	// Check if post exists
	_, err := s.Post.FindByID(s.DBR2, postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Get total clap count
	totalClaps, err := s.Clap.SumClapsByPostID(s.DBR2, postID)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	// Get unique clappers count
	uniqueClappers, err := s.Clap.CountByPostID(s.DBR2, postID)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	return &dto.PostClapStats{
		PostID:         postID,
		TotalClaps:     totalClaps,
		UniqueClappers: uniqueClappers,
	}, nil
}

// GetUserClap gets user's clap for a post
func (s *InsightService) GetUserClap(userID, postID uuid.UUID) (*dto.ClapResponse, error) {
	clap, err := s.Clap.FindByUserAndPost(s.DBR2, userID, postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	return dto.NewClapResponse(clap), nil
}

// RemoveClap removes user's clap from a post
func (s *InsightService) RemoveClap(userID, postID uuid.UUID) error {
	// Check if clap exists
	_, err := s.Clap.FindByUserAndPost(s.DB, userID, postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	if err := s.Clap.DeleteByUserAndPost(s.DB, userID, postID); err != nil {
		return errors.New("internal server error")
	}

	return nil
}

// GetUserClaps gets all claps by a user
func (s *InsightService) GetUserClaps(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.ClapResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	claps, err := s.Clap.GetUserClaps(s.DBR2, userID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get total count (simplified)
	total := int64(len(claps))
	if len(claps) == req.Limit {
		total = int64(req.Offset + req.Limit + 1) // Estimate
	}

	var responses []*dto.ClapResponse
	for _, clap := range claps {
		responses = append(responses, dto.NewClapResponse(clap))
	}

	// Ensure we return empty array instead of nil
	if responses == nil {
		responses = []*dto.ClapResponse{}
	}

	return responses, total, nil
}

// GetTopClappedPosts gets most clapped posts
func (s *InsightService) GetTopClappedPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	posts, err := s.Clap.GetTopClappedPosts(s.DBR2, req.Limit, req.Offset)
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
