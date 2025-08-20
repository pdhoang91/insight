// Package config provides configuration settings for the application.
package config

import (
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config represents the application configuration.
type Config struct {
	APP_PORT       string
	PGURL          string
	MAX_OPEN_CONNS int
	MAX_IDLE_CONNS int

	// OAuth Configuration
	GOOGLE_CLIENT_ID     string
	GOOGLE_CLIENT_SECRET string
	GOOGLE_REDIRECT_URL  string

	// AWS Configuration
	AWS_REGION            string
	AWS_ACCESS_KEY_ID     string
	AWS_SECRET_ACCESS_KEY string
	AWS_SESSION_TOKEN     string
}

var (
	GoogleOauthConfig *oauth2.Config
	S3Client          *s3.Client
)

// NewConfig returns an initialized Config based on environment variables.
func NewConfig() *Config {
	cfg := &Config{
		APP_PORT:       GetString("PORT", "81"),
		MAX_OPEN_CONNS: GetInt("MAX_OPEN_CONNS", 25),
		MAX_IDLE_CONNS: GetInt("MAX_IDLE_CONNS", 20),
		PGURL:          buildDatabaseURL(),

		GOOGLE_CLIENT_ID:     GetString("GOOGLE_CLIENT_ID", ""),
		GOOGLE_CLIENT_SECRET: GetString("GOOGLE_CLIENT_SECRET", ""),
		GOOGLE_REDIRECT_URL:  GetString("GOOGLE_REDIRECT_URL", ""),

		AWS_REGION:            GetString("AWS_REGION", ""),
		AWS_ACCESS_KEY_ID:     GetString("AWS_ACCESS_KEY_ID", ""),
		AWS_SECRET_ACCESS_KEY: GetString("AWS_SECRET_ACCESS_KEY", ""),
		AWS_SESSION_TOKEN:     GetString("AWS_SESSION_TOKEN", ""),
	}

	// Initialize OAuth and S3 clients
	cfg.initOAuthConfig()
	cfg.initS3Client()

	return cfg
}

// buildDatabaseURL constructs the database URL from individual environment variables
func buildDatabaseURL() string {
	// First try to get DATABASE_URL directly
	if databaseURL := GetString("DATABASE_URL", ""); databaseURL != "" {
		log.Printf("Using DATABASE_URL: %s", databaseURL)
		return databaseURL
	}

	// If not found, build from individual components
	host := GetString("DB_HOST", "localhost")
	port := GetString("DB_PORT", "5432")
	user := GetString("DB_USER", "postgres")
	password := GetString("DB_PASSWORD", "postgres")
	dbname := GetString("DB_NAME", "postgres")
	sslmode := GetString("DB_SSLMODE", "disable")

	log.Printf("Building database URL from components:")
	log.Printf("  DB_HOST: %s", host)
	log.Printf("  DB_PORT: %s", port)
	log.Printf("  DB_USER: %s", user)
	log.Printf("  DB_NAME: %s", dbname)
	log.Printf("  DB_SSLMODE: %s", sslmode)

	databaseURL := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	log.Printf("Final database URL: %s", databaseURL)
	return databaseURL
}

// InitDBConnection initializes a database connection using the provided configuration.
func InitDBConnection(cfg *Config) (*gorm.DB, error) {
	maxRetries := 5

	// Log database connection info for debugging
	log.Printf("Attempting to connect to database with URL: %s", cfg.PGURL)
	log.Printf("MAX_OPEN_CONNS: %d, MAX_IDLE_CONNS: %d", cfg.MAX_OPEN_CONNS, cfg.MAX_IDLE_CONNS)

	for retry := 1; retry <= maxRetries; retry++ {
		db, err := gorm.Open(postgres.Open(cfg.PGURL), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err == nil {
			sqlDB, err := db.DB()
			if err != nil {
				return nil, err
			}

			// Set maximum idle and in-use connections
			sqlDB.SetMaxIdleConns(cfg.MAX_IDLE_CONNS)
			sqlDB.SetMaxOpenConns(cfg.MAX_OPEN_CONNS)

			fmt.Println("Connected to the database!")
			return db, nil
		}

		fmt.Printf("Attempt %d failed: %v\n", retry, err)
		time.Sleep(1 * time.Second)
	}

	return nil, fmt.Errorf("failed to connect to the database after %d retries", maxRetries)
}

func CloseDBConnection(db *gorm.DB) error {
	database, err := db.DB()
	if err != nil {
		return err
	}
	return database.Close()
}

func (cfg *Config) initOAuthConfig() {
	if cfg.GOOGLE_CLIENT_ID != "" && cfg.GOOGLE_CLIENT_SECRET != "" {
		GoogleOauthConfig = &oauth2.Config{
			RedirectURL:  cfg.GOOGLE_REDIRECT_URL,
			ClientID:     cfg.GOOGLE_CLIENT_ID,
			ClientSecret: cfg.GOOGLE_CLIENT_SECRET,
			Scopes:       []string{"email", "profile"},
			Endpoint:     google.Endpoint,
		}
	}
}

func (cfg *Config) initS3Client() {
	if cfg.AWS_REGION == "" || cfg.AWS_ACCESS_KEY_ID == "" || cfg.AWS_SECRET_ACCESS_KEY == "" {
		log.Printf("Warning: Missing AWS credentials, some features may not work")
		return
	}

	// Skip session token if it's a placeholder value
	sessionToken := cfg.AWS_SESSION_TOKEN
	if sessionToken == "your-aws-session-token" || sessionToken == "" {
		sessionToken = ""
	}

	creds := aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(
		cfg.AWS_ACCESS_KEY_ID,
		cfg.AWS_SECRET_ACCESS_KEY,
		sessionToken,
	))

	awsCfg := aws.Config{
		Region:      cfg.AWS_REGION,
		Credentials: creds,
	}

	S3Client = s3.NewFromConfig(awsCfg)
}

// Get returns the OAuth configuration
func Get() *oauth2.Config {
	if GoogleOauthConfig == nil {
		panic("OAuth config was not initialized")
	}
	return GoogleOauthConfig
}
