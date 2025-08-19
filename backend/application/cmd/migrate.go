// cmd/migrate.go
package main

import (
	"log"
	"os"

	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

func main() {
	// Set default environment variables if not set
	if os.Getenv("DB_HOST") == "" {
		os.Setenv("DB_HOST", "localhost")
	}
	if os.Getenv("DB_PORT") == "" {
		os.Setenv("DB_PORT", "5432")
	}
	if os.Getenv("DB_USER") == "" {
		os.Setenv("DB_USER", "postgres")
	}
	if os.Getenv("DB_PASSWORD") == "" {
		os.Setenv("DB_PASSWORD", "password")
	}
	if os.Getenv("DB_NAME") == "" {
		os.Setenv("DB_NAME", "insight")
	}

	log.Println("Starting database migration...")

	// Connect to database
	db := database.ConnectDatabase()

	// Create UUID extension
	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error; err != nil {
		log.Printf("Warning: Failed to create uuid-ossp extension: %v", err)
	}

	// Migrate UserActivity model specifically
	log.Println("Migrating UserActivity model...")
	if err := db.AutoMigrate(&models.UserActivity{}); err != nil {
		log.Fatalf("Failed to migrate UserActivity: %v", err)
	}

	log.Println("UserActivity migration completed successfully!")

	// Add unique constraint if it doesn't exist
	log.Println("Adding unique constraint...")
	if err := db.Exec(`
		ALTER TABLE user_activities 
		ADD CONSTRAINT IF NOT EXISTS unique_user_post_activity 
		UNIQUE(user_id, post_id, activity_type)
	`).Error; err != nil {
		log.Printf("Warning: Failed to add unique constraint: %v", err)
	}

	// Create indexes
	log.Println("Creating indexes...")
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_user_activities_post_id ON user_activities(post_id)",
		"CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type)",
		"CREATE INDEX IF NOT EXISTS idx_user_activities_post_type ON user_activities(post_id, activity_type)",
	}

	for _, index := range indexes {
		if err := db.Exec(index).Error; err != nil {
			log.Printf("Warning: Failed to create index: %v", err)
		}
	}

	log.Println("✅ Migration completed successfully!")
	log.Println("You can now use the clap system.")
}
