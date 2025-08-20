package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
)

// ==================== BOOKMARK ROUTES ====================

// CreateBookmark creates a new bookmark
func (c *Controller) CreateBookmark(ctx *gin.Context) {
	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.CreateBookmarkRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.CreateBookmark(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.SuccessWithStatus(ctx, http.StatusCreated, response)
}

// Unbookmark removes a bookmark
func (c *Controller) Unbookmark(ctx *gin.Context) {
	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.CreateBookmarkRequest // Reuse the same request structure
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	err = c.service.Unbookmark(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "Bookmark removed successfully"})
}

// GetUserBookmarks retrieves user's bookmarks
func (c *Controller) GetUserBookmarks(ctx *gin.Context) {
	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, username, total, err := c.service.GetUserBookmarksWithUsername(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	result := gin.H{
		"posts":    responses,
		"username": username,
	}

	c.PaginatedSuccess(ctx, result, total, req.Limit, req.Offset)
}

// CheckBookmarkStatus checks if a post is bookmarked by user
func (c *Controller) CheckBookmarkStatus(ctx *gin.Context) {
	userIDStr, err := c.GetUserIDFromContext(ctx)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	userID, err := c.ParseUUID(userIDStr)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	postIDParam := ctx.Param("post_id")
	postID, err := c.ParseUUID(postIDParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	isBookmarked, err := c.service.CheckBookmarkStatus(userID, postID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"is_bookmarked": isBookmarked})
}
