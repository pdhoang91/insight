package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/service"
	uuid "github.com/satori/go.uuid"
)

// Controller is the main controller that handles all HTTP requests.
// It depends on the Service interface for testability.
type Controller struct {
	service service.Service
}

// NewController creates a new controller instance
func NewController(svc service.Service) *Controller {
	return &Controller{service: svc}
}

// respondError maps AppError to HTTP response
func respondError(ctx *gin.Context, err error) {
	ctx.JSON(apperror.HTTPCode(err), gin.H{"error": apperror.UserMessage(err)})
}

// parsePagination extracts and normalizes pagination from query params
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

// requireUserID extracts authenticated user ID from context
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

// optionalUserID extracts user ID if authenticated, returns nil UUID if not
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

// ensureNotNil returns empty slice if input is nil (prevents null in JSON)
func ensureNotNil[T any](slice []T) []T {
	if slice == nil {
		return []T{}
	}
	return slice
}
