package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	uuid "github.com/satori/go.uuid"
)

// ==================== CATEGORY ROUTES ====================

func (c *Controller) CreateCategory(ctx *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.CreateCategory(&req)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

func (c *Controller) GetCategory(ctx *gin.Context) {
	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	response, err := c.service.GetCategory(id)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *Controller) ListCategories(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.service.ListCategories(req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) UpdateCategory(ctx *gin.Context) {
	id, err := uuid.FromString(ctx.Param("id"))
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
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *Controller) DeleteCategory(ctx *gin.Context) {
	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	if err := c.service.DeleteCategory(id); err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

func (c *Controller) GetCategoriesWithPostCount(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.service.GetCategoriesWithPostCount(req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) GetTopCategories(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.service.GetTopCategories(req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) GetPopularCategories(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.service.GetPopularCategories(req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}
