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
	response := model.SuccessResponse{
		Status: "success",
		Code:   http.StatusOK,
		Data:   data,
	}
	ctx.JSON(http.StatusOK, response)
}

// SuccessWithStatus sends a successful response with custom status code
func (c *Controller) SuccessWithStatus(ctx *gin.Context, statusCode int, data interface{}) {
	response := model.SuccessResponse{
		Status: "success",
		Code:   statusCode,
		Data:   data,
	}
	ctx.JSON(statusCode, response)
}

// PaginatedSuccess sends a successful paginated response
func (c *Controller) PaginatedSuccess(ctx *gin.Context, data interface{}, total int64, limit, offset int) {
	response := model.PaginatedResponse{
		Status: "success",
		Code:   http.StatusOK,
		Data:   data,
		Meta: model.MetaData{
			Total:  total,
			Limit:  limit,
			Offset: offset,
		},
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
