package controller

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/model"
	appError "github.com/pdhoang91/blog/pkg/error"
)

// ==================== USER ROUTES ====================

// Register creates a new user account
func (c *Controller) Register(ctx *gin.Context) {
	var req model.CreateUserRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.Register(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.SuccessWithStatus(ctx, http.StatusCreated, response)
}

// Login authenticates a user
func (c *Controller) Login(ctx *gin.Context) {
	var req model.LoginRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.Login(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// GoogleLogin initiates Google OAuth login
func (c *Controller) GoogleLogin(ctx *gin.Context) {
	url, err := c.service.GoogleLogin()
	if err != nil {
		c.Error(ctx, err)
		return
	}

	ctx.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback handles Google OAuth callback
func (c *Controller) GoogleCallback(ctx *gin.Context) {
	code := ctx.Query("code")
	if code == "" {
		c.Error(ctx, appError.BadRequest("Authorization code not provided", nil))
		return
	}

	response, err := c.service.GoogleCallback(code)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	// Redirect to frontend with token
	baseFeURL := os.Getenv("BASE_FE_URL")
	if baseFeURL == "" {
		baseFeURL = "http://localhost:3000"
	}
	frontendURL := fmt.Sprintf("%s/#token=%s", baseFeURL, response.Token)
	ctx.Redirect(http.StatusTemporaryRedirect, frontendURL)
}

// Logout handles user logout
func (c *Controller) Logout(ctx *gin.Context) {
	err := c.service.Logout()
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "Logged out successfully"})
}

// RefreshToken handles token refresh
func (c *Controller) RefreshToken(ctx *gin.Context) {
	err := c.service.RefreshToken()
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "Token refreshed successfully"})
}

// GetUser retrieves a user by ID
func (c *Controller) GetUser(ctx *gin.Context) {
	idParam := ctx.Param("id")
	userID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.GetUser(userID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// GetProfile retrieves the current user's profile
func (c *Controller) GetProfile(ctx *gin.Context) {
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

	response, err := c.service.GetProfile(userID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// UpdateProfile updates the current user's profile
func (c *Controller) UpdateProfile(ctx *gin.Context) {
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

	var req model.UpdateUserRequest
	if err := c.BindAndValidate(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	response, err := c.service.UpdateProfile(userID, &req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, response)
}

// DeleteProfile deletes the current user's account
func (c *Controller) DeleteProfile(ctx *gin.Context) {
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

	err = c.service.DeleteProfile(userID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.SuccessWithStatus(ctx, http.StatusNoContent, nil)
}

// GetAllUsers retrieves all users (admin only)
func (c *Controller) GetAllUsers(ctx *gin.Context) {
	var req model.PaginationRequest
	if err := c.BindAndValidateQuery(ctx, &req); err != nil {
		c.Error(ctx, err)
		return
	}

	responses, total, err := c.service.GetAllUsers(&req)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.PaginatedSuccess(ctx, responses, total, req.Limit, req.Offset)
}

// DeleteUser deletes a user by ID (admin only)
func (c *Controller) DeleteUser(ctx *gin.Context) {
	idParam := ctx.Param("id")
	userID, err := c.ParseUUID(idParam)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	err = c.service.DeleteUser(userID)
	if err != nil {
		c.Error(ctx, err)
		return
	}

	c.Success(ctx, gin.H{"message": "User deleted successfully"})
}
