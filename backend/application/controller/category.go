package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

func GetCategories(c *gin.Context) {
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

	// Trả về dữ liệu theo định dạng yêu cầu
	c.JSON(http.StatusOK, gin.H{
		"data":        categories,
		"total_count": totalCount,
	})
}

func GetTopCategories(c *gin.Context) {
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

	// Danh sách các category name cần lấy
	topCategories := []string{"Technology", "Music", "Movies", "AI", "Golang"}

	var categories []models.Category
	var totalCount int64

	// Đếm tổng số danh mục có name nằm trong topCategories
	if err := database.DB.Model(&models.Category{}).
		Where("name IN ?", topCategories).
		Count(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count categories"})
		return
	}

	// Lấy danh sách danh mục với phân trang và lọc theo topCategories
	if err := database.DB.Where("name IN ?", topCategories).
		Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	// Trả về dữ liệu theo định dạng yêu cầu
	c.JSON(http.StatusOK, gin.H{
		"data":        categories,
		"total_count": totalCount,
	})
}

func CreateCategory(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.Category{Name: input.Name}
	result := database.DB.Create(&category)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Indexing tag vào Elasticsearch
	//err := search.IndexCategory(category)
	//if err != nil {
	//	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to index category"})
	//	return
	//}

	c.JSON(http.StatusOK, gin.H{"data": category})
}

// GetPopularCategories trả về danh sách các category có nhiều bài post nhất cho sidebar
func GetPopularCategories(c *gin.Context) {
	// Lấy các tham số phân trang từ query string với giá trị mặc định
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "7")

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

	type CategoryWithCount struct {
		models.Category
		PostCount int64 `json:"post_count"`
	}

	var categories []CategoryWithCount
	var totalCount int64

	// Đếm tổng số categories có ít nhất 1 bài post
	countQuery := `
		SELECT COUNT(DISTINCT c.id) 
		FROM categories c 
		INNER JOIN post_categories pc ON c.id = pc.category_id
	`
	if err := database.DB.Raw(countQuery).Scan(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count categories"})
		return
	}

	// Query để lấy categories với số lượng posts, sắp xếp theo số lượng posts giảm dần
	query := `
		SELECT c.id, c.name, c.description, c.created_at, c.updated_at, COUNT(pc.post_id) as post_count
		FROM categories c 
		INNER JOIN post_categories pc ON c.id = pc.category_id 
		GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at 
		ORDER BY post_count DESC 
		LIMIT ? OFFSET ?
	`

	if err := database.DB.Raw(query, limit, offset).Scan(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch popular categories"})
		return
	}

	// Trả về dữ liệu theo định dạng yêu cầu
	c.JSON(http.StatusOK, gin.H{
		"data":        categories,
		"total_count": totalCount,
	})
}
