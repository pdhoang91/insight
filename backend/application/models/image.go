// models/image.go
package models

import (
	"fmt"
	"time"

	uuid "github.com/satori/go.uuid"
)

// ImageType defines the type of image
type ImageType string

const (
	ImageTypeAvatar  ImageType = "avatar"
	ImageTypeTitle   ImageType = "title"
	ImageTypeContent ImageType = "content"
	ImageTypeGeneral ImageType = "general"
)

// ImageStatus defines the status of image
type ImageStatus string

const (
	ImageStatusActive   ImageStatus = "active"
	ImageStatusDeleted  ImageStatus = "deleted"
	ImageStatusOrphaned ImageStatus = "orphaned" // Images not linked to any entity
)

// Image represents an uploaded image in S3
type Image struct {
	ID               uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	UserID           uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	StorageKey       string    `gorm:"column:storage_key;not null" json:"storage_key"`             // S3 object key
	StorageProvider  string    `gorm:"column:storage_provider;not null" json:"storage_provider"`   // S3 bucket name
	OriginalFilename string    `gorm:"column:original_filename;not null" json:"original_filename"` // Original filename
	ContentType      string    `gorm:"not null" json:"content_type"`                               // MIME type
	FileSize         int64     `gorm:"column:file_size;not null" json:"file_size"`                 // File size in bytes
	Width            int       `json:"width"`                                                      // Image width
	Height           int       `json:"height"`                                                     // Image height
	ImageType        string    `gorm:"column:image_type;not null" json:"image_type"`               // Image type
	Alt              string    `json:"alt"`                                                        // Alt text
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// PostImage represents the relationship between posts and images
type PostImage struct {
	ID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	PostID    uuid.UUID `gorm:"type:uuid;not null" json:"post_id"`
	ImageID   uuid.UUID `gorm:"type:uuid;not null" json:"image_id"`
	Usage     string    `gorm:"not null" json:"usage"`  // "title", "content"
	Order     int       `gorm:"default:0" json:"order"` // For content images ordering
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	Post  Post  `gorm:"foreignKey:PostID" json:"post,omitempty"`
	Image Image `gorm:"foreignKey:ImageID" json:"image,omitempty"`
}

// TableName overrides the table name for PostImage
func (PostImage) TableName() string {
	return "post_images"
}

// GetPublicURL returns the public URL for the image
func (i *Image) GetPublicURL() string {
	// Generate S3 URL from storage key and provider
	return fmt.Sprintf("https://%s.s3.us-east-1.amazonaws.com/%s", i.StorageProvider, i.StorageKey)
}

// GetCDNURL returns the CDN URL for the image
func (i *Image) GetCDNURL() string {
	// For now, return S3 URL
	// Later can implement CDN logic
	return i.GetPublicURL()
}

// GetThumbnailURL returns thumbnail URL (can be generated on-the-fly or pre-generated)
func (i *Image) GetThumbnailURL(size string) string {
	// For now, return original URL
	// Later can implement thumbnail generation
	return i.GetPublicURL()
}

// IsOwnedBy checks if the image is owned by the given user
func (i *Image) IsOwnedBy(userID uuid.UUID) bool {
	return i.UserID == userID
}
