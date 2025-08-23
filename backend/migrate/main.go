package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
)

func main() {
	fmt.Println("=== Database Migration Runner ===")

	// Get database connection from environment
	dbURL := getEnvOrDefault("DATABASE_URL", buildDatabaseURL())
	migrationsDir := getEnvOrDefault("MIGRATIONS_DIR", "/migrations/scripts")

	fmt.Printf("Migrations Directory: %s\n", migrationsDir)

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	fmt.Println("✓ Database connected")

	// Create UUID extension first
	_, err = db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
	if err != nil {
		log.Printf("Warning: Failed to create uuid-ossp extension: %v", err)
	}

	// Setup migration tracking table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatalf("Failed to create migration table: %v", err)
	}

	// Find all SQL files
	sqlFiles, err := findSQLFiles(migrationsDir)
	if err != nil {
		log.Fatalf("Failed to find SQL files: %v", err)
	}

	if len(sqlFiles) == 0 {
		fmt.Println("No SQL migration files found")
		return
	}

	fmt.Printf("Found %d SQL files\n", len(sqlFiles))

	// Run migrations
	for _, file := range sqlFiles {
		version := getVersionFromFilename(file)

		// Check if already applied
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM schema_migrations WHERE version = $1", version).Scan(&count)
		if err != nil {
			log.Fatalf("Failed to check migration status: %v", err)
		}

		if count > 0 {
			fmt.Printf("⏭️  Skipping %s (already applied)\n", version)
			continue
		}

		fmt.Printf("🔄 Running %s\n", version)

		// Read and execute SQL file
		content, err := ioutil.ReadFile(file)
		if err != nil {
			log.Fatalf("Failed to read %s: %v", file, err)
		}

		// Execute the SQL
		_, err = db.Exec(string(content))
		if err != nil {
			log.Fatalf("Failed to run %s: %v", file, err)
		}

		// Mark as applied
		_, err = db.Exec("INSERT INTO schema_migrations (version) VALUES ($1)", version)
		if err != nil {
			log.Fatalf("Failed to mark migration as applied: %v", err)
		}

		fmt.Printf("✅ Completed %s\n", version)
	}

	fmt.Println("🎉 All migrations completed successfully!")
}

func findSQLFiles(dir string) ([]string, error) {
	var files []string

	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && strings.HasSuffix(strings.ToLower(info.Name()), ".sql") {
			files = append(files, path)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort files to ensure consistent order
	sort.Strings(files)
	return files, nil
}

func getVersionFromFilename(filename string) string {
	base := filepath.Base(filename)
	// Remove .sql extension
	name := strings.TrimSuffix(base, ".sql")
	return name
}

func buildDatabaseURL() string {
	host := getEnvOrDefault("DB_HOST", "localhost")
	port := getEnvOrDefault("DB_PORT", "5432")
	user := getEnvOrDefault("DB_USER", "postgres")
	password := getEnvOrDefault("DB_PASSWORD", "postgres")
	dbname := getEnvOrDefault("DB_NAME", "postgres")
	sslmode := getEnvOrDefault("DB_SSLMODE", "disable")

	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		user, password, host, port, dbname, sslmode)
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
