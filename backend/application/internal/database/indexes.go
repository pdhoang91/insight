package database

import (
	"gorm.io/gorm"
)

// CreateOptimizedIndexes creates optimized database indexes for better performance
func CreateOptimizedIndexes(db *gorm.DB) error {
	// User table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)").Error; err != nil {
		return err
	}

	// Post table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_posts_title_name ON posts(title_name)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_posts_views ON posts(views DESC)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC)").Error; err != nil {
		return err
	}

	// Comment table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC)").Error; err != nil {
		return err
	}

	// Reply table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON replies(comment_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_replies_post_id ON replies(post_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_replies_user_id ON replies(user_id)").Error; err != nil {
		return err
	}

	// Bookmark table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_bookmarks_user_post ON bookmarks(user_id, post_id)").Error; err != nil {
		return err
	}

	// Rating table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_ratings_post_id ON ratings(post_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_ratings_user_post ON ratings(user_id, post_id)").Error; err != nil {
		return err
	}

	// Clap table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_claps_user_post ON claps(user_id, post_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_claps_post_count ON claps(post_id, count DESC)").Error; err != nil {
		return err
	}

	// PostView table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_views_ip_address ON post_views(ip_address)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_views_created_at ON post_views(created_at DESC)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_views_post_created ON post_views(post_id, created_at DESC)").Error; err != nil {
		return err
	}

	// Category table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)").Error; err != nil {
		return err
	}

	// Many-to-many relationship indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_categories_post_id ON post_categories(post_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_categories_category_id ON post_categories(category_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id)").Error; err != nil {
		return err
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id)").Error; err != nil {
		return err
	}

	// PostContent table indexes
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_post_contents_post_id ON post_contents(post_id)").Error; err != nil {
		return err
	}

	return nil
}

// CreateCompositeIndexes creates composite indexes for complex queries
func CreateCompositeIndexes(db *gorm.DB) error {
	// Popular posts composite index (views + created_at)
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_posts_popular ON posts(views DESC, created_at DESC)").Error; err != nil {
		return err
	}

	// Bookmark status lookup
	if err := db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique ON bookmarks(user_id, post_id)").Error; err != nil {
		return err
	}

	// Rating lookup
	if err := db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_unique ON ratings(user_id, post_id)").Error; err != nil {
		return err
	}

	// Clap lookup
	if err := db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_claps_unique ON claps(user_id, post_id)").Error; err != nil {
		return err
	}

	return nil
}
