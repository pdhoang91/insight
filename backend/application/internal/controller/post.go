package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	uuid "github.com/satori/go.uuid"
)

// ==================== POST ROUTES ====================

func (c *Controller) CreatePost(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	var req dto.CreatePostRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.CreatePost(userID, &req)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

func (c *Controller) GetPost(ctx *gin.Context) {
	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	response, err := c.service.GetPost(id)
	if err != nil {
		respondError(ctx, err)
		return
	}

	var hasClapped bool
	if userID, ok := optionalUserID(ctx); ok {
		hasClapped, _ = c.service.HasUserClappedPost(userID, id)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]interface{}{"post": response, "has_clapped": hasClapped},
	})
}

func (c *Controller) ListPosts(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.service.ListPosts(req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) UpdatePost(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	id, err := uuid.FromString(ctx.Param("id"))
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
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *Controller) DeletePost(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	if err := c.service.DeletePost(userID, id); err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

// TestDeletePost tests soft delete functionality without auth checks (for development)
func (c *Controller) TestDeletePost(ctx *gin.Context) {
	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	post, err := c.service.GetPostEntity(id)
	if err != nil {
		respondError(ctx, err)
		return
	}

	if err := c.service.DeletePost(post.UserID, id); err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Post soft deleted successfully (test)"})
}

func (c *Controller) GetLatestPosts(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, err := c.service.GetLatestPosts(req.Limit)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": int64(len(responses)),
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) GetRecentPosts(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, err := c.service.GetRecentPosts(req.Limit)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": int64(len(responses)),
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) GetUserPosts(ctx *gin.Context) {
	userID, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	req, pErr := parsePagination(ctx)
	if pErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.service.GetUserPosts(userID, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) GetUserPostsByUsername(ctx *gin.Context) {
	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	user, err := c.service.GetUserByUsername(username)
	if err != nil {
		respondError(ctx, err)
		return
	}

	req, pErr := parsePagination(ctx)
	if pErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.service.GetUserPosts(user.ID, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) GetPostByTitleName(ctx *gin.Context) {
	titleName := ctx.Param("titleName")
	if titleName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Title name is required"})
		return
	}

	response, err := c.service.GetPostByTitleName(titleName)
	if err != nil {
		respondError(ctx, err)
		return
	}

	var hasClapped bool
	if userID, ok := optionalUserID(ctx); ok {
		if postID, err := uuid.FromString(response.ID.String()); err == nil {
			hasClapped, _ = c.service.HasUserClappedPost(userID, postID)
		}
	}

	// Frontend expects { data: { post: ..., has_clapped: ... } }
	ctx.JSON(http.StatusOK, gin.H{
		"data": gin.H{"post": response, "has_clapped": hasClapped},
	})
}

func (c *Controller) GetPostsByCategory(ctx *gin.Context) {
	categoryName := ctx.Param("name")
	if categoryName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Category name is required"})
		return
	}

	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.service.GetPostsByCategory(categoryName, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) GetPopularPosts(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, err := c.service.GetPopularPosts(req.Limit)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": int64(len(responses)),
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *Controller) GetTopPosts(ctx *gin.Context) {
	c.GetPopularPosts(ctx)
}

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
	if req.Page == 0 {
		req.Page = 1
	}
	if req.Limit == 0 {
		req.Limit = 10
	}

	searchClient := c.service.GetSearchClient()
	searchResp, err := searchClient.SearchPosts(query, req.Page, req.Limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Search service unavailable", "details": err.Error()})
		return
	}

	var responses []*dto.PostResponse
	for _, searchPost := range searchResp.Data {
		postID, err := uuid.FromString(searchPost.ID)
		if err != nil {
			continue
		}

		postResp := &dto.PostResponse{
			ID: postID, Title: searchPost.Title, TitleName: searchPost.TitleName,
			PreviewContent: searchPost.PreviewContent, Content: searchPost.Content,
			CreatedAt: searchPost.CreatedAt, UpdatedAt: searchPost.CreatedAt,
			Views: searchPost.Views, ClapCount: searchPost.ClapCount,
			CommentsCount: searchPost.CommentsCount, AverageRating: searchPost.AverageRating,
		}

		for _, tagName := range searchPost.Tags {
			postResp.Tags = append(postResp.Tags, &dto.TagResponse{Name: tagName})
		}
		for _, categoryName := range searchPost.Categories {
			postResp.Categories = append(postResp.Categories, &dto.CategoryResponse{Name: categoryName})
		}

		if searchPost.User.ID != "" {
			if userID, err := uuid.FromString(searchPost.User.ID); err == nil {
				postResp.User = &dto.UserResponse{
					ID: userID, Email: searchPost.User.Email, Name: searchPost.User.Name,
					Username: searchPost.User.Username, AvatarURL: searchPost.User.AvatarURL,
					Bio: searchPost.User.Bio, Phone: searchPost.User.Phone,
					Dob: searchPost.User.Dob, Role: searchPost.User.Role,
				}
			}
		}
		responses = append(responses, postResp)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": searchResp.TotalCount,
		"limit": req.Limit, "offset": (req.Page - 1) * req.Limit,
	})
}

func (c *Controller) ClapPost(ctx *gin.Context) {
	postID, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	isClapped, err := c.service.ClapPost(userID, postID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	postResponse, err := c.service.GetPost(postID)
	if err != nil {
		ctx.JSON(http.StatusOK, gin.H{"clapped": isClapped, "message": "Post clapped successfully"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"clapped": isClapped, "clap_count": postResponse.ClapCount,
		"message": "Post clapped successfully",
	})
}

func (c *Controller) GetPostsByYearMonth(ctx *gin.Context) {
	year, err := strconv.Atoi(ctx.Param("year"))
	if err != nil || year < 1900 || year > 2100 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}

	month, err := strconv.Atoi(ctx.Param("month"))
	if err != nil || month < 1 || month > 12 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month"})
		return
	}

	req, pErr := parsePagination(ctx)
	if pErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}
	if req.Limit == 0 {
		req.Limit = 20
	}

	responses, total, err := c.service.GetPostsByYearMonth(year, month, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"year": year, "month": month,
		"limit": req.Limit, "offset": req.Offset,
	})
}
