package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== RATING METHODS ====================

// RatePost creates or updates a rating for a post
func (s *InsightService) RatePost(userID uuid.UUID, req *dto.RatePostRequest) (*dto.RatingResponse, error) {
	// Validate rating score (1-5)
	if req.Score < 1 || req.Score > 5 {
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

	// Check if user already rated this post
	existingRating, err := s.Rating.FindByUserAndPost(s.DB, userID, req.PostID)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, errors.New("internal server error")
	}

	if existingRating != nil {
		// Update existing rating
		existingRating.Score = req.Score
		if err := existingRating.Update(s.DB); err != nil {
			return nil, errors.New("internal server error")
		}
		return dto.NewRatingResponse(existingRating), nil
	}

	// Create new rating
	rating := &entities.Rating{
		ID:        uuid.NewV4(),
		PostID:    req.PostID,
		UserID:    userID,
		Score:     req.Score,
		CreatedAt: time.Now(),
	}

	if err := rating.Create(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewRatingResponse(rating), nil
}

// GetPostRating gets user's rating for a post
func (s *InsightService) GetPostRating(userID, postID uuid.UUID) (*dto.RatingResponse, error) {
	rating, err := s.Rating.FindByUserAndPost(s.DBR2, userID, postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	return dto.NewRatingResponse(rating), nil
}

// GetPostRatings gets all ratings for a post
func (s *InsightService) GetPostRatings(postID uuid.UUID, req *dto.PaginationRequest) ([]*dto.RatingResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	ratings, err := s.Rating.FindByPostID(s.DBR2, postID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	total, err := s.Rating.CountByPostID(s.DBR2, postID)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.RatingResponse
	for _, rating := range ratings {
		responses = append(responses, dto.NewRatingResponse(rating))
	}

	// Ensure we return empty array instead of nil
	if responses == nil {
		responses = []*dto.RatingResponse{}
	}

	return responses, total, nil
}

// GetPostAverageRating gets average rating for a post
func (s *InsightService) GetPostAverageRating(postID uuid.UUID) (*dto.PostRatingStats, error) {
	avgRating, err := s.Rating.GetAverageRating(s.DBR2, postID)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	totalRatings, err := s.Rating.CountByPostID(s.DBR2, postID)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	return &dto.PostRatingStats{
		PostID:       postID,
		AverageRating: avgRating,
		TotalRatings: totalRatings,
	}, nil
}

// DeleteRating deletes a user's rating for a post
func (s *InsightService) DeleteRating(userID, postID uuid.UUID) error {
	// Check if rating exists
	_, err := s.Rating.FindByUserAndPost(s.DB, userID, postID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	if err := s.Rating.DeleteByUserAndPost(s.DB, userID, postID); err != nil {
		return errors.New("internal server error")
	}

	return nil
}
