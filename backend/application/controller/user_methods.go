// controller/user_methods.go
package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/constants"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// GetUserProfile gets user profile information
func (ctrl *Controller) GetUserProfile(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := ctrl.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		}
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

// UpdateUser updates user profile with avatar deletion
func (ctrl *Controller) UpdateUser(c *gin.Context) {
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

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Get current user data
	var user models.User
	if err := ctrl.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		}
		return
	}

	// Handle avatar change - delete old avatar if changed
	if input.Avatar != user.AvatarURL && user.AvatarURL != "" {
		if err := ctrl.DeleteUserAvatar(c.Request.Context(), userID, user.AvatarURL); err != nil {
			fmt.Printf("Warning: failed to delete old avatar: %v\n", err)
		}
	}

	// Update user fields
	user.Name = input.Name
	user.Bio = input.Bio
	user.Phone = input.Phone
	user.Dob = input.Dob
	user.AvatarURL = input.Avatar

	if err := ctrl.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// GetUserPosts gets posts by user with standardized response
func (ctrl *Controller) GetUserPosts(c *gin.Context) {
	userID := c.Param("id")

	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}
	offset := (pagingParams.Page - 1) * pagingParams.Limit
	limit := pagingParams.Limit

	var posts []models.Post
	var total int64

	// Count total posts
	if err := ctrl.DB.Model(&models.Post{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count posts"})
		return
	}

	// Get posts with pagination
	result := ctrl.DB.
		Preload("User").
		Preload("Categories").
		Preload("Tags").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get posts"})
		return
	}

	// Calculate post counts
	calculatePostCounts(posts)

	// Return empty array instead of null when no posts found
	if len(posts) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        []models.Post{},
			"total_count": total,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}

// GetPublicUserProfile gets public user profile
func (ctrl *Controller) GetPublicUserProfile(c *gin.Context) {
	username := c.Param("username")

	var user models.User
	if err := ctrl.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		}
		return
	}

	// Check if current user is admin (for admin features)
	isAdmin := false
	if userIDInterface, exists := c.Get("userID"); exists {
		var currentUser models.User
		if err := ctrl.DB.First(&currentUser, userIDInterface).Error; err == nil {
			isAdmin = currentUser.Role == constants.RoleAdmin
		}
	}

	response := gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"name":       user.Name,
		"avatar_url": user.AvatarURL,
		"bio":        user.Bio,
		"created_at": user.CreatedAt,
	}

	// Add admin-only fields if user is admin
	if isAdmin {
		response["email"] = user.Email
		response["role"] = user.Role
		response["email_verified"] = user.EmailVerified
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// GetPublicUserPosts gets public user posts with standardized response
func (ctrl *Controller) GetPublicUserPosts(c *gin.Context) {
	username := c.Param("username")

	// Get user by username
	var user models.User
	if err := ctrl.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		}
		return
	}

	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}
	offset := (pagingParams.Page - 1) * pagingParams.Limit
	limit := pagingParams.Limit

	var posts []models.Post
	var total int64

	// Count total posts
	if err := ctrl.DB.Model(&models.Post{}).Where("user_id = ?", user.ID).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count posts"})
		return
	}

	// Get posts with pagination
	result := ctrl.DB.
		Preload("User").
		Preload("Categories").
		Preload("Tags").
		Where("user_id = ?", user.ID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get posts"})
		return
	}

	// Calculate post counts
	calculatePostCounts(posts)

	// Return empty array instead of null when no posts found
	if len(posts) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        []models.Post{},
			"total_count": total,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}

// GetPublicUserBookmarks gets public user bookmarks with standardized response
func (ctrl *Controller) GetPublicUserBookmarks(c *gin.Context) {
	username := c.Param("username")

	// Get user by username
	var user models.User
	if err := ctrl.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		}
		return
	}

	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}
	offset := (pagingParams.Page - 1) * pagingParams.Limit
	limit := pagingParams.Limit

	var bookmarks []models.Bookmark
	var total int64

	// Count total bookmarks
	if err := ctrl.DB.Model(&models.Bookmark{}).Where("user_id = ?", user.ID).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count bookmarks"})
		return
	}

	// Get bookmarks with posts
	result := ctrl.DB.
		Preload("Post").
		Preload("Post.User").
		Preload("Post.Categories").
		Preload("Post.Tags").
		Where("user_id = ?", user.ID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&bookmarks)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get bookmarks"})
		return
	}

	// Extract posts and calculate counts
	posts := make([]models.Post, len(bookmarks))
	for i, bookmark := range bookmarks {
		posts[i] = bookmark.Post
	}
	calculatePostCounts(posts)

	// Return empty array instead of null when no bookmarks found
	if len(bookmarks) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        []models.Bookmark{},
			"total_count": total,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        bookmarks,
		"total_count": total,
	})
}

// GetPublicUserFollow gets public user follow information with standardized response
func (ctrl *Controller) GetPublicUserFollow(c *gin.Context) {
	username := c.Param("username")

	// Get user by username
	var user models.User
	if err := ctrl.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		}
		return
	}

	// Get followers count
	var followersCount int64
	if err := ctrl.DB.Model(&models.Follow{}).Where("following_id = ?", user.ID).Count(&followersCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count followers"})
		return
	}

	// Get following count
	var followingCount int64
	if err := ctrl.DB.Model(&models.Follow{}).Where("follower_id = ?", user.ID).Count(&followingCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count following"})
		return
	}

	// Get recent followers (limit to 10)
	var recentFollowers []models.Follow
	if err := ctrl.DB.Preload("Follower").Where("following_id = ?", user.ID).Order("created_at DESC").Limit(10).Find(&recentFollowers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get recent followers"})
		return
	}

	// Return empty array instead of null when no followers found
	if len(recentFollowers) == 0 {
		recentFollowers = []models.Follow{}
	}

	c.JSON(http.StatusOK, gin.H{
		"followers_count":  followersCount,
		"following_count":  followingCount,
		"recent_followers": recentFollowers,
	})
}

// AdminGetUsers gets all users for admin with standardized response
func (ctrl *Controller) AdminGetUsers(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil || limit < 1 {
		limit = 20
	}
	offset := (page - 1) * limit

	var users []models.User
	var total int64

	// Count total users
	if err := ctrl.DB.Model(&models.User{}).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count users"})
		return
	}

	// Get users with pagination
	result := ctrl.DB.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&users)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
		return
	}

	// Return empty array instead of null when no users found
	if len(users) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        []models.User{},
			"total_count": total,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        users,
		"total_count": total,
	})
}

// AdminDeleteUser deletes a user and all associated data
func (ctrl *Controller) AdminDeleteUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.FromString(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get user to verify existence
	var user models.User
	if err := ctrl.DB.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		}
		return
	}

	// Delete user avatar
	if user.AvatarURL != "" {
		if err := ctrl.DeleteUserAvatar(c.Request.Context(), userID, user.AvatarURL); err != nil {
			fmt.Printf("Warning: failed to delete user avatar: %v\n", err)
		}
	}

	// Get all user posts to delete associated images
	var posts []models.Post
	if err := ctrl.DB.Where("user_id = ?", userID).Find(&posts).Error; err == nil {
		for _, post := range posts {
			// Delete post images
			if err := ctrl.DeletePostImages(c.Request.Context(), post.ID); err != nil {
				fmt.Printf("Warning: failed to delete images for post %s: %v\n", post.ID, err)
			}

			// Delete title image
			if post.ImageTitle != "" {
				if imageID := ctrl.ExtractImageIDFromTitleURL(post.ImageTitle); imageID != nil {
					if err := ctrl.DeleteImageDirectly(c.Request.Context(), *imageID); err != nil {
						fmt.Printf("Warning: failed to delete title image: %v\n", err)
					}
				}
			}
		}
	}

	// Delete user's images
	if err := ctrl.DB.Where("user_id = ?", userID).Delete(&models.Image{}).Error; err != nil {
		fmt.Printf("Warning: failed to delete user images: %v\n", err)
	}

	// Delete user's posts and related data
	if err := ctrl.DB.Where("user_id = ?", userID).Delete(&models.Post{}).Error; err != nil {
		fmt.Printf("Warning: failed to delete user posts: %v\n", err)
	}

	// Delete user's comments
	if err := ctrl.DB.Where("user_id = ?", userID).Delete(&models.Comment{}).Error; err != nil {
		fmt.Printf("Warning: failed to delete user comments: %v\n", err)
	}

	// Delete user's activities
	if err := ctrl.DB.Where("user_id = ?", userID).Delete(&models.UserActivity{}).Error; err != nil {
		fmt.Printf("Warning: failed to delete user activities: %v\n", err)
	}

	// Delete user's bookmarks
	if err := ctrl.DB.Where("user_id = ?", userID).Delete(&models.Bookmark{}).Error; err != nil {
		fmt.Printf("Warning: failed to delete user bookmarks: %v\n", err)
	}

	// Delete user's follows
	if err := ctrl.DB.Where("follower_id = ? OR following_id = ?", userID, userID).Delete(&models.Follow{}).Error; err != nil {
		fmt.Printf("Warning: failed to delete user follows: %v\n", err)
	}

	// Delete the user
	if err := ctrl.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
