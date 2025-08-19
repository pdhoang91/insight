package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
)

func GetTabs(c *gin.Context) {
	// Lấy các tham số phân trang từ query string với giá trị mặc định
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	// Chuyển đổi các tham số sang kiểu int
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'page' parameter"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'limit' parameter"})
		return
	}

	offset := (page - 1) * limit

	var categories []models.Category
	var totalCount int64

	// Đếm tổng số danh mục
	if err := database.DB.Model(&models.Category{}).Count(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count categories"})
		return
	}

	// Lấy danh sách danh mục với phân trang
	if err := database.DB.Order("created_at desc").Limit(limit).Offset(offset).Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	//var tabs []string
	//
	//for _, value := range categories {
	//	tabs = append(tabs, value.Name)
	//}

	// Trả về dữ liệu theo định dạng yêu cầu
	c.JSON(http.StatusOK, gin.H{
		"tabs":        categories,
		"total_count": totalCount,
	})
}

// AddFollowCategoryRequest cấu trúc yêu cầu cho API add follow category
type AddFollowCategoryRequest struct {
	CategoryID uuid.UUID `json:"id" binding:"required"`
}

// RemoveFollowCategoryRequest cấu trúc yêu cầu cho API remove follow category
type RemoveFollowCategoryRequest struct {
	CategoryID uuid.UUID `json:"id" binding:"required"`
}

// AddFollowCategory thêm một category vào danh sách theo dõi của người dùng
func AddFollowCategory(c *gin.Context) {
	var req AddFollowCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Lấy userID từ context (giả sử middleware đã thêm user vào context)
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Kiểm tra xem category có tồn tại không
	var category models.Category
	if err := database.DB.First(&category, "id = ?", req.CategoryID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// Kiểm tra xem tab đã tồn tại chưa
	var existingTab models.Tab
	if err := database.DB.Where("user_id = ? AND category_id = ?", userID, req.CategoryID).First(&existingTab).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already following this category"})
		return
	} else if err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Tạo tab mới
	newTab := models.Tab{
		UserID:     userID,
		CategoryID: req.CategoryID,
	}

	if err := database.DB.Create(&newTab).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to follow category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Followed category successfully"})
}

// RemoveFollowCategory xóa một category khỏi danh sách theo dõi của người dùng
func RemoveFollowCategory(c *gin.Context) {
	var req RemoveFollowCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Lấy userID từ context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Kiểm tra xem category có tồn tại không
	var category models.Category
	if err := database.DB.First(&category, "id = ?", req.CategoryID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// Xóa tab
	result := database.DB.Where("user_id = ? AND category_id = ?", userID, req.CategoryID).Delete(&models.Tab{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unfollow category"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not following this category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Unfollowed category successfully"})
}

// GetUserTabs trả về danh sách các categories mà người dùng đang theo dõi
func GetUserTabs(c *gin.Context) {
	// Lấy userID từ context (giả sử middleware đã thêm user vào context)
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Lấy các tab của người dùng
	var tabs []models.Tab
	if err := database.DB.Preload("Category").Where("user_id = ?", userID).Find(&tabs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tabs"})
		return
	}

	// Chuyển đổi tabs thành định dạng dễ sử dụng trên frontend
	type TabResponse struct {
		ID          uuid.UUID `json:"id"`
		CategoryID  uuid.UUID `json:"category_id"`
		Name        string    `json:"name"`
		Description string    `json:"description"`
	}

	var response []TabResponse
	for _, tab := range tabs {
		response = append(response, TabResponse{
			ID:          tab.ID,
			CategoryID:  tab.CategoryID,
			Name:        tab.Category.Name,
			Description: tab.Category.Description,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"tabs": response,
	})
}

// GetTopWriters trả về danh sách các writers có nhiều bài viết nhất
func GetTopWriters(c *gin.Context) {
	// Lấy các tham số phân trang
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	// Chuyển đổi các tham số sang kiểu int
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'page' parameter"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'limit' parameter"})
		return
	}

	offset := (page - 1) * limit

	// Sử dụng GORM để đếm số bài viết của mỗi người dùng
	type WriterCount struct {
		UserID    uuid.UUID `json:"user_id"`
		Name      string    `json:"name"`
		Username  string    `json:"username"`
		AvatarURL string    `json:"avatar_url"`
		Email     string    `json:"email"`
		Phone     string    `json:"phone"`
		PostCount int64     `json:"post_count"`
	}

	var writers []WriterCount
	result := database.DB.Table("users").
		Select("users.id as user_id, users.name, users.username, users.email, users.avatar_url, users.phone, COUNT(posts.id) as post_count").
		Joins("LEFT JOIN posts ON posts.user_id = users.id").
		Group("users.id").
		Order("post_count DESC").
		Limit(limit).
		Offset(offset).
		Scan(&writers)

	fmt.Printf("Result: %+v\n", writers)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch top writers"})
		return
	}

	// Đếm tổng số writers
	var total int64
	database.DB.Model(&models.User{}).Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"data":        writers,
		"total_count": total,
		"page":        page,
		"limit":       limit,
	})
}

// GetTopTopics trả về danh sách các topics có nhiều người theo dõi nhất
func GetTopTopics(c *gin.Context) {
	// Lấy các tham số phân trang
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	// Chuyển đổi các tham số sang kiểu int
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'page' parameter"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'limit' parameter"})
		return
	}

	offset := (page - 1) * limit

	// Sử dụng GORM để đếm số người theo dõi của mỗi danh mục
	type TopicCount struct {
		CategoryID    uuid.UUID `json:"id"`
		Name          string    `json:"name"`
		Description   string    `json:"description"`
		FollowerCount int64     `json:"follower_count"`
	}

	var topics []TopicCount

	result := database.DB.Table("categories").
		Select("categories.id as category_id, categories.name, categories.description, COUNT(tabs.id) as follower_count").
		Joins("LEFT JOIN tabs ON tabs.category_id = categories.id").
		Group("categories.id").
		Order("follower_count DESC").
		Limit(limit).
		Offset(offset).
		Scan(&topics)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch top topics"})
		return
	}

	// Đếm tổng số topics
	var total int64
	database.DB.Model(&models.Category{}).Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"data":        topics,
		"total_count": total,
		"page":        page,
		"limit":       limit,
	})
}
