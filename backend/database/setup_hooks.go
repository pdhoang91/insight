// database/setup_hooks.go
package database

import (
	"log"

	"gorm.io/gorm"

	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/search"
)

// SetupElasticsearchHooks thiết lập các callback để index dữ liệu vào Elasticsearch.
func SetupElasticsearchHooks(database *gorm.DB) {
	//// Callback cho tạo mới Post
	//database.Callback().Create().After("gorm:create").Register("index_post_after_create", func(tx *gorm.DB) {
	//	log.Println("Create callback triggered")
	//	switch v := tx.Statement.Dest.(type) {
	//	case *models.Post:
	//		indexPost(v)
	//	case *[]models.Post:
	//		for _, post := range *v {
	//			indexPost(&post)
	//		}
	//	default:
	//		log.Println("Create callback triggered for unsupported type")
	//	}
	//})
	//
	//// Callback cho cập nhật Post
	//database.Callback().Update().After("gorm:update").Register("index_post_after_update", func(tx *gorm.DB) {
	//	log.Println("Update callback triggered")
	//	switch v := tx.Statement.Dest.(type) {
	//	case *models.Post:
	//		indexPost(v)
	//	case *[]models.Post:
	//		for _, post := range *v {
	//			indexPost(&post)
	//		}
	//	default:
	//		log.Println("Update callback triggered for unsupported type")
	//	}
	//})
	//
	//// Callback cho xóa Post
	//database.Callback().Delete().After("gorm:delete").Register("delete_post_after_delete", func(tx *gorm.DB) {
	//	log.Println("Delete callback triggered")
	//	switch v := tx.Statement.Dest.(type) {
	//	case *models.Post:
	//		if err := search.DeletePostFromIndex(v.ID); err != nil {
	//			log.Printf("Failed to delete post from index after delete: %v", err)
	//		} else {
	//			log.Printf("Successfully deleted post ID %s from index after delete", v.ID)
	//		}
	//	case *[]models.Post:
	//		for _, post := range *v {
	//			if err := search.DeletePostFromIndex(post.ID); err != nil {
	//				log.Printf("Failed to delete post ID %s from index after delete: %v", post.ID, err)
	//			} else {
	//				log.Printf("Successfully deleted post ID %s from index after delete", post.ID)
	//			}
	//		}
	//	default:
	//		log.Println("Delete callback triggered for unsupported type")
	//	}
	//})
}

// Hàm hỗ trợ để index một Post
func indexPost(post *models.Post) {
	// Chuyển đổi Post sang SearchPost
	searchPost := models.SearchPost{
		ID:             post.ID,
		Title:          post.Title,
		TitleName:      post.TitleName,
		PreviewContent: post.PreviewContent,
		Content:        post.Content, // Nếu muốn bao gồm Content từ PostContent, đảm bảo đã được load
		Tags:           extractTagNames(post.Tags),
		Categories:     extractCategoryNames(post.Categories),
		UserID:         post.UserID,
		CreatedAt:      post.CreatedAt,
		ClapCount:      post.ClapCount,
		Views:          post.Views,
		CommentsCount:  post.CommentsCount,
		AverageRating:  post.AverageRating,
	}

	// Nếu bạn muốn bao gồm Content từ PostContent, hãy chắc chắn rằng Post đã preload PostContent
	if post.PostContent.Content != "" {
		searchPost.Content = post.PostContent.Content
	}

	// Index vào Elasticsearch
	if err := search.IndexPost(searchPost); err != nil {
		log.Printf("Failed to index post after create/update: %v", err)
	} else {
		log.Printf("Successfully indexed post ID %s after create/update", post.ID)
	}
}

// Hàm hỗ trợ để lấy tên tags
func extractTagNames(tags []models.Tag) []string {
	names := make([]string, len(tags))
	for i, tag := range tags {
		names[i] = tag.Name
	}
	return names
}

// Hàm hỗ trợ để lấy tên categories
func extractCategoryNames(categories []models.Category) []string {
	names := make([]string, len(categories))
	for i, cat := range categories {
		names[i] = cat.Name
	}
	return names
}
