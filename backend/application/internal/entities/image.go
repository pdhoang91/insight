package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Image represents an uploaded image with storage metadata
type Image struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	StorageKey       string    `gorm:"not null;index" json:"storage_key"`             // Path in storage system
	StorageProvider  string    `gorm:"not null;default:'s3'" json:"storage_provider"` // s3, gcs, local, etc.
	OriginalFilename string    `gorm:"not null" json:"original_filename"`             // Original uploaded filename
	ContentType      string    `gorm:"not null" json:"content_type"`                  // MIME type
	FileSize         int64     `gorm:"not null" json:"file_size"`                     // File size in bytes
	ImageType        string    `gorm:"not null;index" json:"image_type"`              // content, title, avatar
	UserID           uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`       // Owner of the image
	Width            int       `json:"width,omitempty"`                               // Image width in pixels
	Height           int       `json:"height,omitempty"`                              // Image height in pixels
	Alt              string    `json:"alt,omitempty"`                                 // Alt text for accessibility
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`

	// Relations
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName sets the table name for the Image model
func (Image) TableName() string {
	return "images"
}

// ImageReference represents a reference to an image in content
// This is used to track which images are used in which posts
type ImageReference struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	ImageID   uuid.UUID `gorm:"type:uuid;not null;index" json:"image_id"`
	PostID    uuid.UUID `gorm:"type:uuid;not null;index" json:"post_id"`
	RefType   string    `gorm:"not null" json:"ref_type"` // "content", "title"
	CreatedAt time.Time `json:"created_at"`

	// Relations
	Image Image `gorm:"foreignKey:ImageID" json:"image,omitempty"`
	Post  Post  `gorm:"foreignKey:PostID" json:"post,omitempty"`
}

// TableName sets the table name for the ImageReference model
func (ImageReference) TableName() string {
	return "image_references"
}
