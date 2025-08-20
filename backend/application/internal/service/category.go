package service

import (
	"errors"
	"time"

	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// ==================== CATEGORY METHODS ====================

// ListCategories retrieves all categories with pagination
func (s *InsightService) ListCategories(req *dto.PaginationRequest) ([]*dto.CategoryResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Use read replica for better performance
	categories, err := s.Category.FindAll(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get total count
	total, err := s.Category.Count(s.DBR2)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.CategoryResponse
	for _, category := range categories {
		responses = append(responses, dto.NewCategoryResponse(category))
	}

	// Ensure we return empty array instead of nil
	if responses == nil {
		responses = []*dto.CategoryResponse{}
	}

	return responses, total, nil
}

// GetTopCategories retrieves top categories (Technology, Music, Movies, AI, Golang)
func (s *InsightService) GetTopCategories(req *dto.PaginationRequest) ([]*dto.CategoryResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	topCategories := []string{"Technology", "Music", "Movies", "AI", "Golang"}

	// Use DBR2 for general read queries
	var categories []*entities.Category
	var totalCount int64

	// Count total categories in top list
	if err := s.DBR2.Model(&entities.Category{}).
		Where("name IN ?", topCategories).
		Count(&totalCount).Error; err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get categories with pagination
	offset := req.Offset
	if err := s.DBR2.Where("name IN ?", topCategories).
		Order("created_at desc").
		Limit(req.Limit).
		Offset(offset).
		Find(&categories).Error; err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.CategoryResponse
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

	var categories []dto.CategoryWithCount
	var totalCount int64

	// Count total categories that have at least 1 post
	countQuery := `
		SELECT COUNT(DISTINCT c.id) 
		FROM categories c 
		INNER JOIN post_categories pc ON c.id = pc.category_id
	`
	if err := s.DBR2.Raw(countQuery).Scan(&totalCount).Error; err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Query to get categories with post count, ordered by post count desc
	query := `
		SELECT c.id, c.name, c.description, c.created_at, c.updated_at, COUNT(pc.post_id) as post_count
		FROM categories c 
		INNER JOIN post_categories pc ON c.id = pc.category_id 
		GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at 
		ORDER BY post_count DESC 
		LIMIT ? OFFSET ?
	`

	offset := req.Offset
	if err := s.DBR2.Raw(query, req.Limit, offset).Scan(&categories).Error; err != nil {
		return nil, 0, errors.New("internal server error")
	}

	return categories, totalCount, nil
}

// CreateCategory creates a new category
func (s *InsightService) CreateCategory(req *dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	// Check if category already exists
	existingCategory, err := s.Category.FindByName(s.DB, req.Name)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, errors.New("internal server error")
	}
	if existingCategory != nil {
		return nil, errors.New("conflict")
	}

	// Create category
	category := &entities.Category{
		ID:          uuid.NewV4(),
		Name:        req.Name,
		Description: req.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := category.Create(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	// TODO: Index category to Elasticsearch using search service
	// TODO: Send notification using EventProcessor

	return dto.NewCategoryResponse(category), nil
}

// GetCategory retrieves a category by ID
func (s *InsightService) GetCategory(id uuid.UUID) (*dto.CategoryResponse, error) {
	category, err := s.Category.FindByID(s.DBR2, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	return dto.NewCategoryResponse(category), nil
}

// UpdateCategory updates a category by ID
func (s *InsightService) UpdateCategory(id uuid.UUID, req *dto.UpdateCategoryRequest) (*dto.CategoryResponse, error) {
	category, err := s.Category.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("not found")
		}
		return nil, errors.New("internal server error")
	}

	// Update fields if provided
	if req.Name != "" {
		// Check if new name already exists (excluding current category)
		existingCategory, err := s.Category.FindByName(s.DB, req.Name)
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, errors.New("internal server error")
		}
		if existingCategory != nil && existingCategory.ID != id {
			return nil, errors.New("conflict")
		}
		category.Name = req.Name
	}
	if req.Description != "" {
		category.Description = req.Description
	}

	category.UpdatedAt = time.Now()
	if err := category.Update(s.DB); err != nil {
		return nil, errors.New("internal server error")
	}

	// TODO: Update category in Elasticsearch
	// TODO: Send update notification using EventProcessor

	return dto.NewCategoryResponse(category), nil
}

// DeleteCategory deletes a category by ID
func (s *InsightService) DeleteCategory(id uuid.UUID) error {
	_, err := s.Category.FindByID(s.DB, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("not found")
		}
		return errors.New("internal server error")
	}

	// Check if category is being used by posts
	var postCount int64
	if err := s.DB.Table("post_categories").Where("category_id = ?", id).Count(&postCount).Error; err != nil {
		return errors.New("internal server error")
	}

	if postCount > 0 {
		return errors.New("bad request")
	}

	if err := s.Category.DeleteByID(s.DB, id); err != nil {
		return errors.New("internal server error")
	}

	// TODO: Remove category from Elasticsearch
	// TODO: Send delete notification using EventProcessor

	return nil
}

// GetCategoriesWithPostCount retrieves categories with post counts
func (s *InsightService) GetCategoriesWithPostCount(req *dto.PaginationRequest) ([]*dto.CategoryWithCount, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Use read replica for better performance
	categories, err := s.Category.FindAll(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	// Get total count
	total, err := s.Category.Count(s.DBR2)
	if err != nil {
		return nil, 0, errors.New("internal server error")
	}

	var responses []*dto.CategoryWithCount
	for _, category := range categories {
		// TODO: Get actual post count for each category
		categoryWithCount := &dto.CategoryWithCount{
			CategoryResponse: *dto.NewCategoryResponse(category),
			PostCount:        0, // Placeholder
		}
		responses = append(responses, categoryWithCount)
	}

	// Ensure we return empty array instead of nil
	if responses == nil {
		responses = []*dto.CategoryWithCount{}
	}

	return responses, total, nil
}

