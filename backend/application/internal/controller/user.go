package controller

import (
	"fmt"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/constants"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/middleware"
	uuid "github.com/satori/go.uuid"
)

// ==================== USER ROUTES ====================

// Register creates a new user account
func (c *Controller) Register(ctx *gin.Context) {
	var req dto.CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.Register(&req)
	if err != nil {
		log.Printf("Register controller error: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Register controller success, response type: %T", response)

	// Register always returns LoginResponse
	ctx.JSON(http.StatusCreated, response)
}

// Login authenticates a user
func (c *Controller) Login(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.Login(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Login always returns LoginResponse
	ctx.JSON(http.StatusOK, response)
}

// GoogleLogin initiates Google OAuth login
func (c *Controller) GoogleLogin(ctx *gin.Context) {
	url, err := c.service.GoogleLogin()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback handles Google OAuth callback
func (c *Controller) GoogleCallback(ctx *gin.Context) {
	code := ctx.Query("code")
	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Code not provided"})
		return
	}

	response, err := c.service.GoogleCallback(code)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Redirect to frontend with token
	baseFeURL := os.Getenv("BASE_FE_URL")
	frontendURL := fmt.Sprintf("%s/#token=%s", baseFeURL, response.Token)
	ctx.Redirect(http.StatusTemporaryRedirect, frontendURL)
}

// Logout logs out a user
func (c *Controller) Logout(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// RefreshToken refreshes JWT token
func (c *Controller) RefreshToken(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented"})
}

// GetProfile retrieves current user's profile
func (c *Controller) GetProfile(ctx *gin.Context) {
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

	response, err := c.service.GetProfile(userID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Debug log for /api/me endpoint
	log.Printf("DEBUG /api/me response: ID=%s, Username='%s', Email='%s'",
		response.ID, response.Username, response.Email)

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// GetUserProfileByUsername retrieves user profile by username (public endpoint)
func (c *Controller) GetUserProfileByUsername(ctx *gin.Context) {
	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	// Get user by username
	user, err := c.service.GetUserByUsername(username)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

// UpdateProfile updates current user's profile (supports both JSON and multipart form for avatar)
func (c *Controller) UpdateProfile(ctx *gin.Context) {
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

	// Check content type to determine how to parse request
	contentType := ctx.GetHeader("Content-Type")

	var req dto.UpdateUserRequest
	var avatarFile *multipart.FileHeader

	if strings.Contains(contentType, "multipart/form-data") {
		// Handle multipart form (with potential avatar upload)
		ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, 10<<20) // 10MB limit
		if err := ctx.Request.ParseMultipartForm(10 << 20); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data"})
			return
		}

		// Parse form fields
		req.Name = ctx.PostForm("name")
		req.Bio = ctx.PostForm("bio")
		req.AvatarURL = ctx.PostForm("avatar_url") // Keep existing if no new avatar

		// Check for avatar file
		if file, err := ctx.FormFile("avatar"); err == nil && file.Size > 0 {
			avatarFile = file
		}
	} else {
		// Handle JSON request (traditional update)
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
	}

	response, err := c.service.UpdateProfileWithAvatar(ctx.Request.Context(), userID, &req, avatarFile)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// GetUser retrieves a user by ID
func (c *Controller) GetUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	response, err := c.service.GetUser(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

// GetAllUsers retrieves all users (admin only)
func (c *Controller) GetAllUsers(ctx *gin.Context) {
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

	responses, total, err := c.service.GetAllUsers(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Ensure data is never null - use empty array if nil
	if responses == nil {
		responses = []*dto.UserResponse{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":        responses,
		"total_count": total,
		"limit":       req.Limit,
		"offset":      req.Offset,
	})
}

// DeleteUser deletes a user (admin only)
func (c *Controller) DeleteUser(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	err = c.service.DeleteUser(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// DebugJWT tests JWT generation
func (c *Controller) DebugJWT(ctx *gin.Context) {
	userIDStr := ctx.Query("user_id")
	
	var user *entities.User
	var err error
	
	if userIDStr != "" {
		// Generate token for specific user
		userID, err := uuid.FromString(userIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}
		
		user, err = c.service.GetUserByID(userID)
		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
	} else {
		// Create a test user
		user = &entities.User{
			ID:    uuid.NewV4(),
			Email: "debug@example.com",
			Name:  "Debug User",
			Role:  constants.RoleUser,
		}
	}

	log.Printf("DebugJWT: Testing JWT generation for user: %+v", user)

	// Test JWT generation
	token, err := middleware.GenerateJWT(user)
	if err != nil {
		log.Printf("DebugJWT: JWT generation failed: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "JWT generation failed"})
		return
	}

	log.Printf("DebugJWT: JWT generation successful: %s", token[:20]+"...")

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   token,
		"user":    user,
	})
}

// DeleteProfile deletes current user's profile
func (c *Controller) DeleteProfile(ctx *gin.Context) {
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

	err = c.service.DeleteProfile(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Profile deleted successfully"})
}
