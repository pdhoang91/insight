package controller

import (
	"net/http"

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

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
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

// GetPostByTitleName retrieves a post by title name (for frontend compatibility)
func (c *Controller) GetPostByTitleName(ctx *gin.Context) {
	titleName := ctx.Param("titleName")
	if titleName == "" {
		c.Error(ctx, appError.BadRequest("Title name is required", nil))
		return
	}

	response, err := c.service.GetPostByTitleName(titleName)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Frontend expects { data: { post: ... } }
	result := gin.H{
		"data": gin.H{
			"post": response,
		},
	}

	ctx.JSON(http.StatusOK, result)
}

// UpdatePost updates a post by ID
func (c *Controller) UpdatePost(ctx *gin.Context) {
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

	idParam := ctx.Param("id")
	postID, err := c.ParseUUID(idParam)
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

	idParam := ctx.Param("id")
	postID, err := c.ParseUUID(idParam)
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

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}

// SearchPosts searches for posts
func (c *Controller) SearchPosts(ctx *gin.Context) {
	query := ctx.Query("q")
	if query == "" {
		c.Error(ctx, appError.BadRequest("Query parameter 'q' is required", nil))
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

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}

// GetLatestPosts retrieves latest posts
func (c *Controller) GetLatestPosts(ctx *gin.Context) {
	limit := 5
	responses, err := c.service.GetLatestPosts(limit)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, responses)
}

// GetRecentPosts retrieves recent posts (alias for GetLatestPosts)
func (c *Controller) GetRecentPosts(ctx *gin.Context) {
	c.GetLatestPosts(ctx)
}

// GetPopularPosts retrieves popular posts
func (c *Controller) GetPopularPosts(ctx *gin.Context) {
	limit := 5
	responses, err := c.service.GetPopularPosts(limit)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, responses)
}

// GetTopPosts retrieves top posts (alias for GetPopularPosts)
func (c *Controller) GetTopPosts(ctx *gin.Context) {
	c.GetPopularPosts(ctx)
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

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}

// SearchAll searches across all content
func (c *Controller) SearchAll(ctx *gin.Context) {
	query := ctx.Query("q")
	if query == "" {
		c.Error(ctx, appError.BadRequest("Query parameter 'q' is required", nil))
		return
	}

	response, err := c.service.SearchAll(query)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// GetUserPostsByUsername retrieves posts by username (for frontend compatibility)
func (c *Controller) GetUserPostsByUsername(ctx *gin.Context) {
	username := ctx.Param("username")
	if username == "" {
		c.Error(ctx, appError.BadRequest("Username is required", nil))
		return
	}

	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	// Get user by username first
	user, err := c.service.GetUserByUsername(username)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Get user posts
	responses, total, err := c.service.GetUserPosts(user.ID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}
