package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/service"
	uuid "github.com/satori/go.uuid"
)

type SearchController struct {
	svc service.SearchService
}

func (c *SearchController) SearchPosts(ctx *gin.Context) {
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

	searchClient := c.svc.GetSearchClient()
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
			ID: postID, Title: searchPost.Title, Slug: searchPost.Slug,
			Excerpt: searchPost.Excerpt,
			CreatedAt: searchPost.CreatedAt, UpdatedAt: searchPost.CreatedAt,
			Views: searchPost.Views,
			CommentsCount: searchPost.CommentsCount,
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
