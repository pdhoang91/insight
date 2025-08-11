package controller

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/external/search"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// calculatePostCounts calculates clap_count and comments_count for a slice of posts
func calculatePostCounts(posts []models.Post) {
	if len(posts) == 0 {
		return
	}

	// Extract post IDs for bulk queries
	postIDs := make([]uuid.UUID, len(posts))
	for i, post := range posts {
		postIDs[i] = post.ID
	}

	// Bulk query for clap counts
	type ClapCountResult struct {
		PostID    uuid.UUID `json:"post_id"`
		ClapCount int64     `json:"clap_count"`
	}
	var clapCounts []ClapCountResult
	database.DB.Model(&models.UserActivity{}).
		Select("post_id, COUNT(*) as clap_count").
		Where("post_id IN ? AND action_type = ?", postIDs, "clap_post").
		Group("post_id").
		Scan(&clapCounts)

	// Bulk query for comment counts
	type CommentCountResult struct {
		PostID       uuid.UUID `json:"post_id"`
		CommentCount int64     `json:"comment_count"`
	}
	var commentCounts []CommentCountResult
	database.DB.Model(&models.Comment{}).
		Select("post_id, COUNT(*) as comment_count").
		Where("post_id IN ?", postIDs).
		Group("post_id").
		Scan(&commentCounts)

	// Create maps for quick lookup
	clapCountMap := make(map[uuid.UUID]int64)
	for _, cc := range clapCounts {
		clapCountMap[cc.PostID] = cc.ClapCount
	}

	commentCountMap := make(map[uuid.UUID]int64)
	for _, cc := range commentCounts {
		commentCountMap[cc.PostID] = cc.CommentCount
	}

	// Assign counts to posts
	for i := range posts {
		posts[i].ClapCount = uint64(clapCountMap[posts[i].ID])
		posts[i].CommentsCount = uint64(commentCountMap[posts[i].ID])
	}
}

// calculateSinglePostCounts calculates clap_count and comments_count for a single post
func calculateSinglePostCounts(post *models.Post) {
	// Get clap count
	var clapCount int64
	database.DB.Model(&models.UserActivity{}).
		Where("post_id = ? AND action_type = ?", post.ID, "clap_post").
		Count(&clapCount)
	post.ClapCount = uint64(clapCount)

	// Get comment count
	var commentCount int64
	database.DB.Model(&models.Comment{}).
		Where("post_id = ?", post.ID).
		Count(&commentCount)
	post.CommentsCount = uint64(commentCount)
}

// GetPosts lấy danh sách các bài viết với phân trang
func GetPosts(c *gin.Context) {
	var posts []models.Post
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

	// Đếm tổng số bài viết
	if err := database.DB.Model(&models.Post{}).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Lấy các bài viết, preload thông tin User và sắp xếp theo ngày tạo mới nhất
	result := database.DB.
		Preload("User").          // Eager load User
		Order("created_at DESC"). // Sắp xếp theo ngày CreatedAt mới nhất
		Limit(limit).
		Offset(offset).
		Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Calculate clap_count and comments_count for each post
	calculatePostCounts(posts)

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}

func GetPostByID(c *gin.Context) {
	id := c.Param("id")
	var post models.Post

	// Chuyển đổi id sang uuid.UUID
	postID, err := uuid.FromString(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	// Lấy bài viết và preload thông tin người dùng và nội dung
	if err := database.DB.Preload("User").Preload("PostContent").First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	post.Content = post.PostContent.Content

	// Tăng số lượt xem
	database.DB.Model(&post).UpdateColumn("views", gorm.Expr("views + ?", 1))

	// Calculate clap_count and comments_count for the post
	calculateSinglePostCounts(&post)

	// Kiểm tra xem người dùng đã clap post này chưa
	userIDInterface, exists := c.Get("userID")
	var hasClapped bool
	if exists {
		var activity models.UserActivity
		err := database.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userIDInterface, post.ID, "clap_post").First(&activity).Error
		if err == nil {
			hasClapped = true
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": map[string]interface{}{
			"post":        post,
			"has_clapped": hasClapped,
		},
	})
}

// GetMostViewedPosts trả về danh sách các bài viết có lượt xem cao nhất
func GetMostViewedPosts(c *gin.Context) {
	var posts []models.Post
	var total int64

	// Lấy tham số phân trang từ query
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Đếm tổng số bài viết
	if err := database.DB.Model(&models.Post{}).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Lấy danh sách bài viết, sắp xếp theo views giảm dần
	result := database.DB.
		Preload("User").     // Eager load thông tin User
		Order("views DESC"). // Sắp xếp theo số lượt xem giảm dần
		Limit(limit).
		Offset(offset).
		Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Calculate clap_count and comments_count for each post
	calculatePostCounts(posts)

	// Trả về kết quả
	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}

func GetPostByName(c *gin.Context) {
	titleName := c.Param("title_name")
	var post models.Post

	// Lấy bài viết dựa vào title_name
	if err := database.DB.Preload("User").Where("title_name = ?", titleName).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Lấy chi tiết nội dung bài viết dựa trên post.ID
	var postContent models.PostContent
	if err := database.DB.Where("post_id = ?", post.ID).First(&postContent).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post content not found"})
		return
	}
	post.Content = postContent.Content

	// Tăng số lượt xem
	database.DB.Model(&post).UpdateColumn("views", gorm.Expr("views + ?", 1))

	// Calculate clap_count and comments_count for the post
	calculateSinglePostCounts(&post)

	// Kiểm tra xem người dùng đã "clap" bài viết chưa
	//userIDInterface, exists := c.Get("userID")
	//var hasClapped bool
	//if exists {
	//	var activity models.UserActivity
	//	err := database.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userIDInterface, post.ID, "clap_post").First(&activity).Error
	//	if err == nil {
	//		hasClapped = true
	//	}
	//}

	// Trả về dữ liệu JSON cho client
	c.JSON(http.StatusOK, gin.H{
		"data": map[string]interface{}{
			"post": post,
			//"has_clapped": hasClapped,
		},
	})
}

// Hàm để uppercase chữ cái đầu tiên
func capitalizeFirstLetter(s string) string {
	if s == "" {
		return s
	}
	// Uppercase chữ cái đầu tiên và nối với phần còn lại của chuỗi
	return strings.ToUpper(string(s[0])) + s[1:]
}

func removeDiacritics(input string) string {
	var output []rune
	for _, r := range input {
		switch r {
		case 'à', 'á', 'ả', 'ã', 'ạ', 'â', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ', 'ă', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ':
			r = 'a'
		case 'è', 'é', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ề', 'ế', 'ể', 'ễ', 'ệ':
			r = 'e'
		case 'ì', 'í', 'ỉ', 'ĩ', 'ị':
			r = 'i'
		case 'ò', 'ó', 'ỏ', 'õ', 'ọ', 'ô', 'ồ', 'ố', 'ổ', 'ỗ', 'ộ', 'ơ', 'ờ', 'ớ', 'ở', 'ỡ', 'ợ':
			r = 'o'
		case 'ù', 'ú', 'ủ', 'ũ', 'ụ', 'ư', 'ừ', 'ứ', 'ử', 'ữ', 'ự':
			r = 'u'
		case 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ':
			r = 'y'
		case 'đ':
			r = 'd'
		case 'À', 'Á', 'Ả', 'Ã', 'Ạ', 'Â', 'Ầ', 'Ấ', 'Ẩ', 'Ẫ', 'Ậ', 'Ă', 'Ằ', 'Ắ', 'Ẳ', 'Ẵ', 'Ặ':
			r = 'A'
		case 'È', 'É', 'Ẻ', 'Ẽ', 'Ẹ', 'Ê', 'Ề', 'Ế', 'Ể', 'Ễ', 'Ệ':
			r = 'E'
		case 'Ì', 'Í', 'Ỉ', 'Ĩ', 'Ị':
			r = 'I'
		case 'Ò', 'Ó', 'Ỏ', 'Õ', 'Ọ', 'Ô', 'Ồ', 'Ố', 'Ổ', 'Ỗ', 'Ộ', 'Ơ', 'Ờ', 'Ớ', 'Ở', 'Ỡ', 'Ợ':
			r = 'O'
		case 'Ù', 'Ú', 'Ủ', 'Ũ', 'Ụ', 'Ư', 'Ừ', 'Ứ', 'Ử', 'Ữ', 'Ự':
			r = 'U'
		case 'Ỳ', 'Ý', 'Ỷ', 'Ỹ', 'Ỵ':
			r = 'Y'
		case 'Đ':
			r = 'D'
		}
		output = append(output, r)
	}
	return string(output)
}

func createSlug(title string) string {
	// Loại bỏ dấu
	title = removeDiacritics(title)
	// Đưa về chữ thường và thay thế khoảng trắng bằng dấu gạch ngang
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Loại bỏ các ký tự đặc biệt còn lại
	slug = regexp.MustCompile(`[^a-z0-9-]+`).ReplaceAllString(slug, "")
	return slug
}

func CreatePost(c *gin.Context) {
	var input struct {
		Title      string   `json:"title" binding:"required"`
		ImageTitle string   `json:"image_title"`
		Content    string   `json:"content" binding:"required"`
		Categories []string `json:"categories"`
		Tags       []string `json:"tags"`
	}

	// Bind JSON input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default image if ImageTitle is empty
	if input.ImageTitle == "" {
		beURL := os.Getenv("BASE_BE_URL")
		input.ImageTitle = beURL + "/images/uploads/insight.jpg" // Đường dẫn tới ảnh mặc định của bạn
	}

	// Get user ID from context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Fetch user from DB
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid AuthorID: User not found"})
		return
	}

	// Clean HTML tags from Content
	re := regexp.MustCompile(`<[^>]*>`)
	cleanContent := re.ReplaceAllString(input.Content, "")

	// Extract first 50 words for PreviewContent
	words := strings.Fields(cleanContent)
	if len(words) > 55 {
		cleanContent = strings.Join(words[:55], " ") + "..."
	}

	// Create slug from Title
	slug := createSlug(input.Title)

	// Ensure unique title_name
	existingPost := models.Post{}
	if err := database.DB.Where("title_name = ?", slug).First(&existingPost).Error; err == nil {
		uniquePrefix := utils.GetUniquePrefix()
		slug = fmt.Sprintf("%s-%s", slug, uniquePrefix)
	}

	// Start GORM transaction
	tx := database.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Create new Post
	post := models.Post{
		Title:          input.Title,
		TitleName:      slug, // Use slug as title_name
		ImageTitle:     input.ImageTitle,
		PreviewContent: cleanContent, // Use cleanContent for PreviewContent
		UserID:         user.ID,
		ClapCount:      0,
	}

	// Save Post
	if err := tx.Create(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	// Create PostContent
	postContent := models.PostContent{
		PostID:    post.ID,       // Assign PostID from the new Post
		Content:   input.Content, // Save the full content
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Save PostContent
	if err := tx.Create(&postContent).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post content"})
		return
	}

	// Handle Categories
	for _, catName := range input.Categories {
		catName = capitalizeFirstLetter(catName)
		var category models.Category
		if err := tx.Where("name = ?", catName).First(&category).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				category = models.Category{Name: catName}
				if err := tx.Create(&category).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
					return
				}
			} else {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch category"})
				return
			}
		}

		if err := tx.Model(&post).Association("Categories").Append(&category); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add category to post"})
			return
		}
	}

	// Handle Tags
	for _, tagName := range input.Tags {
		var tag models.Tag
		if err := tx.Where("name = ?", tagName).First(&tag).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				tag = models.Tag{Name: tagName}
				if err := tx.Create(&tag).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag"})
					return
				}
			} else {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tag"})
				return
			}
		}

		if err := tx.Model(&post).Association("Tags").Append(&tag); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add tag to post"})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// Chuyển đổi Post và PostContent sang SearchPost
	searchPost := models.SearchPost{
		ID:             post.ID,
		Title:          post.Title,
		TitleName:      post.TitleName,
		PreviewContent: post.PreviewContent,
		Content:        postContent.Content,
		Tags:           extractTagNames(post.Tags),
		Categories:     extractCategoryNames(post.Categories),
		UserID:         post.UserID,
		CreatedAt:      post.CreatedAt,
		ClapCount:      post.ClapCount,
		Views:          post.Views,
		CommentsCount:  post.CommentsCount,
		AverageRating:  post.AverageRating,
	}

	client := search.New()

	// Indexing với Elasticsearch (bất đồng bộ để không làm chậm phản hồi)
	go func(sp models.SearchPost) {
		if err := client.IndexPost(context.Background(), sp); err != nil {
			log.Printf("Failed to index post ID %s: %v", sp.ID, err)
		}
	}(searchPost)

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// extractTagNames lấy tên các tag từ slice Tag
func extractTagNames(tags []models.Tag) []string {
	names := make([]string, len(tags))
	for i, tag := range tags {
		names[i] = tag.Name
	}
	return names
}

// extractCategoryNames lấy tên các category từ slice Category
func extractCategoryNames(categories []models.Category) []string {
	names := make([]string, len(categories))
	for i, cat := range categories {
		names[i] = cat.Name
	}
	return names
}

func UpdatePost(c *gin.Context) {
	// Lấy ID từ tham số URL
	id := c.Param("id")

	// Chuyển đổi id sang uuid.UUID
	postID, err := uuid.FromString(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	// Bind dữ liệu JSON vào cấu trúc input
	var input struct {
		Title      string   `json:"title" binding:"required"`
		ImageTitle string   `json:"image_title"`
		Content    string   `json:"content" binding:"required"`
		Categories []string `json:"categories"`
		Tags       []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default image if imageTitle is empty
	if input.ImageTitle == "" {
		var beURL = os.Getenv("BASE_BE_URL")
		input.ImageTitle = beURL + "/images/uploads/insight.jpg" // Đường dẫn tới ảnh mặc định của bạn
	}

	// Lấy bài viết từ DB với preloaded Categories và Tags
	var post models.Post
	if err := database.DB.Preload("Categories").Preload("Tags").First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Lấy userID từ context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra quyền sở hữu bài viết
	if post.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this post"})
		return
	}

	// Xóa các thẻ HTML trong Content
	re := regexp.MustCompile(`<[^>]*>`)
	cleanContent := re.ReplaceAllString(input.Content, "")

	// Tách các từ và lấy 20 từ đầu tiên
	words := strings.Fields(cleanContent)
	if len(words) > 20 {
		cleanContent = strings.Join(words[:20], " ") + "..."
	}

	// Tạo slug từ tiêu đề bài viết
	// slug := strings.ToLower(input.Title)
	// slug = strings.ReplaceAll(slug, " ", "-")
	// slug = regexp.MustCompile(`[^a-zA-Z0-9-]+`).ReplaceAllString(slug, "")
	slug := createSlug(input.Title)

	// Đảm bảo tính duy nhất của title_name, loại trừ bài viết hiện tại
	existingPost := models.Post{}
	if err := database.DB.Where("title_name = ? AND id != ?", slug, post.ID).First(&existingPost).Error; err == nil {
		uniquePrefix := utils.GetUniquePrefix()
		slug = fmt.Sprintf("%s-%s", slug, uniquePrefix)
	}

	// Cập nhật các trường của bài viết
	post.Title = input.Title
	post.TitleName = slug
	post.ImageTitle = input.ImageTitle
	post.PreviewContent = cleanContent

	if err := database.DB.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post"})
		return
	}

	// Cập nhật hoặc tạo mới bản ghi PostContent
	var postContent models.PostContent
	if err := database.DB.Where("post_id = ?", post.ID).First(&postContent).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Tạo mới PostContent nếu không tồn tại
			postContent = models.PostContent{
				PostID:    post.ID,
				Content:   input.Content,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			if err := database.DB.Create(&postContent).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post content"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post content"})
			return
		}
	} else {
		// Cập nhật nội dung PostContent nếu đã tồn tại
		postContent.Content = input.Content
		postContent.UpdatedAt = time.Now()
		if err := database.DB.Save(&postContent).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update post content"})
			return
		}
	}

	// Cập nhật Categories
	if len(input.Categories) > 0 {
		var categories []models.Category
		for _, catName := range input.Categories {
			catName = capitalizeFirstLetter(catName)
			var category models.Category
			if err := database.DB.Where("name = ?", catName).First(&category).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					category = models.Category{Name: catName}
					if err := database.DB.Create(&category).Error; err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
						return
					}
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch category"})
					return
				}
			}
			categories = append(categories, category)
		}
		if err := database.DB.Model(&post).Association("Categories").Replace(&categories); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update categories"})
			return
		}
	}

	// Cập nhật Tags
	if len(input.Tags) > 0 {
		var tags []models.Tag
		for _, tagName := range input.Tags {
			var tag models.Tag
			if err := database.DB.Where("name = ?", tagName).First(&tag).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					tag = models.Tag{Name: tagName}
					if err := database.DB.Create(&tag).Error; err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag"})
						return
					}
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tag"})
					return
				}
			}
			tags = append(tags, tag)
		}
		if err := database.DB.Model(&post).Association("Tags").Replace(&tags); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tags"})
			return
		}
	}

	//Chuyển đổi Post và PostContent sang SearchPost
	searchPost := models.SearchPost{
		ID:             post.ID,
		Title:          post.Title,
		TitleName:      post.TitleName,
		PreviewContent: post.PreviewContent,
		Content:        postContent.Content,
		Tags:           extractTagNames(post.Tags),
		Categories:     extractCategoryNames(post.Categories),
		UserID:         post.UserID,
		CreatedAt:      post.CreatedAt,
		ClapCount:      post.ClapCount,
		Views:          post.Views,
		CommentsCount:  post.CommentsCount,
		AverageRating:  post.AverageRating,
	}

	client := search.New()

	//(Tùy Chọn) Cập Nhật Elasticsearch
	// if err := client.IndexPost(post); err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to index post", "details": err.Error()})
	// 	return
	// }

	//Indexing với Elasticsearch (bất đồng bộ để không làm chậm phản hồi)
	go func(sp models.SearchPost) {
		if err := client.IndexPost(context.Background(), sp); err != nil {
			log.Printf("Failed to index post ID %s: %v", sp.ID, err)
		}
	}(searchPost)

	// Trả về bài viết đã được cập nhật
	c.JSON(http.StatusOK, gin.H{"data": post})
}

func DeletePost(c *gin.Context) {
	// Lấy ID từ tham số URL
	id := c.Param("id")

	// Chuyển đổi id sang uuid.UUID
	postID, err := uuid.FromString(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	// Lấy userID từ context
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Tìm bài viết trong cơ sở dữ liệu
	var post models.Post
	if err := database.DB.Preload("PostContent").First(&post, "id = ?", postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch post"})
		}
		return
	}

	// Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu của bài viết không
	if post.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this post"})
		return
	}

	// Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
	tx := database.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initiate transaction"})
		return
	}

	// Xóa các liên kết với Categories và Tags nếu cần
	if err := tx.Model(&post).Association("Categories").Clear(); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear categories"})
		return
	}

	if err := tx.Model(&post).Association("Tags").Clear(); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear tags"})
		return
	}

	// Xóa PostContent nếu tồn tại
	if post.PostContent.ID != uuid.Nil {
		if err := tx.Delete(&post.PostContent).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post content"})
			return
		}
	}

	// Xóa Bookmarks liên quan đến bài viết
	if err := tx.Where("post_id = ?", postID).Delete(&models.Bookmark{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete bookmarks"})
		return
	}

	// Xóa UserActivity liên quan đến bài viết
	if err := tx.Where("post_id = ?", postID).Delete(&models.UserActivity{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user activities"})
		return
	}

	// Xóa Rating liên quan đến bài viết
	if err := tx.Where("post_id = ?", postID).Delete(&models.Rating{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete ratings"})
		return
	}

	// Tìm và xóa tất cả các bình luận liên quan đến bài viết
	var comments []models.Comment
	if err := tx.Where("post_id = ?", postID).Find(&comments).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	for _, comment := range comments {
		// Xóa tất cả các phản hồi liên quan đến bình luận
		if err := tx.Where("comment_id = ?", comment.ID).Delete(&models.Reply{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete replies"})
			return
		}

		// Xóa bình luận
		if err := tx.Delete(&comment).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
			return
		}
	}

	// Xóa bài viết chính
	if err := tx.Delete(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	client := search.New()

	go func(postID uuid.UUID) {
		if err := client.DeletePostFromIndex(context.Background(), postID); err != nil {
			log.Printf("Failed to DeletePostFromIndex postID %s: %v", postID, err)
		}
	}(postID)

	// Trả về phản hồi thành công
	c.JSON(http.StatusOK, gin.H{"message": "Post and related data deleted successfully"})
}

func GetPostsByCategory(c *gin.Context) {
	var posts []models.Post
	var total int64
	categoryName := c.Param("category") // Lấy tên category từ tham số URL

	// Giải mã tên category từ URL
	decodedCategoryName, err := url.QueryUnescape(categoryName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category name"})
		return
	}

	var category models.Category
	if err := database.DB.Where("name ILIKE ?", decodedCategoryName).First(&category).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	fmt.Println("category.ID", category.ID)

	pagingParams, err := utils.GetPagingParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid paging parameters"})
		return
	}
	offset := (pagingParams.Page - 1) * pagingParams.Limit
	limit := pagingParams.Limit

	// Đếm tổng số bài viết trong category
	if err := database.DB.Model(&models.Post{}).
		Joins("JOIN post_categories ON post_categories.post_id = posts.id").
		Where("post_categories.category_id = ?::uuid", category.ID). // Ép kiểu category.ID thành uuid
		Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Lấy các bài viết trong category, preload User và sắp xếp theo CreatedAt mới nhất
	result := database.DB.
		Preload("User").       // Eager load Author (User)
		Preload("Categories"). // Nếu bạn cần preload categories
		Joins("JOIN post_categories ON post_categories.post_id = posts.id").
		Where("post_categories.category_id = ?::uuid", category.ID). // Ép kiểu category.ID thành uuid
		Order("posts.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Calculate clap_count and comments_count for each post
	calculatePostCounts(posts)

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}
