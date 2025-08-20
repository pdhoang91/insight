package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
)

// ==================== POST ROUTES ====================

// CreatePost creates a new post
func (c *Controller) CreatePost(ctx *gin.Context) {
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

	var req model.CreatePostRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.CreatePost(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.SuccessWithStatus(ctx, http.StatusCreated, response)
}

// ListPosts retrieves all posts with pagination
func (c *Controller) ListPosts(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.ListPosts(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if responses == nil {
		responses = []*model.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
	})
}

// GetPost retrieves a post by ID
func (c *Controller) GetPost(ctx *gin.Context) {
	idParam := ctx.Param("id")
	postID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.GetPost(postID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// UpdatePost updates a post by ID
func (c *Controller) UpdatePost(ctx *gin.Context) {
	idParam := ctx.Param("id")
	postID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

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

	var req model.UpdatePostRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.UpdatePost(userID, postID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// DeletePost deletes a post by ID
func (c *Controller) DeletePost(ctx *gin.Context) {
	idParam := ctx.Param("id")
	postID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

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

	err = c.service.DeletePost(userID, postID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "Post deleted successfully"})
}

// GetUserPosts retrieves posts by user ID
func (c *Controller) GetUserPosts(ctx *gin.Context) {
	idParam := ctx.Param("id")
	userID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.GetUserPosts(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if responses == nil {
		responses = []*model.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
	})
}

// SearchPosts searches for posts
func (c *Controller) SearchPosts(ctx *gin.Context) {
	query := ctx.Query("q")
	if query == "" {
		c.Error(ctx, appError.BadRequest("Search query is required", nil))
		return
	}

	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.SearchPosts(query, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if responses == nil {
		responses = []*model.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
	})
}

// SearchAll searches across all content
func (c *Controller) SearchAll(ctx *gin.Context) {
	query := ctx.Query("q")
	if query == "" {
		c.Error(ctx, appError.BadRequest("Search query is required", nil))
		return
	}

	response, err := c.service.SearchAll(query)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// GetAllPosts retrieves all posts (admin only)
func (c *Controller) GetAllPosts(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.GetAllPosts(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if responses == nil {
		responses = []*model.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
	})
}

// GetLatestPosts handles GET /posts/latest
func (c *Controller) GetLatestPosts(ctx *gin.Context) {
	limitStr := ctx.DefaultQuery("limit", "5")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 5
	}

	posts, err := c.service.GetLatestPosts(limit)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if posts == nil {
		posts = []*model.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": posts,
	})
}

// GetPopularPosts handles GET /posts/popular
func (c *Controller) GetPopularPosts(ctx *gin.Context) {
	limitStr := ctx.DefaultQuery("limit", "5")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 5
	}

	posts, err := c.service.GetPopularPosts(limit)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if posts == nil {
		posts = []*model.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": posts,
	})
}

// GetRecentPosts handles GET /posts/recent
func (c *Controller) GetRecentPosts(ctx *gin.Context) {
	limitStr := ctx.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	posts, err := c.service.GetRecentPosts(limit)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if posts == nil {
		posts = []*model.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": posts,
	})
}

// GetTopPosts handles GET /posts/top
func (c *Controller) GetTopPosts(ctx *gin.Context) {
	limitStr := ctx.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	posts, err := c.service.GetTopPosts(limit)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Ensure data is never null
	if posts == nil {
		posts = []*model.PostResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": posts,
	})
}
