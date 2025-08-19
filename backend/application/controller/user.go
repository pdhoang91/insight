// controllers/user.go
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/constants"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

func GetUserProfile(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var user models.User

	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"user_id":    user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"name":       user.Name,
		"avatar_url": user.AvatarURL,
		"bio":        user.Bio,
		"phone":      user.Phone,
		"dob":        user.Dob,
	})
}

// Update user profile
func UpdateUser(c *gin.Context) {
	var input struct {
		Name   string `json:"name"`
		Bio    string `json:"bio"`
		Phone  string `json:"phone"`
		Dob    string `json:"dob"`
		Avatar string `json:"avatar_url"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//userID := c.Param("id")
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Name = input.Name
	user.Bio = input.Bio
	user.Phone = input.Phone
	user.Dob = input.Dob
	user.AvatarURL = input.Avatar

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// GetUserProfile returns public profile information of a user by username
func GetPublicUserProfile(c *gin.Context) {
	username := c.Param("username")

	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Basic public fields
	response := gin.H{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"avatar_url": user.AvatarURL,
		"created_at": user.CreatedAt,
		"username":   user.Username,
		"bio":        user.Bio,
	}

	// Add role if requester is admin
	if role, exists := c.Get("role"); exists {
		if roleStr, ok := role.(string); ok && constants.UserRole(roleStr) == constants.RoleAdmin {
			response["role"] = user.Role
		}
	}

	c.JSON(http.StatusOK, response)
}

func getPaginationParams(c *gin.Context) (page, limit int) {
	page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ = strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	return page, limit
}

// GetUserPosts returns paginated posts created by the user
func GetPublicUserPosts(c *gin.Context) {
	username := c.Param("username")
	//page, limit := getPaginationParams(c) // Helper function for pagination
	// Sử dụng hàm helper để lấy các tham số phân trang
	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}
	offset := (pagingParams.Page - 1) * pagingParams.Limit
	limit := pagingParams.Limit
	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var posts []models.Post
	var total int64

	db := database.DB.Model(&models.Post{}).Where("user_id = ?", user.ID)
	db.Count(&total) // Count total posts for the user

	db.Preload("User"). // Eager load User
				Order("created_at DESC").
				Limit(limit).
				Offset(offset).
				Find(&posts)

	// Calculate clap_count and comments_count for each post
	calculatePostCounts(posts)

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}

// GetPublicUserFollow returns a paginated list of users that the given user is following
func GetPublicUserFollow(c *gin.Context) {
	username := c.Param("username")
	page, limit := getPaginationParams(c)

	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Initialize followingUsers as an empty slice
	followingUsers := make([]models.User, 0)

	// Query to get the users that the current user is following, using LIMIT and OFFSET
	err := database.DB.Debug().
		Table("users AS u").
		Joins("JOIN follows ON follows.following_id = u.id").
		Where("follows.follower_id = ?", user.ID).
		Select("u.*").
		Order("follows.created_at DESC").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&followingUsers).Error

	// Check for errors in the query
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve following users"})
		return
	}

	// Return the list of following users
	c.JSON(http.StatusOK, gin.H{
		"data": followingUsers,
	})
}
