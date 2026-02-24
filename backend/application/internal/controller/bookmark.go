package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	uuid "github.com/satori/go.uuid"
)

// ==================== BOOKMARK ROUTES ====================

func (c *Controller) CreateBookmark(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	var req dto.CreateBookmarkRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.CreateBookmark(userID, &req)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

func (c *Controller) Unbookmark(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	postIDStr := ctx.Param("post_id")
	req := &dto.CreateBookmarkRequest{PostID: postIDStr}

	if err := c.service.Unbookmark(userID, req); err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Bookmark removed successfully"})
}

func (c *Controller) GetUserBookmarks(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, _, total, err := c.service.GetUserBookmarks(userID, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) CheckBookmarkStatus(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	postID, err := uuid.FromString(ctx.Param("post_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	isBookmarked, err := c.service.CheckBookmarkStatus(userID, postID)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"is_bookmarked": isBookmarked})
}
