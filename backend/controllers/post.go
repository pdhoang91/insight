package controllers

import (
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/utils"

	"github.com/gin-gonic/gin"
)

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

	// Kiểm tra xem người dùng đã "clap" bài viết chưa
	userIDInterface, exists := c.Get("userID")
	var hasClapped bool
	if exists {
		var activity models.UserActivity
		err := database.DB.Where("user_id = ? AND post_id = ? AND action_type = ?", userIDInterface, post.ID, "clap_post").First(&activity).Error
		if err == nil {
			hasClapped = true
		}
	}

	// Trả về dữ liệu JSON cho client
	c.JSON(http.StatusOK, gin.H{
		"data": map[string]interface{}{
			"post":        post,
			"has_clapped": hasClapped,
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

func CreatePost(c *gin.Context) {
	var input struct {
		Title      string   `json:"title" binding:"required"`
		ImageTitle string   `json:"image_title" binding:"required"`
		Content    string   `json:"content" binding:"required"`
		Categories []string `json:"categories" binding:"required"`
		Tags       []string `json:"tags"`
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

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid AuthorID: User not found"})
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
	slug := strings.ToLower(input.Title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = regexp.MustCompile(`[^a-zA-Z0-9-]+`).ReplaceAllString(slug, "")

	// Đảm bảo tính duy nhất của title_name
	existingPost := models.Post{}
	if err := database.DB.Where("title_name = ?", slug).First(&existingPost).Error; err == nil {
		uniquePrefix := utils.GetUniquePrefix()
		slug = fmt.Sprintf("%s-%s", slug, uniquePrefix)
	}

	//modifiedTitle := strings.ReplaceAll(input.Title, " ", "_")
	//titleName := fmt.Sprintf("%s_%s", modifiedTitle, uuid.NewV4().String())
	// Tạo bài viết mới
	post := models.Post{
		Title:          input.Title,
		TitleName:      slug, // Sử dụng slug làm title_name
		ImageTitle:     input.ImageTitle,
		PreviewContent: cleanContent, // Sử dụng cleanContent cho PreviewContent
		UserID:         user.ID,
		ClapCount:      0,
	}

	// Lưu bài viết để có Post.ID
	if err := database.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	// Tạo nội dung bài viết mới với PostID
	postContent := models.PostContent{
		PostID:    post.ID,       // Gán PostID từ bài viết mới
		Content:   input.Content, // Lưu nội dung bài viết
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Lưu nội dung bài viết
	if err := database.DB.Create(&postContent).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post content"})
		return
	}

	// Xử lý Categories
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

		if err := database.DB.Model(&post).Association("Categories").Append(&category); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add category to post"})
			return
		}
	}

	// Xử lý Tags
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

		if err := database.DB.Model(&post).Association("Tags").Append(&tag); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add tag to post"})
			return
		}
	}

	// Indexing với Elasticsearch
	//if err := search.IndexPost(post); err != nil {
	//	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to index post", "details": err.Error()})
	//	return
	//}

	c.JSON(http.StatusOK, gin.H{"data": post})
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
		ImageTitle string   `json:"image_title" binding:"required"`
		Content    string   `json:"content" binding:"required"`
		Categories []string `json:"categories" binding:"required"`
		Tags       []string `json:"tags"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
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
	slug := strings.ToLower(input.Title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = regexp.MustCompile(`[^a-zA-Z0-9-]+`).ReplaceAllString(slug, "")

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

	// (Tùy Chọn) Cập Nhật Elasticsearch
	// if err := search.IndexPost(post); err != nil {
	//     c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to index post", "details": err.Error()})
	//     return
	// }

	// Trả về bài viết đã được cập nhật
	c.JSON(http.StatusOK, gin.H{"data": post})
}

// DeletePost xóa một bài viết. Chỉ chủ sở hữu bài viết mới có thể xóa.
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

	// Trả về phản hồi thành công
	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
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
	if err := database.DB.Where("name = ?", decodedCategoryName).First(&category).Error; err != nil {
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

	c.JSON(http.StatusOK, gin.H{
		"data":        posts,
		"total_count": total,
	})
}
