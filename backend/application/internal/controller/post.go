package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	uuid "github.com/satori/go.uuid"
)

// ==================== POST ROUTES ====================

// CreatePost creates a new post
func (c *Controller) CreatePost(ctx *gin.Context) {
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

	var req dto.CreatePostRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.CreatePost(userID, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

// GetPost retrieves a post by ID
func (c *Controller) GetPost(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	response, err := c.service.GetPost(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Check if user has clapped this post (if authenticated)
	var hasClapped bool
	if userIDStr, exists := ctx.Get("userID"); exists {
		if userID, err := uuid.FromString(userIDStr.(string)); err == nil {
			hasClapped, _ = c.service.HasUserClappedPost(userID, id)
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]interface{}{
			"post":        response,
			"has_clapped": hasClapped,
		},
	})
}

// ListPosts retrieves all posts with pagination
func (c *Controller) ListPosts(ctx *gin.Context) {
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

	responses, total, err := c.service.ListPosts(&req)
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

// UpdatePost updates a post
func (c *Controller) UpdatePost(ctx *gin.Context) {
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

	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var req dto.UpdatePostRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.UpdatePost(userID, id, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// DeletePost deletes a post
func (c *Controller) DeletePost(ctx *gin.Context) {
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

	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	err = c.service.DeletePost(userID, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

// TestDeletePost tests soft delete functionality without auth checks (for development)
func (c *Controller) TestDeletePost(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Get the post to find its owner
	post, err := c.service.GetPostEntity(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Use the post owner's ID for the delete operation
	err = c.service.DeletePost(post.UserID, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Post soft deleted successfully (test)"})
}

// GetLatestPosts retrieves latest posts
func (c *Controller) GetLatestPosts(ctx *gin.Context) {
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

	responses, err := c.service.GetLatestPosts(req.Limit)
	total := int64(len(responses))
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

// GetRecentPosts retrieves recent posts
func (c *Controller) GetRecentPosts(ctx *gin.Context) {
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

	responses, err := c.service.GetRecentPosts(req.Limit)
	total := int64(len(responses))
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

// GetUserPosts retrieves posts by user ID
func (c *Controller) GetUserPosts(ctx *gin.Context) {
	userIDStr := ctx.Param("id")
	userID, err := uuid.FromString(userIDStr)
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

	responses, total, err := c.service.GetUserPosts(userID, &req)
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

// GetUserPostsByUsername retrieves posts by username
func (c *Controller) GetUserPostsByUsername(ctx *gin.Context) {
	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	// Get user by username first
	user, err := c.service.GetUserByUsername(username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
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

	responses, total, err := c.service.GetUserPosts(user.ID, &req)
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

// GetPostByTitleName retrieves a post by title name
func (c *Controller) GetPostByTitleName(ctx *gin.Context) {
	titleName := ctx.Param("titleName")
	if titleName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Title name is required"})
		return
	}

	response, err := c.service.GetPostByTitleName(titleName)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Check if user has clapped this post (if authenticated)
	var hasClapped bool
	if userIDStr, exists := ctx.Get("userID"); exists {
		if userID, err := uuid.FromString(userIDStr.(string)); err == nil {
			// Get post ID from response
			if postID, err := uuid.FromString(response.ID.String()); err == nil {
				hasClapped, _ = c.service.HasUserClappedPost(userID, postID)
			}
		}
	}

	// Frontend expects { data: { post: ..., has_clapped: ... } }
	ctx.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"post":        response,
			"has_clapped": hasClapped,
		},
	})
}

// GetPostsByCategory retrieves posts by category
func (c *Controller) GetPostsByCategory(ctx *gin.Context) {
	categoryName := ctx.Param("name")
	if categoryName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Category name is required"})
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

	responses, total, err := c.service.GetPostsByCategory(categoryName, &req)
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

// GetPopularPosts retrieves popular posts
func (c *Controller) GetPopularPosts(ctx *gin.Context) {
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

	responses, err := c.service.GetPopularPosts(req.Limit)
	total := int64(len(responses))
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

// GetTopPosts retrieves top posts (alias for popular posts)
func (c *Controller) GetTopPosts(ctx *gin.Context) {
	c.GetPopularPosts(ctx)
}

// SearchPosts searches posts by query - proxies to search service
func (c *Controller) SearchPosts(ctx *gin.Context) {
	query := ctx.Query("q")
	if query == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	// Set defaults
	if req.Page == 0 {
		req.Page = 1
	}
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Call search service via HTTP client
	searchClient := c.service.GetSearchClient()
	searchResp, err := searchClient.SearchPosts(query, req.Page, req.Limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Search service unavailable", "details": err.Error()})
		return
	}

	// Convert search service response to our DTO format
	var responses []*dto.PostResponse
	for _, searchPost := range searchResp.Data {
		// Parse UUID from string
		postID, err := uuid.FromString(searchPost.ID)
		if err != nil {
			continue // Skip invalid posts
		}

		postResp := &dto.PostResponse{
			ID:             postID,
			Title:          searchPost.Title,
			TitleName:      searchPost.TitleName,
			PreviewContent: searchPost.PreviewContent,
			Content:        searchPost.Content,
			CreatedAt:      searchPost.CreatedAt,
			UpdatedAt:      searchPost.CreatedAt, // Use CreatedAt as fallback for UpdatedAt
			Views:          searchPost.Views,
			ClapCount:      searchPost.ClapCount,
			CommentsCount:  searchPost.CommentsCount,
			AverageRating:  searchPost.AverageRating,
		}

		// Convert tags from []string to []*dto.TagResponse
		for _, tagName := range searchPost.Tags {
			postResp.Tags = append(postResp.Tags, &dto.TagResponse{
				Name: tagName,
			})
		}

		// Convert categories from []string to []*dto.CategoryResponse
		for _, categoryName := range searchPost.Categories {
			postResp.Categories = append(postResp.Categories, &dto.CategoryResponse{
				Name: categoryName,
			})
		}

		// Map user info
		if searchPost.User.ID != "" {
			userID, err := uuid.FromString(searchPost.User.ID)
			if err == nil {
				postResp.User = &dto.UserResponse{
					ID:        userID,
					Email:     searchPost.User.Email,
					Name:      searchPost.User.Name,
					Username:  searchPost.User.Username,
					AvatarURL: searchPost.User.AvatarURL,
					Bio:       searchPost.User.Bio,
					Phone:     searchPost.User.Phone,
					Dob:       searchPost.User.Dob,
					Role:      searchPost.User.Role,
				}
			}
		}

		responses = append(responses, postResp)
	}

	// Ensure data is never null - use empty array if nil
	if responses == nil {
		responses = []*dto.PostResponse{}
	}

	// Calculate offset for compatibility
	offset := (req.Page - 1) * req.Limit

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": searchResp.TotalCount,
		"limit":       req.Limit,
		"offset":      offset,
	})
}

// ClapPost handles clap/unclap action for a post
func (c *Controller) ClapPost(ctx *gin.Context) {
	// Get post ID from URL
	postIDStr := ctx.Param("id")
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Get user ID from context (authentication required)
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

	// Toggle clap
	isClapped, err := c.service.ClapPost(userID, postID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clap post"})
		return
	}

	// Get updated post with clap count
	postResponse, err := c.service.GetPost(postID)
	if err != nil {
		// If we can't get updated post, just return clap status
		ctx.JSON(http.StatusOK, gin.H{
			"clapped": isClapped,
			"message": "Post clapped successfully",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"clapped":    isClapped,
		"clap_count": postResponse.ClapCount,
		"message":    "Post clapped successfully",
	})
}
