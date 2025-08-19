// models/image.go
package models

import (
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
	ID          uuid.UUID   `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	UserID      uuid.UUID   `gorm:"type:uuid;not null" json:"user_id"`
	OriginalURL string      `gorm:"not null" json:"original_url"` // Full S3 URL
	S3Key       string      `gorm:"not null" json:"s3_key"`       // S3 object key
	S3Bucket    string      `gorm:"not null" json:"s3_bucket"`    // S3 bucket name
	Filename    string      `gorm:"not null" json:"filename"`     // Original filename
	ContentType string      `gorm:"not null" json:"content_type"` // MIME type
	Size        int64       `gorm:"not null" json:"size"`         // File size in bytes
	Width       int         `json:"width"`                        // Image width
	Height      int         `json:"height"`                       // Image height
	Type        ImageType   `gorm:"not null" json:"type"`         // Image type
	Status      ImageStatus `gorm:"default:'active'" json:"status"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	DeletedAt   *time.Time  `gorm:"index" json:"deleted_at,omitempty"`

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

// GetCDNURL returns the CDN URL for the image
func (i *Image) GetCDNURL() string {
	// If CDN is configured, return CDN URL
	// Otherwise return S3 URL
	return i.OriginalURL
}

// GetThumbnailURL returns thumbnail URL (can be generated on-the-fly or pre-generated)
func (i *Image) GetThumbnailURL(size string) string {
	// For now, return original URL
	// Later can implement thumbnail generation
	return i.OriginalURL
}

// IsOwnedBy checks if the image is owned by the given user
func (i *Image) IsOwnedBy(userID uuid.UUID) bool {
	return i.UserID == userID
}

// MarkAsOrphaned marks the image as orphaned
func (i *Image) MarkAsOrphaned() {
	i.Status = ImageStatusOrphaned
}

// MarkAsDeleted marks the image as deleted
func (i *Image) MarkAsDeleted() {
	i.Status = ImageStatusDeleted
	now := time.Now()
	i.DeletedAt = &now
}
