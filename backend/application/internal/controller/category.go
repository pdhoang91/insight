package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	uuid "github.com/satori/go.uuid"
)

// ==================== CATEGORY ROUTES ====================

// CreateCategory creates a new category
func (c *Controller) CreateCategory(ctx *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.CreateCategory(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

// GetCategory retrieves a category by ID
func (c *Controller) GetCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	response, err := c.service.GetCategory(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// ListCategories retrieves all categories with pagination
func (c *Controller) ListCategories(ctx *gin.Context) {
	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	// Convert page-based pagination to offset-based
	if req.Page > 0 && req.Limit > 0 {
		req.Offset = (req.Page - 1) * req.Limit
	}
	if req.Limit == 0 {
		req.Limit = 10 // Default limit
	}

	responses, total, err := c.service.ListCategories(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ensure data is never null - use empty array if nil
	if responses == nil {
		responses = []*dto.CategoryResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
		"limit":       req.Limit,
		"offset":      req.Offset,
	})
}

// UpdateCategory updates a category
func (c *Controller) UpdateCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	var req dto.UpdateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.UpdateCategory(id, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// DeleteCategory deletes a category
func (c *Controller) DeleteCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	err = c.service.DeleteCategory(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

// GetCategoriesWithPostCount retrieves categories with post counts
func (c *Controller) GetCategoriesWithPostCount(ctx *gin.Context) {
	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	// Convert page-based pagination to offset-based
	if req.Page > 0 && req.Limit > 0 {
		req.Offset = (req.Page - 1) * req.Limit
	}
	if req.Limit == 0 {
		req.Limit = 10 // Default limit
	}

	responses, total, err := c.service.GetCategoriesWithPostCount(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ensure data is never null - use empty array if nil
	if responses == nil {
		responses = []*dto.CategoryWithCount{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
		"limit":       req.Limit,
		"offset":      req.Offset,
	})
}

// GetTopCategories retrieves top categories
func (c *Controller) GetTopCategories(ctx *gin.Context) {
	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	// Convert page-based pagination to offset-based
	if req.Page > 0 && req.Limit > 0 {
		req.Offset = (req.Page - 1) * req.Limit
	}
	if req.Limit == 0 {
		req.Limit = 10 // Default limit
	}

	responses, total, err := c.service.GetTopCategories(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ensure data is never null - use empty array if nil
	if responses == nil {
		responses = []*dto.CategoryResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
		"limit":       req.Limit,
		"offset":      req.Offset,
	})
}

// GetPopularCategories retrieves popular categories
func (c *Controller) GetPopularCategories(ctx *gin.Context) {
	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	// Convert page-based pagination to offset-based
	if req.Page > 0 && req.Limit > 0 {
		req.Offset = (req.Page - 1) * req.Limit
	}
	if req.Limit == 0 {
		req.Limit = 10 // Default limit
	}

	responses, total, err := c.service.GetPopularCategories(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ensure data is never null - use empty array if nil
	if responses == nil {
		responses = []dto.CategoryWithCount{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
		"limit":       req.Limit,
		"offset":      req.Offset,
	})
}
