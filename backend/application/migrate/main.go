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
		fmt.Println("No SQL files found")
		return
	}

	fmt.Printf("Found %d SQL files\n", len(sqlFiles))

	// Run each SQL file
	for _, filename := range sqlFiles {
		if err := runSQLFile(db, filename); err != nil {
			log.Fatalf("Failed to run %s: %v", filename, err)
		}
	}

	fmt.Println("=== All migrations completed! ===")
}

func findSQLFiles(dir string) ([]string, error) {
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var sqlFiles []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			sqlFiles = append(sqlFiles, filepath.Join(dir, file.Name()))
		}
	}

	// Sort files by name (001_, 002_, etc.)
	sort.Strings(sqlFiles)
	return sqlFiles, nil
}

func runSQLFile(db *sql.DB, filename string) error {
	// Get just the filename for version tracking
	version := strings.TrimSuffix(filepath.Base(filename), ".sql")

	// Check if already applied
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM schema_migrations WHERE version = $1", version).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		fmt.Printf("⏭  Skipping %s (already applied)\n", version)
		return nil
	}

	fmt.Printf("🔄 Running %s\n", version)

	// Read SQL file
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}

	// Execute SQL
	if _, err := db.Exec(string(content)); err != nil {
		return err
	}

	// Mark as applied
	_, err = db.Exec("INSERT INTO schema_migrations (version) VALUES ($1)", version)
	if err != nil {
		return err
	}

	fmt.Printf("✅ %s completed\n", version)
	return nil
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
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
