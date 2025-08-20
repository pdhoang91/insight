package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
)

// ==================== TAG ROUTES ====================

// CreateTag creates a new tag
func (c *Controller) CreateTag(ctx *gin.Context) {
	var req model.CreateTagRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.CreateTag(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.SuccessWithStatus(ctx, http.StatusCreated, response)
}

// ListTags retrieves all tags
func (c *Controller) ListTags(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.ListTags(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}

// GetTag retrieves a tag by ID
func (c *Controller) GetTag(ctx *gin.Context) {
	idParam := ctx.Param("id")
	tagID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.GetTag(tagID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// UpdateTag updates a tag by ID
func (c *Controller) UpdateTag(ctx *gin.Context) {
	idParam := ctx.Param("id")
	tagID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.UpdateTagRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.UpdateTag(tagID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// DeleteTag deletes a tag by ID
func (c *Controller) DeleteTag(ctx *gin.Context) {
	idParam := ctx.Param("id")
	tagID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	err = c.service.DeleteTag(tagID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "Tag deleted successfully"})
}

// GetPopularTags retrieves popular tags
func (c *Controller) GetPopularTags(ctx *gin.Context) {
	limit := 10
	responses, err := c.service.GetPopularTags(limit)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, responses)
}
