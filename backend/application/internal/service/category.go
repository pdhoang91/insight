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

// ListCategories retrieves all categories with pagination
func (s *InsightService) ListCategories(req *dto.PaginationRequest) ([]*dto.CategoryResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	categories, err := s.CategoryRepo.FindAll(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list categories", err)
	}

	total, err := s.CategoryRepo.Count(s.DBR2)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count categories", err)
	}

	responses := make([]*dto.CategoryResponse, 0, len(categories))
	for _, category := range categories {
		responses = append(responses, dto.NewCategoryResponse(category))
	}
	return responses, total, nil
}

// GetTopCategories retrieves top categories
func (s *InsightService) GetTopCategories(req *dto.PaginationRequest) ([]*dto.CategoryResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	topCategories := []string{"Technology", "Music", "Movies", "AI", "Golang"}

	totalCount, err := s.CategoryRepo.CountByNames(s.DBR2, topCategories)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count top categories", err)
	}

	categories, err := s.CategoryRepo.FindByNames(s.DBR2, topCategories, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get top categories", err)
	}

	responses := make([]*dto.CategoryResponse, 0, len(categories))
	for _, category := range categories {
		responses = append(responses, dto.NewCategoryResponse(category))
	}
	return responses, totalCount, nil
}

// GetPopularCategories returns categories with most posts for sidebar
func (s *InsightService) GetPopularCategories(req *dto.PaginationRequest) ([]dto.CategoryWithCount, int64, error) {
	if req.Limit == 0 {
		req.Limit = 7
	}

	results, totalCount, err := s.CategoryRepo.FindPopularByPostCount(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get popular categories", err)
	}

	categories := make([]dto.CategoryWithCount, len(results))
	for i, r := range results {
		categories[i] = dto.CategoryWithCount{
			CategoryResponse: *dto.NewCategoryResponse(r.Category),
			PostCount:        r.PostCount,
		}
	}

	return categories, totalCount, nil
}

// CreateCategory creates a new category
func (s *InsightService) CreateCategory(req *dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	existing, err := s.CategoryRepo.FindByName(s.DB, req.Name)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NewInternal("failed to check category existence", err)
	}
	if existing != nil {
		return nil, apperror.NewConflict("category already exists")
	}

	category := &entities.Category{
		ID: uuid.NewV4(), Name: req.Name, Description: req.Description,
		CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}
	if err := s.CategoryRepo.Create(s.DB, category); err != nil {
		return nil, apperror.NewInternal("failed to create category", err)
	}
	return dto.NewCategoryResponse(category), nil
}

// GetCategory retrieves a category by ID
func (s *InsightService) GetCategory(id uuid.UUID) (*dto.CategoryResponse, error) {
	category, err := s.CategoryRepo.FindByID(s.DBR2, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("category not found")
		}
		return nil, apperror.NewInternal("failed to get category", err)
	}
	return dto.NewCategoryResponse(category), nil
}

// UpdateCategory updates a category by ID
func (s *InsightService) UpdateCategory(id uuid.UUID, req *dto.UpdateCategoryRequest) (*dto.CategoryResponse, error) {
	category, err := s.CategoryRepo.FindByID(s.DB, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("category not found")
		}
		return nil, apperror.NewInternal("failed to find category", err)
	}

	if req.Name != "" {
		existing, err := s.CategoryRepo.FindByName(s.DB, req.Name)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewInternal("failed to check category name", err)
		}
		if existing != nil && existing.ID != id {
			return nil, apperror.NewConflict("category name already exists")
		}
		category.Name = req.Name
	}
	if req.Description != "" {
		category.Description = req.Description
	}

	category.UpdatedAt = time.Now()
	if err := s.CategoryRepo.Update(s.DB, category); err != nil {
		return nil, apperror.NewInternal("failed to update category", err)
	}
	return dto.NewCategoryResponse(category), nil
}

// DeleteCategory deletes a category by ID
func (s *InsightService) DeleteCategory(id uuid.UUID) error {
	if _, err := s.CategoryRepo.FindByID(s.DB, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("category not found")
		}
		return apperror.NewInternal("failed to find category", err)
	}

	postCount, err := s.CategoryRepo.CountPostsByCategory(s.DB, id)
	if err != nil {
		return apperror.NewInternal("failed to check category usage", err)
	}
	if postCount > 0 {
		return apperror.NewBadRequest("category is in use by posts")
	}

	if err := s.CategoryRepo.Delete(s.DB, id); err != nil {
		return apperror.NewInternal("failed to delete category", err)
	}
	return nil
}

// GetCategoriesWithPostCount retrieves categories with post counts
func (s *InsightService) GetCategoriesWithPostCount(req *dto.PaginationRequest) ([]*dto.CategoryWithCount, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	categories, err := s.CategoryRepo.FindAll(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list categories", err)
	}

	total, err := s.CategoryRepo.Count(s.DBR2)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count categories", err)
	}

	responses := make([]*dto.CategoryWithCount, 0, len(categories))
	for _, category := range categories {
		responses = append(responses, &dto.CategoryWithCount{
			CategoryResponse: *dto.NewCategoryResponse(category),
			PostCount:        0,
		})
	}
	return responses, total, nil
}
