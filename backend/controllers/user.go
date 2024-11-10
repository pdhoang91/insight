// controllers/user.go
package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

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
		"phone":      user.Phone,
		"dob":        user.Dob,
	})
}

// Update user profile
func UpdateUser(c *gin.Context) {
	var input struct {
		Name   string `json:"name"`
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
	user.Phone = input.Phone
	user.Dob = input.Dob
	user.AvatarURL = input.Avatar

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// Fetch user's posts
func GetUserPosts(c *gin.Context) {
	userID := c.Param("id")
	var posts []models.Post

	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}
	offset := (pagingParams.Page - 1) * pagingParams.Limit
	limit := pagingParams.Limit

	//var posts []models.Post
	var total int64

	db := database.DB.Model(&models.Post{}).Where("user_id = ?", userID)
	db.Count(&total) // Count total posts for the user

	db.Preload("User"). // Eager load User
				Order("created_at DESC").
				Limit(limit).
				Offset(offset).
				Find(&posts)

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}

func SearchUsers(c *gin.Context) {
	query := c.Query("q") // Nhận từ khóa tìm kiếm
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	var users []models.User
	var total int64
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Tạo query cơ bản cho bảng User
	db := database.DB.Model(&models.User{})

	// Thêm điều kiện tìm kiếm dựa trên tiêu chí name, email, và phone
	db = db.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?", "%"+query+"%", "%"+query+"%", "%"+query+"%")

	// Đếm tổng số người dùng phù hợp với tiêu chí tìm kiếm
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Lấy danh sách người dùng với phân trang và sắp xếp
	result := db.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&users)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Chuẩn bị dữ liệu phản hồi
	type UserResponse struct {
		ID        uuid.UUID `json:"id"`
		Name      string    `json:"name"`
		UserName  string    `json:"username"`
		Email     string    `json:"email"`
		Phone     string    `json:"phone"`
		AvatarURL string    `json:"avatar_url"`
	}

	var userResponses []UserResponse
	for _, user := range users {
		userResponses = append(userResponses, UserResponse{
			ID:        user.ID,
			UserName:  user.Username,
			Name:      user.Name,
			Email:     user.Email,
			Phone:     user.Phone,
			AvatarURL: user.AvatarURL,
		})
	}

	// Trả về JSON bao gồm data, tổng số người dùng, và thông tin phân trang
	c.JSON(http.StatusOK, gin.H{
		"data":        userResponses,
		"total_count": total,
		//"page":        page,
		//"limit":       limit,
	})
}

// GetUserProfile returns public profile information of a user by username
func GetPublicUserProfile(c *gin.Context) {
	username := c.Param("username")

	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Return only public fields
	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"avatar_url": user.AvatarURL,
		"created_at": user.CreatedAt,
	})
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

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}

// GetUserBookmarks returns paginated posts bookmarked by the user
func GetPublicUserBookmarks(c *gin.Context) {
	username := c.Param("username")
	page, limit := getPaginationParams(c)

	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var bookmarks []models.Post
	var total int64

	// Assuming you have a "bookmarks" table that relates users and posts
	db := database.DB.Table("bookmarks").
		Joins("JOIN posts ON posts.id = bookmarks.post_id").
		Where("bookmarks.user_id = ?", user.ID).
		Select("posts.*")

	db.Count(&total) // Count total bookmarked posts for the user

	db.Order("bookmarks.created_at DESC").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&bookmarks)

	c.JSON(http.StatusOK, gin.H{
		"data":        bookmarks,
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
