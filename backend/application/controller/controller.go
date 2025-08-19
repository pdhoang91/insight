// controller/controller_main.go
package controller

import (
	"bytes"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log"
	"mime/multipart"
	"path/filepath"
	"regexp"
	"strings"
	"time"
	"unicode"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/models"
)

// ===== TYPE DEFINITIONS =====

// UploadResult contains the result of an upload operation
type UploadResult struct {
	ImageID     uuid.UUID `json:"image_id"`
	URL         string    `json:"url"`
	S3Key       string    `json:"s3_key"`
	Filename    string    `json:"filename"`
	ContentType string    `json:"content_type"`
	Size        int64     `json:"size"`
	Width       int       `json:"width"`
	Height      int       `json:"height"`
}

// S3Manager manages all S3 operations and components
type S3Manager struct {
	session       *session.Session
	uploader      *s3manager.Uploader
	downloader    *s3manager.Downloader
	client        *s3.S3
	storageConfig *config.StorageConfig
}

// Controller holds all services - single controller for the entire application
type Controller struct {
	S3Manager *S3Manager
}

// ===== INITIALIZATION =====

// NewS3Manager creates a new S3Manager with initialized AWS services
func NewS3Manager() (*S3Manager, error) {
	// Get storage configuration
	storageConfig := config.GetStorageConfig()
	if storageConfig == nil {
		return nil, fmt.Errorf("storage configuration not available")
	}

	// Create AWS session
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(storageConfig.S3Config.Region),
		Credentials: credentials.NewStaticCredentials(
			storageConfig.S3Config.AccessKeyID,
			storageConfig.S3Config.SecretAccessKey,
			"",
		),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	return &S3Manager{
		session:       sess,
		uploader:      s3manager.NewUploader(sess),
		downloader:    s3manager.NewDownloader(sess),
		client:        s3.New(sess),
		storageConfig: storageConfig,
	}, nil
}

// NewController creates a new controller with initialized services
func NewController() (*Controller, error) {
	// Initialize S3Manager
	s3Manager, err := NewS3Manager()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize S3Manager: %w", err)
	}

	return &Controller{
		S3Manager: s3Manager,
	}, nil
}

// ===== S3MANAGER METHODS =====

// UploadToS3 uploads a file to S3 and returns the result
func (s3m *S3Manager) UploadToS3(file multipart.File, header *multipart.FileHeader, imageType models.ImageType, userID uuid.UUID) (*UploadResult, error) {
	// Generate unique filename
	fileExt := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", uuid.NewV4().String(), time.Now().Unix(), fileExt)

	// Generate S3 key based on image type
	var s3Key string
	switch imageType {
	case models.ImageTypeAvatar:
		s3Key = fmt.Sprintf("images/avatar/%s", filename)
	case models.ImageTypeTitle:
		s3Key = fmt.Sprintf("images/title/%s", filename)
	case models.ImageTypeContent:
		s3Key = fmt.Sprintf("images/content/%s", filename)
	case models.ImageTypeGeneral:
		s3Key = fmt.Sprintf("images/general/%s", filename)
	default:
		s3Key = fmt.Sprintf("images/general/%s", filename)
	}

	// Read file content
	fileContent, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read file content: %w", err)
	}

	// Reset file pointer for image dimension reading
	file.Seek(0, 0)

	// Get image dimensions
	img, _, err := image.Decode(file)
	var width, height int
	if err == nil {
		bounds := img.Bounds()
		width = bounds.Dx()
		height = bounds.Dy()
	}

	// Upload to S3
	upParams := &s3manager.UploadInput{
		Bucket:      aws.String(s3m.storageConfig.S3Config.Bucket),
		Key:         aws.String(s3Key),
		Body:        bytes.NewReader(fileContent),
		ContentType: aws.String(header.Header.Get("Content-Type")),
	}

	result, err := s3m.uploader.Upload(upParams)
	if err != nil {
		return nil, fmt.Errorf("failed to upload to S3: %w", err)
	}

	// Create image record in database
	imageRecord := models.Image{
		ID:               uuid.NewV4(),
		UserID:           userID,
		StorageKey:       s3Key,
		StorageProvider:  s3m.storageConfig.S3Config.Bucket,
		OriginalFilename: header.Filename,
		ContentType:      header.Header.Get("Content-Type"),
		FileSize:         header.Size,
		Width:            width,
		Height:           height,
		ImageType:        string(imageType),
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := database.DB.Create(&imageRecord).Error; err != nil {
		// If database insert fails, try to delete the uploaded file from S3
		s3m.DeleteFromS3(s3Key)
		return nil, fmt.Errorf("failed to save image record: %w", err)
	}

	return &UploadResult{
		ImageID:     imageRecord.ID,
		URL:         result.Location,
		S3Key:       s3Key,
		Filename:    header.Filename,
		ContentType: header.Header.Get("Content-Type"),
		Size:        header.Size,
		Width:       width,
		Height:      height,
	}, nil
}

// DeleteFromS3 deletes an object from S3
func (s3m *S3Manager) DeleteFromS3(s3Key string) error {
	_, err := s3m.client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s3m.storageConfig.S3Config.Bucket),
		Key:    aws.String(s3Key),
	})
	return err
}

// ===== CONTROLLER HELPER METHODS =====

// linkImageToPost links an image to a post
func (ctrl *Controller) linkImageToPost(imageID, postID uuid.UUID, imageType models.ImageType) error {
	// Check if the link already exists
	var existingLink models.PostImage
	err := database.DB.Where("image_id = ? AND post_id = ?", imageID, postID).First(&existingLink).Error
	if err == nil {
		// Link already exists
		return nil
	}
	if err != gorm.ErrRecordNotFound {
		return fmt.Errorf("failed to check existing link: %w", err)
	}

	// Create new link
	postImage := models.PostImage{
		ImageID:   imageID,
		PostID:    postID,
		Usage:     string(imageType),
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&postImage).Error; err != nil {
		return fmt.Errorf("failed to create post-image link: %w", err)
	}

	return nil
}

// extractImageIDsFromContent extracts image IDs from HTML content
func (ctrl *Controller) extractImageIDsFromContent(content string) []uuid.UUID {
	// Regular expression to match image IDs in the content
	// This assumes images are referenced like: <img src="image_id" /> or similar
	re := regexp.MustCompile(`[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}`)
	matches := re.FindAllString(content, -1)

	var imageIDs []uuid.UUID
	for _, match := range matches {
		if id, err := uuid.FromString(match); err == nil {
			imageIDs = append(imageIDs, id)
		}
	}

	return imageIDs
}

// cleanupPostImagesOnUpdate handles immediate cleanup when a post is updated
func (ctrl *Controller) cleanupPostImagesOnUpdate(postID uuid.UUID, newTitleImageID *uuid.UUID, newContentImageIDs []uuid.UUID) error {
	// Get current images linked to this post
	var currentPostImages []models.PostImage
	if err := database.DB.Where("post_id = ?", postID).Find(&currentPostImages).Error; err != nil {
		return fmt.Errorf("failed to fetch current post images: %w", err)
	}

	// Create maps for easier lookup
	newContentImageMap := make(map[uuid.UUID]bool)
	for _, id := range newContentImageIDs {
		newContentImageMap[id] = true
	}

	// Find images to delete
	var imagesToDelete []uuid.UUID
	for _, postImage := range currentPostImages {
		shouldDelete := false

		switch postImage.Usage {
		case string(models.ImageTypeTitle):
			// Delete old title image if there's a new one and it's different
			if newTitleImageID != nil && postImage.ImageID != *newTitleImageID {
				shouldDelete = true
			} else if newTitleImageID == nil {
				// No new title image, keep the old one
				shouldDelete = false
			}
		case string(models.ImageTypeContent):
			// Delete content images that are no longer in the content
			if !newContentImageMap[postImage.ImageID] {
				shouldDelete = true
			}
		}

		if shouldDelete {
			imagesToDelete = append(imagesToDelete, postImage.ImageID)
		}
	}

	// Delete the orphaned images
	for _, imageID := range imagesToDelete {
		if err := ctrl.deleteImageCompletely(imageID); err != nil {
			log.Printf("Warning: Failed to delete image %s: %v", imageID, err)
		}
	}

	return nil
}

// cleanupPostImagesOnDelete handles immediate cleanup when a post is deleted
func (ctrl *Controller) cleanupPostImagesOnDelete(postID uuid.UUID) error {
	// Get all images linked to this post
	var postImages []models.PostImage
	if err := database.DB.Where("post_id = ?", postID).Find(&postImages).Error; err != nil {
		return fmt.Errorf("failed to fetch post images: %w", err)
	}

	// Delete all images linked to this post
	for _, postImage := range postImages {
		if err := ctrl.deleteImageCompletely(postImage.ImageID); err != nil {
			log.Printf("Warning: Failed to delete image %s: %v", postImage.ImageID, err)
		}
	}

	return nil
}

// cleanupUserAvatarOnUpdate handles cleanup when user updates avatar
func (ctrl *Controller) cleanupUserAvatarOnUpdate(userID uuid.UUID, newAvatarImageID *uuid.UUID) error {
	// Find old avatar images for this user
	var oldAvatars []models.Image
	query := database.DB.Where("user_id = ? AND image_type = ?", userID, string(models.ImageTypeAvatar))

	// Exclude the new avatar if provided
	if newAvatarImageID != nil {
		query = query.Where("id != ?", *newAvatarImageID)
	}

	if err := query.Find(&oldAvatars).Error; err != nil {
		return fmt.Errorf("failed to fetch old avatars: %w", err)
	}

	// Delete old avatars
	for _, avatar := range oldAvatars {
		if err := ctrl.deleteImageCompletely(avatar.ID); err != nil {
			log.Printf("Warning: Failed to delete old avatar %s: %v", avatar.ID, err)
		}
	}

	return nil
}

// deleteImageCompletely deletes image from both S3 and database
func (ctrl *Controller) deleteImageCompletely(imageID uuid.UUID) error {
	// Get image record
	var image models.Image
	if err := database.DB.First(&image, imageID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil // Image already deleted
		}
		return fmt.Errorf("failed to fetch image: %w", err)
	}

	// Delete from S3
	if err := ctrl.S3Manager.DeleteFromS3(image.StorageKey); err != nil {
		log.Printf("Warning: Failed to delete from S3: %v", err)
	}

	// Delete post-image links
	database.DB.Where("image_id = ?", imageID).Delete(&models.PostImage{})

	// Delete image record
	if err := database.DB.Delete(&image).Error; err != nil {
		return fmt.Errorf("failed to delete image record: %w", err)
	}

	return nil
}

// processPostContent processes post content and updates image relationships
func (ctrl *Controller) processPostContent(postID uuid.UUID, content string, titleImageID *uuid.UUID) error {
	// Extract image IDs from content
	contentImageIDs := ctrl.extractImageIDsFromContent(content)

	// Link title image if provided
	if titleImageID != nil {
		if err := ctrl.linkImageToPost(*titleImageID, postID, models.ImageTypeTitle); err != nil {
			return fmt.Errorf("failed to link title image: %w", err)
		}
	}

	// Link content images
	for _, imageID := range contentImageIDs {
		if err := ctrl.linkImageToPost(imageID, postID, models.ImageTypeContent); err != nil {
			log.Printf("Warning: Failed to link content image %s: %v", imageID, err)
		}
	}

	return nil
}

// ===== UTILITY FUNCTIONS =====

// Helper function for image type validation
func isValidImageType(imageType models.ImageType) bool {
	validTypes := []models.ImageType{
		models.ImageTypeAvatar,
		models.ImageTypeTitle,
		models.ImageTypeContent,
		models.ImageTypeGeneral,
	}

	for _, validType := range validTypes {
		if imageType == validType {
			return true
		}
	}
	return false
}

// createSlug creates URL-friendly slug from title
func createSlug(title string) string {
	// Remove diacritics first
	title = removeDiacritics(title)

	// Convert to lowercase
	slug := strings.ToLower(title)

	// Replace spaces and special characters with hyphens
	re := regexp.MustCompile(`[^a-z0-9\-_]`)
	slug = re.ReplaceAllString(slug, "-")

	// Remove multiple consecutive hyphens
	re = regexp.MustCompile(`-+`)
	slug = re.ReplaceAllString(slug, "-")

	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")

	return slug
}

// removeDiacritics removes Vietnamese diacritics from string
func removeDiacritics(input string) string {
	// Vietnamese character mapping
	replacements := map[rune]rune{
		'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
		'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
		'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
		'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
		'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
		'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
		'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
		'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
		'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
		'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
		'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
		'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
		'đ': 'd',
		// Uppercase versions
		'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
		'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
		'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
		'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
		'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
		'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
		'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
		'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
		'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
		'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
		'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
		'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
		'Đ': 'D',
	}

	var result strings.Builder
	for _, char := range input {
		if replacement, exists := replacements[char]; exists {
			result.WriteRune(replacement)
		} else if unicode.IsLetter(char) || unicode.IsDigit(char) || char == ' ' || char == '-' || char == '_' {
			result.WriteRune(char)
		}
	}

	return result.String()
}

// calculatePostCounts calculates counts for multiple posts
func calculatePostCounts(posts []models.Post) {
	for i := range posts {
		calculateSinglePostCounts(&posts[i])
	}
}

// calculateSinglePostCounts calculates counts for a single post
func calculateSinglePostCounts(post *models.Post) {
	// Count comments
	var commentCount int64
	database.DB.Model(&models.Comment{}).Where("post_id = ?", post.ID).Count(&commentCount)

	// Count claps from UserActivity table (with fallback if table doesn't exist)
	var clapCount int64
	if err := database.DB.Model(&models.UserActivity{}).
		Where("post_id = ? AND activity_type = ?", post.ID, string(models.ActivityTypeClap)).
		Count(&clapCount).Error; err != nil {
		// If UserActivity table doesn't exist or there's an error, set clap count to 0
		clapCount = 0
	}

	// Set the computed fields
	post.CommentsCount = uint64(commentCount)
	post.ClapCount = uint64(clapCount)
}

// calculateCommentCounts calculates clap counts for comments and their replies
func calculateCommentCounts(comments []models.Comment) {
	for i := range comments {
		// Calculate clap count for comment
		var commentClapCount int64
		if err := database.DB.Model(&models.UserActivity{}).
			Where("comment_id = ? AND activity_type = ?", comments[i].ID, string(models.ActivityTypeClap)).
			Count(&commentClapCount).Error; err != nil {
			commentClapCount = 0
		}
		comments[i].ClapCount = uint64(commentClapCount)

		// Calculate clap counts for replies
		for j := range comments[i].Replies {
			var replyClapCount int64
			if err := database.DB.Model(&models.UserActivity{}).
				Where("reply_id = ? AND activity_type = ?", comments[i].Replies[j].ID, string(models.ActivityTypeClap)).
				Count(&replyClapCount).Error; err != nil {
				replyClapCount = 0
			}
			comments[i].Replies[j].ClapCount = uint64(replyClapCount)
		}
	}
}

// calculateSingleCommentCounts calculates clap count for a single comment
func calculateSingleCommentCounts(comment *models.Comment) {
	var clapCount int64
	if err := database.DB.Model(&models.UserActivity{}).
		Where("comment_id = ? AND activity_type = ?", comment.ID, string(models.ActivityTypeClap)).
		Count(&clapCount).Error; err != nil {
		clapCount = 0
	}
	comment.ClapCount = uint64(clapCount)
}

// calculateSingleReplyCounts calculates clap count for a single reply
func calculateSingleReplyCounts(reply *models.Reply) {
	var clapCount int64
	if err := database.DB.Model(&models.UserActivity{}).
		Where("reply_id = ? AND activity_type = ?", reply.ID, string(models.ActivityTypeClap)).
		Count(&clapCount).Error; err != nil {
		clapCount = 0
	}
	reply.ClapCount = uint64(clapCount)
}
