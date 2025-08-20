package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

// GetUserActivities lấy danh sách hoạt động của người dùng
func GetUserActivities(c *gin.Context) {
	userIDStr := c.Param("user_id") // ID người dùng
	var activities []models.UserActivity

	// Chuyển đổi id sang uuid.UUID
	userID, err := uuid.FromString(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	if err := database.DB.Where("user_id = ?", userID).Find(&activities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": activities})
}

// HandleClapPost xử lý hành động clap cho một post
func HandleClapPost(c *gin.Context) {

	postIDStr := c.Param("id")
	// Chuyển đổi id sang uuid.UUID
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	newActivity := models.UserActivity{
		UserID:     userID,
		PostID:     &post.ID,
		ActionType: "clap_post",
	}
	if err := database.DB.Create(&newActivity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record user activity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Clapped successfully", "clap_count": post.ClapCount + 1})
}

// NOTE: HandleClapComment and HandleClapReply have been moved to activity_methods.go
// as methods of the unified Controller struct with proper clap_count logic

// HandleUnclapPost xử lý hành động bỏ clap cho một post
func HandleUnclapPost(c *gin.Context) {

	postIDStr := c.Param("id")
	// Chuyển đổi id sang uuid.UUID
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	var activity models.UserActivity
	err = database.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userID, postID, "clap_post").First(&activity).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusConflict, gin.H{"message": "You haven't clapped this post"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check clap status"})
		return
	}

	if post.ClapCount > 0 {
		if err := database.DB.Model(&post).Update("clap_count", post.ClapCount-1).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update clap count"})
			return
		}
	}

	if err := database.DB.Delete(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove user activity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Unclapped successfully", "clap_count": post.ClapCount - 1})
}

// GetClapsCount lấy số lượng clap cho post, comment hoặc reply
func GetClapsCount(c *gin.Context) {
	clapType := c.Query("type")
	idStr := c.Query("id")

	id, err := uuid.FromString(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	clapCount := getClapsCountForType(clapType, id)

	if clapCount < 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error counting claps"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"clap_count": clapCount})
}

// getClapsCountForType lấy số lượng clap dựa trên loại đối tượng
func getClapsCountForType(actionType string, id uuid.UUID) int64 {
	var totalClapCount int64
	var column string
	var actionTypeFilter string

	switch actionType {
	case "post":
		column = "post_id"
		actionTypeFilter = "clap_post"
	case "comment":
		column = "comment_id"
		actionTypeFilter = "clap_comment"
	case "reply":
		column = "reply_id"
		actionTypeFilter = "clap_reply"
	default:
		return -1 // Trả về -1 để biểu thị lỗi không hợp lệ
	}

	// Use SUM(clap_count) instead of COUNT(*) to get total claps
	if err := database.DB.Model(&models.UserActivity{}).
		Select("COALESCE(SUM(clap_count), 0)").
		Where(column+" = ? AND action_type = ?", id, actionTypeFilter).
		Scan(&totalClapCount).Error; err != nil {
		return -1 // Trả về -1 nếu có lỗi xảy ra
	}
	return totalClapCount
}
