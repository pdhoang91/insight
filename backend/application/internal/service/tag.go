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

// ListTags retrieves tags with pagination
func (s *InsightService) ListTags(req *dto.PaginationRequest) ([]*dto.TagResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	tags, err := s.TagRepo.List(req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list tags", err)
	}

	responses := make([]*dto.TagResponse, 0, len(tags))
	for _, tag := range tags {
		responses = append(responses, dto.NewTagResponse(tag))
	}
	return responses, int64(len(responses)), nil
}

// GetPopularTags retrieves popular tags based on usage
func (s *InsightService) GetPopularTags(limit int) ([]*dto.TagResponse, error) {
	if limit == 0 {
		limit = 10
	}

	tags, err := s.TagRepo.GetPopular(limit)
	if err != nil {
		return nil, apperror.NewInternal("failed to get popular tags", err)
	}

	responses := make([]*dto.TagResponse, 0, len(tags))
	for _, tag := range tags {
		responses = append(responses, dto.NewTagResponse(tag))
	}
	return responses, nil
}

func (s *InsightService) CreateTag(req *dto.CreateTagRequest) (*dto.TagResponse, error) {
	existing, err := s.TagRepo.FindByName(req.Name)
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
	if err := s.TagRepo.Create(tag); err != nil {
		return nil, apperror.NewInternal("failed to create tag", err)
	}
	return dto.NewTagResponse(tag), nil
}

// UpdateTag updates a tag
func (s *InsightService) UpdateTag(id uuid.UUID, req *dto.UpdateTagRequest) (*dto.TagResponse, error) {
	tag, err := s.TagRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("tag not found")
		}
		return nil, apperror.NewInternal("failed to find tag", err)
	}

	if req.Name != "" {
		tag.Name = req.Name
	}
	if err := s.TagRepo.Update(tag); err != nil {
		return nil, apperror.NewInternal("failed to update tag", err)
	}
	return dto.NewTagResponse(tag), nil
}

// DeleteTag deletes a tag
func (s *InsightService) DeleteTag(id uuid.UUID) error {
	if _, err := s.TagRepo.FindByID(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("tag not found")
		}
		return apperror.NewInternal("failed to find tag", err)
	}

	if err := s.TagRepo.Delete(id); err != nil {
		return apperror.NewInternal("failed to delete tag", err)
	}
	return nil
}
