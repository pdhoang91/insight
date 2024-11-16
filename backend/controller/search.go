// controllers/search.go
package controller

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/external/search_api"
	"github.com/pdhoang91/blog/models"
)

//
//// SearchPostsBasic lấy danh sách các bài viết với phân trang
//func SearchPostsBasic(c *gin.Context) {
//	query := c.Query("q")
//	var posts []models.Post
//	var total int64
//	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
//	if err != nil || page < 1 {
//		page = 1
//	}
//	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
//	if err != nil || limit < 1 {
//		limit = 10
//	}
//	offset := (page - 1) * limit
//
//	// Tạo query cơ bản
//	db := database.DB.Model(&models.Post{})
//
//	// Thêm điều kiện cho query dựa trên các tham số
//	if query != "" {
//		db = db.Where("title ILIKE ? OR preview_content LIKE ?", "%"+query+"%", "%"+query+"%")
//	}
//	//if query != "" {
//	//	db = db.Where("to_tsvector('english', title || ' ' || preview_content) @@ plainto_tsquery(?)", query)
//	//}
//	// Đếm tổng số bài viết
//	if err := db.Count(&total).Error; err != nil {
//		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
//		return
//	}
//
//	// Lấy các bài viết, preload thông tin User và sắp xếp theo ngày tạo mới nhất
//	result := db.
//		Preload("User").          // Eager load User
//		Order("created_at DESC"). // Sắp xếp theo ngày CreatedAt mới nhất
//		Limit(limit).
//		Offset(offset).
//		Find(&posts)
//
//	if result.Error != nil {
//		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
//		return
//	}
//
//	c.JSON(http.StatusOK, gin.H{
//		"data":        posts,
//		"total_count": total,
//	})
//}

// // SearchPostsHandler xử lý yêu cầu tìm kiếm bài viết với pagination
// func SearchPostsHandler(c *gin.Context) {
// 	query := c.Query("q")
// 	// Lấy tham số pagination
// 	pageStr := c.DefaultQuery("page", "1")
// 	limitStr := c.DefaultQuery("limit", "10")

// 	page, err := strconv.Atoi(pageStr)
// 	if err != nil || page < 1 {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'page' parameter"})
// 		return
// 	}

// 	limit, err := strconv.Atoi(limitStr)
// 	if err != nil || limit < 1 {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'limit' parameter"})
// 		return
// 	}

// 	client := search_api.New()

// 	// Context với timeout
// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	// Thực hiện tìm kiếm với pagination
// 	responseData, _, err := client.SearchPost(ctx, query, page, limit)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
// 		return
// 	}

// 	// Khởi tạo cấu trúc để unmarshal dữ liệu
// 	var searchResponse struct {
// 		Data       []models.SearchPost `json:"data"`
// 		TotalCount int                 `json:"total_count"`
// 	}

// 	// Giải mã JSON vào cấu trúc
// 	err = json.Unmarshal(responseData, &searchResponse)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal response data", "details": err.Error()})
// 		return
// 	}

// 	// Nếu không có dữ liệu, trả về ngay lập tức
// 	if len(searchResponse.Data) == 0 {
// 		c.JSON(http.StatusOK, gin.H{
// 			"data":        searchResponse.Data,
// 			"total_count": searchResponse.TotalCount,
// 		})
// 		return
// 	}

// 	// Lấy danh sách userID từ dữ liệu bài viết
// 	var userID []uuid.UUID
// 	for _, v := range searchResponse.Data {
// 		userID = append(userID, v.UserID)
// 	}

// 	// Truy vấn thông tin người dùng từ database
// 	var users []models.User
// 	result := database.DB.
// 		Where("id IN ?", userID).
// 		Order("created_at DESC").
// 		Find(&users)
// 	if result.Error != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
// 		return
// 	}

// 	// Tạo mapUser để ánh xạ userID với thông tin người dùng
// 	mapUser := make(map[uuid.UUID]models.User)
// 	for _, v := range users {
// 		mapUser[v.ID] = v
// 	}

// 	// Cập nhật thông tin người dùng trong dữ liệu bài viết
// 	for k, v := range searchResponse.Data {
// 		if val, ok := mapUser[v.UserID]; ok {
// 			searchResponse.Data[k].User = val
// 		}
// 	}

// 	// Trả về kết quả JSON
// 	c.JSON(http.StatusOK, gin.H{
// 		"data":        searchResponse.Data,
// 		"total_count": searchResponse.TotalCount,
// 	})
// }

// controllers/search.go
func SearchPostsHandler(c *gin.Context) {
	query := c.Query("q")
	// Lấy tham số pagination
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

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

	client := search_api.New()

	// Context với timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Thực hiện tìm kiếm với pagination
	data, total, err := client.SearchPost(ctx, query, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
		return
	}

	// Nếu không có dữ liệu, trả về ngay lập tức
	if len(data) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"data":        data,
			"total_count": total,
		})
		return
	}

	// Lấy danh sách userID từ dữ liệu bài viết
	var userID []uuid.UUID
	for _, v := range data {
		userID = append(userID, v.UserID)
	}

	// Truy vấn thông tin người dùng từ database
	var users []models.User
	result := database.DB.
		Where("id IN ?", userID).
		Order("created_at DESC").
		Find(&users)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Tạo mapUser để ánh xạ userID với thông tin người dùng
	mapUser := make(map[uuid.UUID]models.User)
	for _, v := range users {
		mapUser[v.ID] = v
	}

	// Cập nhật thông tin người dùng trong dữ liệu bài viết
	for k, v := range data {
		if val, ok := mapUser[v.UserID]; ok {
			data[k].User = val
		}
	}

	// Trả về kết quả JSON
	c.JSON(http.StatusOK, gin.H{
		"data":        data,
		"total_count": total,
	})
}

//
//// SearchPostsHandler xử lý yêu cầu tìm kiếm bài viết với pagination
//func SearchPostsHandler(c *gin.Context) {
//	query := c.Query("q")
//	// Lấy tham số pagination
//	pageStr := c.DefaultQuery("page", "1")
//	limitStr := c.DefaultQuery("limit", "10")
//
//	page, err := strconv.Atoi(pageStr)
//	if err != nil || page < 1 {
//		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'page' parameter"})
//		return
//	}
//
//	limit, err := strconv.Atoi(limitStr)
//	if err != nil || limit < 1 {
//		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'limit' parameter"})
//		return
//	}
//
//	// Thực hiện tìm kiếm với pagination
//	data, total, err := search.SearchPosts(query, page, limit)
//	if err != nil {
//		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed", "details": err.Error()})
//		return
//	}
//
//	// Nếu không có dữ liệu, trả về ngay lập tức
//	if len(data) == 0 {
//		c.JSON(http.StatusOK, gin.H{
//			"data":        data,
//			"total_count": total,
//		})
//		return
//	}
//
//	var userID []uuid.UUID
//	for _, v := range data {
//		userID = append(userID, v.UserID)
//	}
//
//	var users []models.User
//	result := database.DB.
//		Where("id IN ?", userID).
//		Order("created_at DESC").
//		Find(&users)
//	if result.Error != nil {
//		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
//		return
//	}
//
//	// Khởi tạo mapUser để tránh lỗi khi thêm phần tử
//	mapUser := make(map[uuid.UUID]models.User)
//	for _, v := range users {
//		mapUser[v.ID] = v
//	}
//
//	for k, v := range data {
//		if val, ok := mapUser[v.UserID]; ok {
//			data[k].User = val
//		}
//	}
//
//	c.JSON(http.StatusOK, gin.H{
//		"data":        data,
//		"total_count": total,
//	})
//}
