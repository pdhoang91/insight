package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/models"
)

var DB *gorm.DB

// ConnectDatabase connects to the PostgreSQL database and returns the DB instance.
func ConnectDatabase() *gorm.DB {

	//dsn := "host=localhost user=postgres password=postgres dbname=postgres port=5433 sslmode=disable TimeZone=Asia/Ho_Chi_Minh"
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		host, user, password, dbname, port)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database!", err)
	}

	DB = database
	return database
}

// AutoMigrate migrates the database schema for the defined models.
func AutoMigrate(database *gorm.DB) {
	// Create UUID extension (essential for GORM models)
	log.Println("Creating UUID extension...")
	if err := database.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error; err != nil {
		log.Fatal("Failed to create uuid-ossp extension!", err)
	}

	// List of models to migrate
	modelsToMigrate := []interface{}{
		&models.User{},
		&models.Post{},
		&models.PostContent{},
		&models.Comment{},
		&models.Reply{},
		&models.Category{},
		&models.Tag{},
		&models.Image{},
		&models.PostCategory{},
		&models.PostTag{},
		&models.PostImage{},
		&models.UserActivity{}, // This is the important one for clap system
	}

	log.Println("Starting database migration...")

	// Migrate each model individually with logging
	for _, model := range modelsToMigrate {
		modelName := fmt.Sprintf("%T", model)
		log.Printf("Migrating %s...", modelName)

		if err := database.AutoMigrate(model); err != nil {
			log.Printf("Failed to migrate %s: %v", modelName, err)
			log.Fatal("Migration failed!")
		}
		log.Printf("✅ %s migrated successfully", modelName)
	}

	// Update user_activities table schema for comment support
	log.Println("Updating user_activities schema...")

	// Make post_id nullable (for comment claps)
	if err := database.Exec(`ALTER TABLE user_activities ALTER COLUMN post_id DROP NOT NULL`).Error; err != nil {
		log.Printf("Warning: Failed to make post_id nullable: %v", err)
	}

	// Add comment_id column if it doesn't exist
	if err := database.Exec(`ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS comment_id UUID`).Error; err != nil {
		log.Printf("Warning: Failed to add comment_id column: %v", err)
	}

	// Add reply_id column if it doesn't exist
	if err := database.Exec(`ALTER TABLE user_activities ADD COLUMN IF NOT EXISTS reply_id UUID`).Error; err != nil {
		log.Printf("Warning: Failed to add reply_id column: %v", err)
	}

	// Add foreign key constraint for comment_id
	if err := database.Exec(`
		ALTER TABLE user_activities 
		ADD CONSTRAINT IF NOT EXISTS fk_user_activities_comment 
		FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
	`).Error; err != nil {
		log.Printf("Warning: Failed to add comment foreign key: %v", err)
	}

	// Add foreign key constraint for reply_id
	if err := database.Exec(`
		ALTER TABLE user_activities 
		ADD CONSTRAINT IF NOT EXISTS fk_user_activities_reply 
		FOREIGN KEY (reply_id) REFERENCES replies(id) ON DELETE CASCADE
	`).Error; err != nil {
		log.Printf("Warning: Failed to add reply foreign key: %v", err)
	}

	// Update unique constraint to handle both post and comment claps
	// Drop old constraint first
	if err := database.Exec(`ALTER TABLE user_activities DROP CONSTRAINT IF EXISTS unique_user_post_activity`).Error; err != nil {
		log.Printf("Warning: Failed to drop old unique constraint: %v", err)
	}

	// Add new constraint that works for posts, comments, and replies
	if err := database.Exec(`
		ALTER TABLE user_activities 
		ADD CONSTRAINT IF NOT EXISTS unique_user_activity 
		UNIQUE(user_id, COALESCE(post_id, '00000000-0000-0000-0000-000000000000'), COALESCE(comment_id, '00000000-0000-0000-0000-000000000000'), COALESCE(reply_id, '00000000-0000-0000-0000-000000000000'), activity_type)
	`).Error; err != nil {
		log.Printf("Warning: Failed to add new unique constraint: %v", err)
	}

	log.Println("✅ Database auto-migration completed successfully")
	log.Println("Note: Run migrate/init.sql manually for search extensions and indexes")
}

// InitializeDatabase initializes the database connection, migration, and hooks.
func InitializeDatabase() *gorm.DB {
	db := ConnectDatabase()
	AutoMigrate(db)
	return db
}
