package controller

import (
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/constants"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/middleware"
	"github.com/pdhoang91/blog/internal/service"
	uuid "github.com/satori/go.uuid"
)

type UserController struct {
	svc service.UserService
}

func (c *UserController) GetProfile(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	response, err := c.svc.GetProfile(userID)
	if err != nil {
		respondError(ctx, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *UserController) GetUserProfileByUsername(ctx *gin.Context) {
	username := ctx.Param("username")
	if username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	user, err := c.svc.GetUserByUsername(username)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

func (c *UserController) UpdateProfile(ctx *gin.Context) {
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

	response, err := c.svc.UpdateProfileWithAvatar(ctx.Request.Context(), userID, &req, avatarFile)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *UserController) GetUser(ctx *gin.Context) {
	id, err := uuid.FromString(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	response, err := c.svc.GetUser(id)
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": response})
}

func (c *UserController) DebugJWT(ctx *gin.Context) {
	userIDStr := ctx.Query("user_id")

	var user *entities.User
	var err error

	if userIDStr != "" {
		userID, err := uuid.FromString(userIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}
		user, err = c.svc.GetUserByID(userID)
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

func (c *UserController) DeleteProfile(ctx *gin.Context) {
	userID, ok := requireUserID(ctx)
	if !ok {
		return
	}

	if err := c.svc.DeleteProfile(userID); err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Profile deleted successfully"})
}
