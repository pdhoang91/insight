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

func (c *Controller) Register(ctx *gin.Context) {
	var req dto.CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.Register(&req)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusCreated, response)
}

func (c *Controller) Login(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	response, err := c.service.Login(&req)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, response)
}

func (c *Controller) GoogleLogin(ctx *gin.Context) {
	url, err := c.service.GoogleLogin()
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.Redirect(http.StatusTemporaryRedirect, url)
}

func (c *Controller) GoogleCallback(ctx *gin.Context) {
	code := ctx.Query("code")
	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Code not provided"})
		return
	}

	response, err := c.service.GoogleCallback(code)
	if err != nil {
		respondError(ctx, err)
		return
	}

	baseFeURL := os.Getenv("BASE_FE_URL")
	frontendURL := fmt.Sprintf("%s/#token=%s", baseFeURL, response.Token)
	ctx.Redirect(http.StatusTemporaryRedirect, frontendURL)
}

func (c *Controller) Logout(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (c *Controller) RefreshToken(ctx *gin.Context) {
	ctx.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented"})
}

func (c *Controller) GetProfile(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	response, err := c.service.GetProfile(userID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	log.Printf("DEBUG /api/me response: ID=%s, Username='%s', Email='%s'",
		response.ID, response.Username, response.Email)
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *Controller) GetUserProfileByUsername(ctx *gin.Context) {
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
	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

func (c *Controller) UpdateProfile(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	contentType := ctx.GetHeader("Content-Type")
	var req dto.UpdateUserRequest
	var avatarFile *multipart.FileHeader

	if strings.Contains(contentType, "multipart/form-data") {
		ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, 10<<20)
		if err := ctx.Request.ParseMultipartForm(10 << 20); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data"})
			return
		}
		req.Name = ctx.PostForm("name")
		req.Bio = ctx.PostForm("bio")
		req.AvatarURL = ctx.PostForm("avatar_url")
		if file, err := ctx.FormFile("avatar"); err == nil && file.Size > 0 {
			avatarFile = file
		}
	} else {
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
	}

	response, err := c.service.UpdateProfileWithAvatar(ctx.Request.Context(), userID, &req, avatarFile)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *Controller) GetUser(ctx *gin.Context) {
	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	response, err := c.service.GetUser(id)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *Controller) DebugJWT(ctx *gin.Context) {
	userIDStr := ctx.Query("user_id")

	var user *entities.User
	var err error

	if userIDStr != "" {
		userID, err := uuid.FromString(userIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}
		user, err = c.service.GetUserByID(userID)
		if err != nil {
			respondError(ctx, err)
			return
		}
	} else {
		user = &entities.User{
			ID: uuid.NewV4(), Email: "debug@example.com",
			Name: "Debug User", Role: constants.RoleUser,
		}
	}

	token, err := middleware.GenerateJWT(user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "JWT generation failed"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": true, "token": token, "user": user})
}

func (c *Controller) DeleteProfile(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	if err := c.service.DeleteProfile(userID); err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Profile deleted successfully"})
}
