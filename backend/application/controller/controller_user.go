// controller/controller_user.go
package controller

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

// ===== USER METHODS =====

// GetUserProfile returns the current user's profile
func (ctrl *Controller) GetUserProfile(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// UpdateUser updates user information
func (ctrl *Controller) UpdateUser(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Name     string `json:"name"`
		Bio      string `json:"bio"`
		Avatar   string `json:"avatar"`
		Username string `json:"username"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update user fields if provided
	if input.Name != "" {
		user.Name = input.Name
	}
	if input.Bio != "" {
		user.Bio = input.Bio
	}
	if input.Avatar != "" {
		user.AvatarURL = input.Avatar
	}
	if input.Username != "" {
		user.Username = input.Username
	}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// Handle avatar cleanup if avatar is being updated (using goroutine)
	if input.Avatar != user.AvatarURL && input.Avatar != "" {
		go func(userID uuid.UUID, newAvatarURL string) {
			ctrl := GetController()
			if ctrl == nil {
				log.Printf("Warning: Controller not initialized for avatar cleanup")
				return
			}

			// Parse new avatar image ID if it's a UUID
			var newAvatarImageID *uuid.UUID
			if newAvatarURL != "" {
				if parsedID, err := uuid.FromString(newAvatarURL); err == nil {
					newAvatarImageID = &parsedID
				}
			}

			// Trigger immediate cleanup of old avatar images
			if err := ctrl.cleanupUserAvatarOnUpdate(userID, newAvatarImageID); err != nil {
				log.Printf("Warning: Failed to cleanup old avatar for user %s: %v", userID, err)
			}
		}(userID, input.Avatar)
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// GetPublicUserProfile returns public user profile
func (ctrl *Controller) GetPublicUserProfile(c *gin.Context) {
	username := c.Param("username")

	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		}
		return
	}

	// Return public profile (exclude sensitive data)
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"name":       user.Name,
			"avatar_url": user.AvatarURL,
			"bio":        user.Bio,
			"created_at": user.CreatedAt,
		},
	})
}

// GetPublicUserPosts returns public user posts
func (ctrl *Controller) GetPublicUserPosts(c *gin.Context) {
	username := c.Param("username")

	// Find user
	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var posts []models.Post
	var total int64

	// Count user's posts
	database.DB.Model(&models.Post{}).Where("user_id = ?", user.ID).Count(&total)

	// Get user's posts
	if err := database.DB.Where("user_id = ?", user.ID).
		Preload("User").
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user posts"})
		return
	}

	calculatePostCounts(posts)

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
		"page":        page,
		"limit":       limit,
		"total_pages": (total + int64(limit) - 1) / int64(limit),
		"user":        user.Username,
	})
}

// GetPublicUserFollow returns user follow information (placeholder)
func (ctrl *Controller) GetPublicUserFollow(c *gin.Context) {
	username := c.Param("username")

	// Find user
	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Placeholder - implement follow system later
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"user":         user.Username,
			"followers":    0,
			"following":    0,
			"is_following": false,
		},
	})
}
