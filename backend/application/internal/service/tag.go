package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== TAG BUSINESS LOGIC ====================

// ListTags retrieves tags with pagination
func (s *InsightService) ListTags(req *dto.PaginationRequest) ([]*dto.TagResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Use read replica for better performance
	tags, err := s.Tag.List(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.TagResponse
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

	// Use read replica for better performance
	tags, err := s.Tag.GetPopular(s.DBR2, limit)
	if err != nil {
		return nil, errors.New("internal server error")
	}

	var responses []*dto.TagResponse
	for _, tag := range tags {
		responses = append(responses, dto.NewTagResponse(tag))
	}

	return responses, nil
}

// GetTag retrieves a tag by ID
func (s *InsightService) GetTag(id uuid.UUID) (*dto.TagResponse, error) {
	// Use read replica for better performance
	tag, err := s.Tag.FindByID(s.DBR2, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	return dto.NewTagResponse(tag), nil
}

// CreateTag creates a new tag
func (s *InsightService) CreateTag(req *dto.CreateTagRequest) (*dto.TagResponse, error) {
	// Check if tag with same name already exists
	existingTag, err := s.Tag.FindByName(s.DB, req.Name)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, errors.New("internal server error")
	}
	if existingTag != nil && existingTag.ID != uuid.Nil {
		return nil, errors.New("bad request")
	}

	tag := &entities.Tag{
		ID:        uuid.NewV4(),
		Name:      req.Name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := tag.Create(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewTagResponse(tag), nil
}

// UpdateTag updates a tag
func (s *InsightService) UpdateTag(id uuid.UUID, req *dto.UpdateTagRequest) (*dto.TagResponse, error) {
	tag, err := s.Tag.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Update fields
	if req.Name != "" {
		tag.Name = req.Name
	}

	if err := s.Tag.Update(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	return dto.NewTagResponse(tag), nil
}

// DeleteTag deletes a tag
func (s *InsightService) DeleteTag(id uuid.UUID) error {
	tag, err := s.Tag.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	if err := s.Tag.DeleteByID(s.DB, tag.ID); err != nil {
		return errors.New("internal server error")
	}

	// TODO: Remove tag from Elasticsearch
	// TODO: Send delete notification using EventProcessor

	return nil
}

// GetPopularTags retrieves popular tags
