// controllers/bookmark.go
package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

func CreateBookmark(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var input struct {
		PostID uuid.UUID `json:"post_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var bookmark models.Bookmark
	err = database.DB.Where("user_id = ? AND post_id = ?", userID, input.PostID).First(&bookmark).Error
	if err != nil {
		if err.Error() == "record not found" {
			// Bookmark chưa tồn tại, tạo mới
			bookmark = models.Bookmark{
				PostID:       input.PostID,
				UserID:       userID,
				IsBookmarked: true,
			}
			if err = database.DB.Create(&bookmark).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Bookmark created", "data": bookmark})
			return
		} else {
			// Lỗi khác
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if bookmark.IsBookmarked {
		c.JSON(http.StatusOK, gin.H{"message": "Bookmark already exists", "data": bookmark})
		return
	}

	// Nếu bookmark đã tồn tại nhưng đang unbookmark, kích hoạt lại
	bookmark.IsBookmarked = true
	bookmark.UpdatedAt = time.Now()
	if err = database.DB.Save(&bookmark).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bookmark reactivated", "data": bookmark})
}

func Unbookmark(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var input struct {
		PostID uuid.UUID `json:"post_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var bookmark models.Bookmark
	err = database.DB.Where("user_id = ? AND post_id = ?", userID, input.PostID).First(&bookmark).Error
	if err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusOK, gin.H{"message": "Bookmark does not exist"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if !bookmark.IsBookmarked {
		c.JSON(http.StatusOK, gin.H{"message": "Bookmark is already inactive"})
		return
	}

	// Cập nhật trạng thái bookmark
	bookmark.IsBookmarked = false
	bookmark.UpdatedAt = time.Now()
	if err = database.DB.Save(&bookmark).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bookmark removed", "data": bookmark})
}

func GetBookmarks(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Truy vấn thông tin người dùng để lấy username
	var user models.User
	if err := database.DB.Select("username").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user information"})
		return
	}

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	var totalCount int64
	if err := database.DB.Model(&models.Bookmark{}).Where("user_id = ? AND is_bookmarked = ?", userID, true).Count(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count bookmarks"})
		return
	}

	var bookmarks []models.Bookmark
	if err := database.DB.
		Where("user_id = ? AND is_bookmarked = ?", userID, true).
		Preload("Post.User").
		Limit(limit).
		Offset(offset).
		Find(&bookmarks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookmarks"})
		return
	}

	posts := make([]models.Post, 0, len(bookmarks))
	for _, bookmark := range bookmarks {
		//if bookmark.Post.ID != 0 {
		posts = append(posts, bookmark.Post)
		//}
	}

	// Calculate clap_count and comments_count for each post
	calculatePostCounts(posts)

	c.JSON(http.StatusOK, gin.H{
		"username":    user.Username,
		"data":        posts,
		"total_count": totalCount,
	})
}

// IsBookmarked kiểm tra xem người dùng đã bookmark bài viết hay chưa
func IsBookmarked(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id := c.Param("post_id")
	postID, err := uuid.FromString(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	var bookmark models.Bookmark
	err = database.DB.Where("user_id = ? AND post_id = ? AND is_bookmarked = ?", userID, postID, true).First(&bookmark).Error
	if err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusOK, gin.H{"is_bookmarked": false})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"is_bookmarked": true})
}
