package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
	"github.com/pdhoang91/blog/internal/service"
	appError "github.com/pdhoang91/blog/pkg/error"
	uuid "github.com/satori/go.uuid"
)

// Controller is the main controller that handles all HTTP requests
type Controller struct {
	service *service.InsightService
}

// NewController creates a new controller with the insight service
func NewController(service *service.InsightService) *Controller {
	return &Controller{
		service: service,
	}
}

// Success sends a successful response
func (c *Controller) Success(ctx *gin.Context, data interface{}) {
	// For auth responses, return as-is
	if loginResp, ok := data.(*model.LoginResponse); ok {
		ctx.JSON(http.StatusOK, loginResp)
		return
	}

	// Ensure data is never null - use empty array if nil and it's expected to be an array
	if data == nil {
		data = []interface{}{}
	}

	// For other responses, wrap in data field
	response := gin.H{
		"data": data,
	}
	ctx.JSON(http.StatusOK, response)
}

// SuccessWithStatus sends a successful response with custom status code
func (c *Controller) SuccessWithStatus(ctx *gin.Context, statusCode int, data interface{}) {
	// For auth responses, return as-is
	if loginResp, ok := data.(*model.LoginResponse); ok {
		ctx.JSON(statusCode, loginResp)
		return
	}

	// Ensure data is never null - use empty array if nil and it's expected to be an array
	if data == nil {
		data = []interface{}{}
	}

	// For other responses, wrap in data field
	response := gin.H{
		"data": data,
	}
	ctx.JSON(statusCode, response)
}

// PaginatedSuccess sends a successful paginated response
func (c *Controller) PaginatedSuccess(ctx *gin.Context, data interface{}, total int64, limit, offset int) {
	// Ensure data is never null - use empty array if nil or empty slice
	if data == nil {
		data = []interface{}{}
	} else {
		// Check if it's an empty slice and convert to empty array for JSON
		switch v := data.(type) {
		case []*model.PostResponse:
			if len(v) == 0 {
				data = []interface{}{}
			}
		case []*model.CategoryResponse:
			if len(v) == 0 {
				data = []interface{}{}
			}
		case []*model.TagResponse:
			if len(v) == 0 {
				data = []interface{}{}
			}
		case []*model.CommentResponse:
			if len(v) == 0 {
				data = []interface{}{}
			}
		}
	}

	response := gin.H{
		"data":        data,
		"total_count": total,
		"limit":       limit,
		"offset":      offset,
	}
	ctx.JSON(http.StatusOK, response)
}

// Error sends an error response
func (c *Controller) Error(ctx *gin.Context, err error) {
	if appErr, ok := err.(*appError.AppError); ok {
		response := model.ErrorResponse{
			Status:  "error",
			Code:    appErr.Code,
			Message: appErr.Message,
		}
		ctx.JSON(appErr.Code, response)
		return
	}

	// Default internal server error
	response := model.ErrorResponse{
		Status:  "error",
		Code:    http.StatusInternalServerError,
		Message: "Internal server error",
	}
	ctx.JSON(http.StatusInternalServerError, response)
}

// BindAndValidate binds and validates request data
func (c *Controller) BindAndValidate(ctx *gin.Context, req interface{}) error {
	if err := ctx.ShouldBindJSON(req); err != nil {
		return appError.BadRequest("Invalid request data", err)
	}
	return nil
}

// BindAndValidateQuery binds and validates query parameters
func (c *Controller) BindAndValidateQuery(ctx *gin.Context, req interface{}) error {
	if err := ctx.ShouldBindQuery(req); err != nil {
		return appError.BadRequest("Invalid query parameters", err)
	}

	// Convert page-based pagination to offset-based
	if paginationReq, ok := req.(*model.PaginationRequest); ok {
		if paginationReq.Page > 0 && paginationReq.Limit > 0 {
			paginationReq.Offset = (paginationReq.Page - 1) * paginationReq.Limit
		}
		if paginationReq.Limit == 0 {
			paginationReq.Limit = 10 // Default limit
		}
	}

	return nil
}

// GetUserIDFromContext extracts user ID from context (from auth middleware)
func (c *Controller) GetUserIDFromContext(ctx *gin.Context) (string, error) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		return "", appError.Unauthorized("User not authenticated", nil)
	}

	userIDStr, ok := userID.(string)
	if !ok {
		return "", appError.InternalServerError("Invalid user ID format", nil)
	}

	return userIDStr, nil
}

// ParseUUID parses string to UUID
func (c *Controller) ParseUUID(idStr string) (uuid.UUID, error) {
	id, err := uuid.FromString(idStr)
	if err != nil {
		return uuid.Nil, appError.BadRequest("Invalid ID format", err)
	}
	return id, nil
}
