// database/setup_hooks.go
package database

import (
	"log"

	"gorm.io/gorm"

	"github.com/pdhoang91/blog/models"
	"github.com/pdhoang91/blog/search"
)

// SetupElasticsearchHooks sets up hooks to index data into Elasticsearch.
func SetupElasticsearchHooks(database *gorm.DB) {
	// Callback cho tạo mới Post
	database.Callback().Create().After("gorm:create").Register("index_post_after_create", func(tx *gorm.DB) {
		log.Println("Create callback triggered")
		// Kiểm tra kiểu dữ liệu của đối tượng được tạo
		switch v := tx.Statement.Dest.(type) {
		case *models.Post:
			if err := search.IndexPost(*v); err != nil {
				log.Printf("Failed to index post after create: %v", err)
			} else {
				log.Printf("Successfully indexed post ID %d after create", v.ID)
			}
		case *[]models.Post:
			for _, post := range *v {
				if err := search.IndexPost(post); err != nil {
					log.Printf("Failed to index post ID %d after create: %v", post.ID, err)
				} else {
					log.Printf("Successfully indexed post ID %d after create", post.ID)
				}
			}
		default:
			log.Println("Create callback triggered for unsupported type")
		}
	})

	// Callback cho cập nhật Post
	database.Callback().Update().After("gorm:update").Register("index_post_after_update", func(tx *gorm.DB) {
		log.Println("Update callback triggered")
		switch v := tx.Statement.Dest.(type) {
		case *models.Post:
			if err := search.IndexPost(*v); err != nil {
				log.Printf("Failed to index post after update: %v", err)
			} else {
				log.Printf("Successfully indexed post ID %d after update", v.ID)
			}
		case *[]models.Post:
			for _, post := range *v {
				if err := search.IndexPost(post); err != nil {
					log.Printf("Failed to index post ID %d after update: %v", post.ID, err)
				} else {
					log.Printf("Successfully indexed post ID %d after update", post.ID)
				}
			}
		default:
			log.Println("Update callback triggered for unsupported type")
		}
	})

	// Callback cho xóa Post
	database.Callback().Delete().After("gorm:delete").Register("delete_post_after_delete", func(tx *gorm.DB) {
		log.Println("Delete callback triggered")
		switch v := tx.Statement.Dest.(type) {
		case *models.Post:
			if err := search.DeletePostFromIndex(v.ID); err != nil {
				log.Printf("Failed to delete post from index after delete: %v", err)
			} else {
				log.Printf("Successfully deleted post ID %d from index after delete", v.ID)
			}
		case *[]models.Post:
			for _, post := range *v {
				if err := search.DeletePostFromIndex(post.ID); err != nil {
					log.Printf("Failed to delete post ID %d from index after delete: %v", post.ID, err)
				} else {
					log.Printf("Successfully deleted post ID %d from index after delete", post.ID)
				}
			}
		default:
			log.Println("Delete callback triggered for unsupported type")
		}
	})
}
