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
	if err := database.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`).Error; err != nil {
		log.Fatal("Failed to create uuid-ossp extension!", err)
	}

	// Auto-migrate all models - GORM handles table creation, constraints, and basic indexes
	err := database.AutoMigrate(
		&models.Post{},
		&models.PostContent{},
		&models.Comment{},
		&models.Category{},
		&models.User{},
		&models.PostCategory{},
		&models.Reply{},
		&models.PostTag{},
		&models.Tag{},
		&models.Image{},
		&models.PostImage{},
	)
	if err != nil {
		log.Fatal("Failed to migrate tables in database!", err)
	}

	log.Println("Database auto-migration completed successfully")
	log.Println("Note: Run migrate/init.sql manually for search extensions and indexes")
}

// InitializeDatabase initializes the database connection, migration, and hooks.
func InitializeDatabase() *gorm.DB {
	db := ConnectDatabase()
	AutoMigrate(db)
	return db
}
