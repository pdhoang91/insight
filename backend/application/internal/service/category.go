package service

import (
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// allows letters (including Unicode/Vietnamese), numbers, spaces, hyphens, underscores, dots
var validCategoryName = regexp.MustCompile(`^[\p{L}\p{N}\s\-_.]+$`)

func (s *InsightService) ListCategories(req *dto.PaginationRequest) ([]*dto.CategoryResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	cacheKey := fmt.Sprintf("categories:%d:%d", req.Limit, req.Offset)
	if cachedCats, ok1 := s.Cache.Get(cacheKey); ok1 {
		if cachedTotal, ok2 := s.Cache.Get(cacheKey + ":total"); ok2 {
			return cachedCats.([]*dto.CategoryResponse), cachedTotal.(int64), nil
		}
	}

	categories, err := s.CategoryRepo.FindAll(req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list categories", err)
	}

	total, err := s.CategoryRepo.Count()
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count categories", err)
	}

	responses := make([]*dto.CategoryResponse, 0, len(categories))
	for _, category := range categories {
		responses = append(responses, dto.NewCategoryResponse(category))
	}

	s.Cache.Set(cacheKey, responses, 10*time.Minute)
	s.Cache.Set(cacheKey+":total", total, 10*time.Minute)
	return responses, total, nil
}

// GetTopCategories retrieves top categories by post count
func (s *InsightService) GetTopCategories(req *dto.PaginationRequest) ([]*dto.CategoryResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	results, totalCount, err := s.CategoryRepo.FindPopularByPostCount(req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get top categories", err)
	}

	responses := make([]*dto.CategoryResponse, 0, len(results))
	for _, result := range results {
		responses = append(responses, dto.NewCategoryResponse(result.Category))
	}
	return responses, totalCount, nil
}

// GetPopularCategories returns categories with most posts for sidebar
func (s *InsightService) GetPopularCategories(req *dto.PaginationRequest) ([]dto.CategoryWithCount, int64, error) {
	if req.Limit == 0 {
		req.Limit = 7
	}

	results, totalCount, err := s.CategoryRepo.FindPopularByPostCount(req.Limit, req.Offset)
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

func (s *InsightService) CreateCategory(req *dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	if !validCategoryName.MatchString(req.Name) {
		return nil, apperror.NewBadRequest("category name contains invalid characters")
	}
	existing, err := s.CategoryRepo.FindByName(req.Name)
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
	if err := s.CategoryRepo.Create(category); err != nil {
		return nil, apperror.NewInternal("failed to create category", err)
	}
	s.invalidateCategoryCache()
	return dto.NewCategoryResponse(category), nil
}

// GetCategory retrieves a category by ID
func (s *InsightService) GetCategory(id uuid.UUID) (*dto.CategoryResponse, error) {
	category, err := s.CategoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("category not found")
		}
		return nil, apperror.NewInternal("failed to get category", err)
	}
	return dto.NewCategoryResponse(category), nil
}

func (s *InsightService) invalidateCategoryCache() {
	s.Cache.DeletePrefix("categories:")
	s.Cache.Delete("home_data")
}

func (s *InsightService) UpdateCategory(id uuid.UUID, req *dto.UpdateCategoryRequest) (*dto.CategoryResponse, error) {
	category, err := s.CategoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("category not found")
		}
		return nil, apperror.NewInternal("failed to find category", err)
	}

	if req.Name != "" {
		if !validCategoryName.MatchString(req.Name) {
			return nil, apperror.NewBadRequest("category name contains invalid characters")
		}
		existing, err := s.CategoryRepo.FindByName(req.Name)
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
	if err := s.CategoryRepo.Update(category); err != nil {
		return nil, apperror.NewInternal("failed to update category", err)
	}
	s.invalidateCategoryCache()
	return dto.NewCategoryResponse(category), nil
}

func (s *InsightService) DeleteCategory(id uuid.UUID) error {
	if _, err := s.CategoryRepo.FindByID(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("category not found")
		}
		return apperror.NewInternal("failed to find category", err)
	}

	postCount, err := s.CategoryRepo.CountPostsByCategory(id)
	if err != nil {
		return apperror.NewInternal("failed to check category usage", err)
	}
	if postCount > 0 {
		return apperror.NewBadRequest("category is in use by posts")
	}

	if err := s.CategoryRepo.Delete(id); err != nil {
		return apperror.NewInternal("failed to delete category", err)
	}
	s.invalidateCategoryCache()
	return nil
}
