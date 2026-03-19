package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/service"
	uuid "github.com/satori/go.uuid"
)

// Controller aggregates domain-specific controllers.
// Each sub-controller depends only on the interface it needs (ISP).
type Controller struct {
	Auth       *AuthController
	User       *UserController
	Post       *PostController
	Comment    *CommentController
	Engagement *EngagementController
	Bookmark   *BookmarkController
	Category   *CategoryController
	Tag        *TagController
	Image      *ImageController
	Search     *SearchController
	Home       *HomeController
}

func NewController(svc service.Service) *Controller {
	return &Controller{
		Auth:       &AuthController{svc: svc},
		User:       &UserController{svc: svc},
		Post:       &PostController{svc: svc, engagement: svc, user: svc},
		Comment:    &CommentController{svc: svc},
		Engagement: &EngagementController{svc: svc, post: svc, comment: svc},
		Bookmark:   &BookmarkController{svc: svc},
		Category:   &CategoryController{svc: svc},
		Tag:        &TagController{svc: svc},
		Image:      &ImageController{svc: svc},
		Search:     &SearchController{svc: svc},
		Home:       &HomeController{svc: svc},
	}
}

// --- Shared helpers ---

func respondError(ctx *gin.Context, err error) {
	ctx.JSON(apperror.HTTPCode(err), gin.H{"error": apperror.UserMessage(err)})
}

func parsePagination(ctx *gin.Context) (*dto.PaginationRequest, error) {
	var req dto.PaginationRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		return nil, err
	}
	if req.Page > 0 && req.Limit > 0 {
		req.Offset = (req.Page - 1) * req.Limit
	}
	if req.Limit == 0 {
		req.Limit = 10
	}
	return &req, nil
}

func requireUserID(ctx *gin.Context) (uuid.UUID, bool) {
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return uuid.Nil, false
	}
	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return uuid.Nil, false
	}
	return userID, true
}

func optionalUserID(ctx *gin.Context) (uuid.UUID, bool) {
	userIDStr, exists := ctx.Get("userID")
	if !exists {
		return uuid.Nil, false
	}
	userID, err := uuid.FromString(userIDStr.(string))
	if err != nil {
		return uuid.Nil, false
	}
	return userID, true
}

func ensureNotNil[T any](slice []T) []T {
	if slice == nil {
		return []T{}
	}
	return slice
}
