// storage/interface.go
package storage

import (
	"context"
	"mime/multipart"
	"time"

	uuid "github.com/satori/go.uuid"
)

// StorageProvider defines the interface for different storage backends
type StorageProvider interface {
	// Upload uploads a file and returns storage metadata
	Upload(ctx context.Context, file *multipart.FileHeader, path string) (*StorageResult, error)

	// GetURL returns the public URL for accessing the file
	GetURL(ctx context.Context, key string) (string, error)

	// Delete removes a file from storage
	Delete(ctx context.Context, key string) error

	// GetMetadata returns file metadata
	GetMetadata(ctx context.Context, key string) (*FileMetadata, error)

	// GetProviderName returns the name of the storage provider
	GetProviderName() string
}

// StorageResult contains information about uploaded file
type StorageResult struct {
	Key         string    `json:"key"`          // Internal storage key
	PublicURL   string    `json:"public_url"`   // Direct access URL (optional)
	StorageType string    `json:"storage_type"` // Provider type
	ContentType string    `json:"content_type"` // MIME type
	Size        int64     `json:"size"`         // File size in bytes
	UploadedAt  time.Time `json:"uploaded_at"`  // Upload timestamp
}

// FileMetadata contains file information
type FileMetadata struct {
	Key          string    `json:"key"`
	Size         int64     `json:"size"`
	ContentType  string    `json:"content_type"`
	LastModified time.Time `json:"last_modified"`
	ETag         string    `json:"etag"`
}

// ImageMetadata contains additional image-specific information
type ImageMetadata struct {
	ID               uuid.UUID `json:"id"`
	StorageKey       string    `json:"storage_key"`
	StorageProvider  string    `json:"storage_provider"`
	OriginalFilename string    `json:"original_filename"`
	ContentType      string    `json:"content_type"`
	FileSize         int64     `json:"file_size"`
	ImageType        string    `json:"image_type"` // "content", "title", "avatar"
	UserID           uuid.UUID `json:"user_id"`
	Width            int       `json:"width,omitempty"`
	Height           int       `json:"height,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// StorageConfig holds configuration for storage providers
type StorageConfig struct {
	DefaultProvider string                            `yaml:"default_provider"`
	Providers       map[string]map[string]interface{} `yaml:"providers"`
}

// UploadRequest contains upload parameters
type UploadRequest struct {
	File   *multipart.FileHeader
	UserID uuid.UUID
	Type   string // "content", "title", "avatar"
	Folder string // Optional subfolder
}

// UploadResponse contains upload result with image metadata
type UploadResponse struct {
	ImageID     uuid.UUID `json:"image_id"`
	URL         string    `json:"url"`
	StorageKey  string    `json:"storage_key"`
	ContentType string    `json:"content_type"`
	Size        int64     `json:"size"`
}
