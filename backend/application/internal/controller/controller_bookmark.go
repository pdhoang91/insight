package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
)

// ==================== BOOKMARK ROUTES ====================

// CreateBookmark creates or reactivates a bookmark
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

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Bookmark created",
		"data":    response,
	})
}

// Unbookmark removes or deactivates a bookmark
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

	var req model.CreateBookmarkRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	err = c.service.Unbookmark(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Bookmark removed"})
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

	posts, username, total, err := c.service.GetUserBookmarksWithUsername(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"username":    username,
		"data":        posts,
		"total_count": total,
	})
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

	ctx.JSON(http.StatusOK, gin.H{"is_bookmarked": isBookmarked})
}
