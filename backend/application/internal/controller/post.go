package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/service"
	uuid "github.com/satori/go.uuid"
)

type PostController struct {
	svc        service.PostService
	engagement service.EngagementService
	user       service.UserService
}

func (c *PostController) CreatePost(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	var req dto.CreatePostRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.svc.CreatePost(userID, &req)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"data": response})
}

func (c *PostController) GetPost(ctx *gin.Context) {
	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	response, err := c.svc.GetPost(id)
	if err != nil {
		respondError(ctx, err)
		return
	}

	var hasClapped bool
	if userID, ok := optionalUserID(ctx); ok {
		hasClapped, _ = c.engagement.HasUserClappedPost(userID, id)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": map[string]interface{}{"post": response, "has_clapped": hasClapped},
	})
}

func (c *PostController) ListPosts(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.svc.ListPosts(req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *PostController) UpdatePost(ctx *gin.Context) {
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

	response, err := c.svc.UpdatePost(userID, id, &req)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *PostController) DeletePost(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	if err := c.svc.DeletePost(userID, id); err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

func (c *PostController) GetLatestPosts(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, err := c.svc.GetLatestPosts(req.Limit)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": int64(len(responses)),
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *PostController) GetUserPosts(ctx *gin.Context) {
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

	responses, total, err := c.svc.GetUserPosts(userID, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *PostController) GetUserPostsByUsername(ctx *gin.Context) {
	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	user, err := c.user.GetUserByUsername(username)
	if err != nil {
		respondError(ctx, err)
		return
	}

	req, pErr := parsePagination(ctx)
	if pErr != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.svc.GetUserPosts(user.ID, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *PostController) GetPostByTitleName(ctx *gin.Context) {
	slug := ctx.Param("titleName")
	if slug == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Slug is required"})
		return
	}

	response, err := c.svc.GetPostBySlug(slug)
	if err != nil {
		respondError(ctx, err)
		return
	}

	var hasClapped bool
	if userID, ok := optionalUserID(ctx); ok {
		if postID, err := uuid.FromString(response.ID.String()); err == nil {
			hasClapped, _ = c.engagement.HasUserClappedPost(userID, postID)
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": gin.H{"post": response, "has_clapped": hasClapped},
	})
}

func (c *PostController) GetPostsByCategory(ctx *gin.Context) {
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

	responses, total, err := c.svc.GetPostsByCategory(categoryName, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *PostController) GetPostsByTag(ctx *gin.Context) {
	tagName := ctx.Param("name")
	if tagName == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Tag name is required"})
		return
	}

	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, total, err := c.svc.GetPostsByTag(tagName, req)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": total,
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *PostController) GetPopularPosts(ctx *gin.Context) {
	req, err := parsePagination(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	responses, err := c.svc.GetPopularPosts(req.Limit)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": ensureNotNil(responses), "total_count": int64(len(responses)),
		"limit": req.Limit, "offset": req.Offset,
	})
}

func (c *PostController) GetPostsByYearMonth(ctx *gin.Context) {
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

	responses, total, err := c.svc.GetPostsByYearMonth(year, month, req)
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
