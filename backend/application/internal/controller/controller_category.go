package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
)

// ==================== CATEGORY ROUTES ====================

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

	// Ensure data is never null
	if responses == nil {
		responses = []*model.CategoryResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
	})
}

// GetTopCategories retrieves top categories (Technology, Music, Movies, AI, Golang)
func (c *Controller) GetTopCategories(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.GetTopCategories(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
	})
}

// GetPopularCategories returns categories with most posts for sidebar
func (c *Controller) GetPopularCategories(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.GetPopularCategories(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
	})
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

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// UpdateCategory updates a category
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

// DeleteCategory deletes a category
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
