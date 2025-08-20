package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
)

// ==================== CATEGORY ROUTES ====================

// CreateCategory creates a new category
func (c *Controller) CreateCategory(ctx *gin.Context) {
	var req model.CreateCategoryRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.CreateCategory(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.SuccessWithStatus(ctx, http.StatusCreated, response)
}

// ListCategories retrieves all categories
func (c *Controller) ListCategories(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.ListCategories(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}

// GetCategory retrieves a category by ID
func (c *Controller) GetCategory(ctx *gin.Context) {
	idParam := ctx.Param("id")
	categoryID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.GetCategory(categoryID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// UpdateCategory updates a category by ID
func (c *Controller) UpdateCategory(ctx *gin.Context) {
	idParam := ctx.Param("id")
	categoryID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.UpdateCategoryRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.UpdateCategory(categoryID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// DeleteCategory deletes a category by ID
func (c *Controller) DeleteCategory(ctx *gin.Context) {
	idParam := ctx.Param("id")
	categoryID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	err = c.service.DeleteCategory(categoryID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "Category deleted successfully"})
}

// GetTopCategories retrieves top categories
func (c *Controller) GetTopCategories(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	responses, total, err := c.service.GetTopCategories(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}

// GetPopularCategories retrieves popular categories
func (c *Controller) GetPopularCategories(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	responses, total, err := c.service.GetPopularCategories(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}
