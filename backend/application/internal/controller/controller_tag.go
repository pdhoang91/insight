package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
)

// ==================== TAG CONTROLLER METHODS ====================

// ListTags handles GET /tags
func (c *Controller) ListTags(ctx *gin.Context) {
	// Parse pagination parameters
	limitStr := ctx.DefaultQuery("limit", "10")
	pageStr := ctx.DefaultQuery("page", "1")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = 1
	}

	offset := (page - 1) * limit

	req := &model.PaginationRequest{
		Limit:  limit,
		Offset: offset,
	}

	tags, total, err := c.service.ListTags(req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if tags == nil {
		tags = []*model.TagResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        tags,
		"total_count": total,
	})
}

// GetPopularTags handles GET /tags/popular
func (c *Controller) GetPopularTags(ctx *gin.Context) {
	limitStr := ctx.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	tags, err := c.service.GetPopularTags(limit)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if tags == nil {
		tags = []*model.TagResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": tags,
	})
}

// GetTag handles GET /tags/:id
func (c *Controller) GetTag(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := c.ParseUUID(idStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	tag, err := c.service.GetTag(id)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, tag)
}

// CreateTag handles POST /tags
func (c *Controller) CreateTag(ctx *gin.Context) {
	var req model.CreateTagRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	tag, err := c.service.CreateTag(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.SuccessWithStatus(ctx, http.StatusCreated, tag)
}

// UpdateTag handles PUT /tags/:id
func (c *Controller) UpdateTag(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := c.ParseUUID(idStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.UpdateTagRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		return
	}

	tag, err := c.service.UpdateTag(id, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, tag)
}

// DeleteTag handles DELETE /tags/:id
func (c *Controller) DeleteTag(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := c.ParseUUID(idStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	if err := c.service.DeleteTag(id); err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{
		"message": "Tag deleted successfully",
	})
}
