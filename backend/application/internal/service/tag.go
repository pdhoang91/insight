package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ListTags retrieves tags with pagination
func (s *InsightService) ListTags(req *dto.PaginationRequest) ([]*dto.TagResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	cacheKey := fmt.Sprintf("tags:%d:%d", req.Limit, req.Offset)
	if cachedTags, ok1 := s.cache.Get(cacheKey); ok1 {
		if cachedTotal, ok2 := s.cache.Get(cacheKey + ":total"); ok2 {
			return cachedTags.([]*dto.TagResponse), cachedTotal.(int64), nil
		}
	}

	tags, err := s.tagRepo.List(req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list tags", err)
	}

	total, err := s.tagRepo.Count()
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count tags", err)
	}

	responses := make([]*dto.TagResponse, 0, len(tags))
	for _, tag := range tags {
		responses = append(responses, dto.NewTagResponse(tag))
	}

	s.cache.Set(cacheKey, responses, 10*time.Minute)
	s.cache.Set(cacheKey+":total", total, 10*time.Minute)
	return responses, total, nil
}

// GetPopularTags retrieves popular tags based on usage
func (s *InsightService) GetPopularTags(limit int) ([]*dto.TagResponse, error) {
	if limit == 0 {
		limit = 10
	}

	cacheKey := fmt.Sprintf("popular_tags:%d", limit)
	if cached, ok := s.cache.Get(cacheKey); ok {
		return cached.([]*dto.TagResponse), nil
	}

	tags, err := s.tagRepo.GetPopular(limit)
	if err != nil {
		return nil, apperror.NewInternal("failed to get popular tags", err)
	}

	responses := make([]*dto.TagResponse, 0, len(tags))
	for _, tag := range tags {
		responses = append(responses, dto.NewTagResponse(tag))
	}

	s.cache.Set(cacheKey, responses, 5*time.Minute)
	return responses, nil
}

func (s *InsightService) invalidateTagCache() {
	s.cache.DeletePrefix("tags:")
	s.cache.DeletePrefix("popular_tags:")
}

func (s *InsightService) CreateTag(req *dto.CreateTagRequest) (*dto.TagResponse, error) {
	existing, err := s.tagRepo.FindByName(req.Name)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NewInternal("failed to check tag existence", err)
	}
	if existing != nil && existing.ID != uuid.Nil {
		return nil, apperror.NewConflict("tag already exists")
	}

	tag := &entities.Tag{
		ID: uuid.NewV4(), Name: req.Name,
		CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}
	if err := s.tagRepo.Create(tag); err != nil {
		return nil, apperror.NewInternal("failed to create tag", err)
	}
	s.invalidateTagCache()
	return dto.NewTagResponse(tag), nil
}

// UpdateTag updates a tag
func (s *InsightService) UpdateTag(id uuid.UUID, req *dto.UpdateTagRequest) (*dto.TagResponse, error) {
	tag, err := s.tagRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("tag not found")
		}
		return nil, apperror.NewInternal("failed to find tag", err)
	}

	if req.Name != "" {
		tag.Name = req.Name
	}
	if err := s.tagRepo.Update(tag); err != nil {
		return nil, apperror.NewInternal("failed to update tag", err)
	}
	s.invalidateTagCache()
	return dto.NewTagResponse(tag), nil
}

// DeleteTag deletes a tag
func (s *InsightService) DeleteTag(id uuid.UUID) error {
	if _, err := s.tagRepo.FindByID(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("tag not found")
		}
		return apperror.NewInternal("failed to find tag", err)
	}

	postCount, err := s.tagRepo.CountPostsByTag(id)
	if err != nil {
		return apperror.NewInternal("failed to check tag usage", err)
	}
	if postCount > 0 {
		return apperror.NewBadRequest("tag is in use by posts")
	}

	if err := s.tagRepo.Delete(id); err != nil {
		return apperror.NewInternal("failed to delete tag", err)
	}
	s.invalidateTagCache()
	return nil
}
