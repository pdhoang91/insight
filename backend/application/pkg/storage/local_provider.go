// storage/local_provider.go
package storage

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

// LocalProvider stores files on the local filesystem.
// Intended for development when AWS credentials are not configured.
type LocalProvider struct {
	baseDir string // absolute path to upload root, e.g. /app/uploads
	baseURL string // public URL prefix, e.g. http://localhost:81/local-uploads
}

// NewLocalProvider creates a LocalProvider.
// baseDir is where files are stored; baseURL is the public-facing URL prefix.
func NewLocalProvider(baseDir, baseURL string) (*LocalProvider, error) {
	if err := os.MkdirAll(baseDir, 0o755); err != nil {
		return nil, fmt.Errorf("failed to create local upload directory %s: %w", baseDir, err)
	}
	return &LocalProvider{baseDir: baseDir, baseURL: baseURL}, nil
}

func (p *LocalProvider) Upload(ctx context.Context, file *multipart.FileHeader, path string) (*StorageResult, error) {
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	destPath := filepath.Join(p.baseDir, path)
	if err := os.MkdirAll(filepath.Dir(destPath), 0o755); err != nil {
		return nil, fmt.Errorf("failed to create upload subdirectory: %w", err)
	}

	dst, err := os.Create(destPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	size, err := io.Copy(dst, src)
	if err != nil {
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	return &StorageResult{
		Key:         path,
		PublicURL:   p.baseURL + "/" + filepath.ToSlash(path),
		StorageType: "local",
		ContentType: file.Header.Get("Content-Type"),
		Size:        size,
		UploadedAt:  time.Now(),
	}, nil
}

func (p *LocalProvider) UploadRaw(ctx context.Context, r io.Reader, path, contentType string, size int64) (*StorageResult, error) {
	destPath := filepath.Join(p.baseDir, path)
	if err := os.MkdirAll(filepath.Dir(destPath), 0o755); err != nil {
		return nil, fmt.Errorf("failed to create upload subdirectory: %w", err)
	}

	dst, err := os.Create(destPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	written, err := io.Copy(dst, r)
	if err != nil {
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	return &StorageResult{
		Key:         path,
		PublicURL:   p.baseURL + "/" + filepath.ToSlash(path),
		StorageType: "local",
		ContentType: contentType,
		Size:        written,
		UploadedAt:  time.Now(),
	}, nil
}

func (p *LocalProvider) GetURL(_ context.Context, key string) (string, error) {
	return p.baseURL + "/" + filepath.ToSlash(key), nil
}

func (p *LocalProvider) Delete(_ context.Context, key string) error {
	destPath := filepath.Join(p.baseDir, key)
	if err := os.Remove(destPath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

func (p *LocalProvider) GetMetadata(_ context.Context, key string) (*FileMetadata, error) {
	destPath := filepath.Join(p.baseDir, key)
	info, err := os.Stat(destPath)
	if err != nil {
		return nil, fmt.Errorf("failed to stat file: %w", err)
	}
	return &FileMetadata{
		Key:          key,
		Size:         info.Size(),
		LastModified: info.ModTime(),
	}, nil
}

func (p *LocalProvider) GetProviderName() string {
	return "local"
}
