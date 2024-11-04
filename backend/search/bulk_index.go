package search

import (
	"log"

	"gorm.io/gorm"

	"github.com/pdhoang91/blog/models"
)

func BulkIndex(db *gorm.DB) error {
	// Thực hiện batch indexing
	log.Println("Starting batch indexing of existing data...")

	// Index Posts
	var posts []models.Post
	if err := db.Preload("Tags").Preload("Categories").Find(&posts).Error; err != nil {
		log.Fatalf("Failed to fetch posts for batch indexing: %v", err)
	}
	if len(posts) > 0 {
		if err := BulkIndexPosts(posts); err != nil {
			log.Fatalf("Failed to bulk index posts: %v", err)
		}
		log.Printf("Successfully bulk indexed %d posts", len(posts))
	} else {
		log.Println("No posts found for bulk indexing.")
	}

	// Index Tags
	var tags []models.Tag
	if err := db.Find(&tags).Error; err != nil {
		log.Fatalf("Failed to fetch tags for batch indexing: %v", err)
	}
	if len(tags) > 0 {
		if err := BulkIndexTags(tags); err != nil {
			log.Fatalf("Failed to bulk index tags: %v", err)
		}
		log.Printf("Successfully bulk indexed %d tags", len(tags))
	} else {
		log.Println("No tags found for bulk indexing.")
	}

	// Index Categories
	var categories []models.Category
	if err := db.Find(&categories).Error; err != nil {
		log.Fatalf("Failed to fetch categories for batch indexing: %v", err)
	}
	if len(categories) > 0 {
		if err := BulkIndexCategories(categories); err != nil {
			log.Fatalf("Failed to bulk index categories: %v", err)
		}
		log.Printf("Successfully bulk indexed %d categories", len(categories))
	} else {
		log.Println("No categories found for bulk indexing.")
	}

	log.Println("Batch indexing completed successfully.")

	return nil
}
