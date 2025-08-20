package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	uuid "github.com/satori/go.uuid"
)

// ==================== BOOKMARK ROUTES ====================

// CreateBookmark creates a new bookmark
func (c *Controller) CreateBookmark(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req dto.CreateBookmarkRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.CreateBookmark(userID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

// Unbookmark removes a bookmark
func (c *Controller) Unbookmark(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	postIDStr := ctx.Param("post_id")

	req := &dto.CreateBookmarkRequest{
		PostID: postIDStr,
	}

	err = c.service.Unbookmark(userID, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Bookmark removed successfully"})
}

// GetUserBookmarks retrieves user's bookmarks
func (c *Controller) GetUserBookmarks(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

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

	responses, _, total, err := c.service.GetUserBookmarks(userID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ensure data is never null - use empty array if nil
	if responses == nil {
		responses = []*dto.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
		"limit":       req.Limit,
		"offset":      req.Offset,
	})
}

// CheckBookmarkStatus checks if a post is bookmarked by user
func (c *Controller) CheckBookmarkStatus(ctx *gin.Context) {
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	postIDStr := ctx.Param("post_id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	isBookmarked, err := c.service.CheckBookmarkStatus(userID, postID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"is_bookmarked": isBookmarked})
}
