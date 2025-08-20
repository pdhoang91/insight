package service

import (
	"time"

	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== TAG BUSINESS LOGIC ====================

// ListTags retrieves tags with pagination
func (s *InsightService) ListTags(req *model.PaginationRequest) ([]*model.TagResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Use read replica for better performance
	tags, err := s.Tag.List(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, appError.InternalServerError("Failed to get tags", err)
	}

	var responses []*model.TagResponse
	for _, tag := range tags {
		responses = append(responses, model.NewTagResponse(tag))
	}

	return responses, int64(len(responses)), nil
}

// GetPopularTags retrieves popular tags based on usage
func (s *InsightService) GetPopularTags(limit int) ([]*model.TagResponse, error) {
	if limit == 0 {
		limit = 10
	}

	// Use read replica for better performance
	tags, err := s.Tag.GetPopular(s.DBR2, limit)
	if err != nil {
		return nil, appError.InternalServerError("Failed to get popular tags", err)
	}

	var responses []*model.TagResponse
	for _, tag := range tags {
		responses = append(responses, model.NewTagResponse(tag))
	}

	return responses, nil
}

// GetTag retrieves a tag by ID
func (s *InsightService) GetTag(id uuid.UUID) (*model.TagResponse, error) {
	// Use read replica for better performance
	tag, err := s.Tag.FindByID(s.DBR2, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Tag not found", err)
		}
		return nil, appError.InternalServerError("Failed to get tag", err)
	}

	return model.NewTagResponse(tag), nil
}

// CreateTag creates a new tag
func (s *InsightService) CreateTag(req *model.CreateTagRequest) (*model.TagResponse, error) {
	// Check if tag with same name already exists
	existingTag, err := s.Tag.FindByName(s.DB, req.Name)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, appError.InternalServerError("Failed to check existing tag", err)
	}
	if existingTag != nil && existingTag.ID != uuid.Nil {
		return nil, appError.BadRequest("Tag with this name already exists", nil)
	}

	tag := &entities.Tag{
		ID:        uuid.NewV4(),
		Name:      req.Name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := tag.Create(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to create tag", err)
	}

	return model.NewTagResponse(tag), nil
}

// UpdateTag updates a tag
func (s *InsightService) UpdateTag(id uuid.UUID, req *model.UpdateTagRequest) (*model.TagResponse, error) {
	tag, err := s.Tag.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, appError.NotFound("Tag not found", err)
		}
		return nil, appError.InternalServerError("Failed to get tag", err)
	}

	if req.Name != "" {
		// Check if another tag with same name already exists
		existingTag, err := s.Tag.FindByName(s.DB, req.Name)
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, appError.InternalServerError("Failed to check existing tag", err)
		}
		if existingTag != nil && existingTag.ID != uuid.Nil && existingTag.ID != id {
			return nil, appError.BadRequest("Tag with this name already exists", nil)
		}
		tag.Name = req.Name
	}

	tag.UpdatedAt = time.Now()
	if err := tag.Update(s.DB); err != nil {
		return nil, appError.InternalServerError("Failed to update tag", err)
	}

	return model.NewTagResponse(tag), nil
}

// DeleteTag deletes a tag
func (s *InsightService) DeleteTag(id uuid.UUID) error {
	_, err := s.Tag.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return appError.NotFound("Tag not found", err)
		}
		return appError.InternalServerError("Failed to get tag", err)
	}

	if err := s.Tag.DeleteByID(s.DB, id); err != nil {
		return appError.InternalServerError("Failed to delete tag", err)
	}

	return nil
}
