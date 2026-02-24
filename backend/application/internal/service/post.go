package service

import (
	"context"
	"errors"
	"fmt"
	"os"
	"regexp"
	"time"

	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/pkg/notification"
	"github.com/pdhoang91/blog/pkg/utils"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// CreatePost creates a new post
func (s *InsightService) CreatePost(userID uuid.UUID, req *dto.CreatePostRequest) (*dto.PostResponse, error) {
	tx := s.DB.Begin()
	if tx.Error != nil {
		return nil, apperror.NewInternal("failed to start transaction", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	imageTitle := req.ImageTitle
	if imageTitle == "" {
		feURL := os.Getenv("BASE_FE_URL")
		if feURL == "" {
			feURL = "http://localhost:3000"
		}
		imageTitle = feURL + "/images/insight.jpg"
	}

	titleName := utils.CreateSlug(req.Title)
	if _, err := s.PostRepo.FindByTitleName(s.DB, titleName); err == nil {
		titleName = fmt.Sprintf("%s-%s", titleName, utils.GetUniquePrefix())
	}

	previewContent := req.PreviewContent
	if previewContent == "" && req.Content != "" {
		previewContent = utils.ExtractPreviewContent(req.Content, 55)
	}

	post := &entities.Post{
		ID:             uuid.NewV4(),
		UserID:         userID,
		Title:          req.Title,
		ImageTitle:     imageTitle,
		TitleName:      titleName,
		PreviewContent: previewContent,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := s.PostRepo.Create(tx, post); err != nil {
		tx.Rollback()
		return nil, apperror.NewInternal("failed to create post", err)
	}

	var processedContent string
	if req.Content != "" {
		processedContent = s.ProcessContentForSavingWithoutReferences(req.Content)
		postContent := &entities.PostContent{
			ID:        uuid.NewV4(),
			PostID:    post.ID,
			Content:   processedContent,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := s.PostContentRepo.Create(tx, postContent); err != nil {
			tx.Rollback()
			return nil, apperror.NewInternal("failed to create post content", err)
		}
	}

	if len(req.CategoryNames) > 0 {
		categories, err := s.findOrCreateCategories(tx, req.CategoryNames)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := s.PostRepo.AppendCategories(tx, post, categories); err != nil {
			tx.Rollback()
			return nil, apperror.NewInternal("failed to associate categories", nil)
		}
	}

	if len(req.TagNames) > 0 {
		tags, err := s.findOrCreateTags(tx, req.TagNames)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := s.PostRepo.AppendTags(tx, post, tags); err != nil {
			tx.Rollback()
			return nil, apperror.NewInternal("failed to associate tags", nil)
		}
	}

	// Send notifications (best-effort)
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	_ = eventProcessor.SendPostNotification(notification.EventTypePostCreated, userID, post.ID, "New post created")

	if err := tx.Commit().Error; err != nil {
		return nil, apperror.NewInternal("failed to commit transaction", err)
	}

	// Create image references after commit (best-effort)
	if processedContent != "" {
		_ = s.CreateImageReferencesFromContent(context.Background(), post.ID, processedContent)
	}

	if err := s.PostRepo.LoadRelationships(s.DB, post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	return dto.NewPostResponse(post), nil
}

// ListPosts retrieves all posts with pagination
func (s *InsightService) ListPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	posts, err := s.PostRepo.FindAll(s.DBR2, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list posts", err)
	}

	total, err := s.PostRepo.Count(s.DBR2)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(s.DBR2, posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, total, nil
}

// GetPost retrieves a post by ID
func (s *InsightService) GetPost(id uuid.UUID) (*dto.PostResponse, error) {
	post, err := s.PostRepo.FindByID(s.DBR2, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to get post", err)
	}

	// Increment view count (best-effort, write DB)
	_ = s.PostRepo.IncrementViews(s.DB, post)

	postContent, err := s.PostContentRepo.FindByPostID(s.DBR2, id)
	if err == nil && postContent != nil {
		post.Content = s.ProcessContentForDisplay(postContent.Content)
	}

	if err := s.PostRepo.LoadRelationships(s.DBR2, post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	_ = s.PostRepo.CalculateCounts(s.DBR2, post)
	return dto.NewPostResponse(post), nil
}

// GetPostByTitleName retrieves a post by title name
func (s *InsightService) GetPostByTitleName(titleName string) (*dto.PostResponse, error) {
	post, err := s.PostRepo.FindByTitleName(s.DBR2, titleName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to get post by title name", err)
	}

	_ = s.PostRepo.IncrementViews(s.DB, post)

	postContent, err := s.PostContentRepo.FindByPostID(s.DBR2, post.ID)
	if err == nil && postContent != nil {
		post.Content = s.ProcessContentForDisplay(postContent.Content)
	}

	if err := s.PostRepo.LoadRelationships(s.DBR2, post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	_ = s.PostRepo.CalculateCounts(s.DBR2, post)
	return dto.NewPostResponse(post), nil
}

// GetPostEntity returns the raw post entity (for internal use)
func (s *InsightService) GetPostEntity(id uuid.UUID) (*entities.Post, error) {
	post, err := s.PostRepo.FindByID(s.DB, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to get post entity", err)
	}
	return post, nil
}

// UpdatePost updates a post by ID
func (s *InsightService) UpdatePost(userID uuid.UUID, id uuid.UUID, req *dto.UpdatePostRequest) (*dto.PostResponse, error) {
	tx := s.DB.Begin()
	if tx.Error != nil {
		return nil, apperror.NewInternal("failed to start transaction", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	post, err := s.PostRepo.FindByID(tx, id)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to find post", err)
	}

	if post.UserID != userID {
		tx.Rollback()
		return nil, apperror.NewForbidden("you do not own this post")
	}

	if req.Title != "" {
		post.Title = req.Title
		newTitleName := utils.CreateSlug(req.Title)
		if newTitleName != post.TitleName {
			if s.PostRepo.ExistsByTitleNameExcluding(tx, newTitleName, post.ID) {
				newTitleName = fmt.Sprintf("%s-%s", newTitleName, utils.GetUniquePrefix())
			}
			post.TitleName = newTitleName
		}
	}
	if req.ImageTitle != "" {
		post.ImageTitle = req.ImageTitle
	}
	if req.PreviewContent != "" {
		post.PreviewContent = req.PreviewContent
	}
	if req.Content != "" && req.PreviewContent == "" {
		post.PreviewContent = utils.ExtractPreviewContent(req.Content, 55)
	}

	post.UpdatedAt = time.Now()
	if err := s.PostRepo.Update(tx, post); err != nil {
		tx.Rollback()
		return nil, apperror.NewInternal("failed to update post", err)
	}

	var oldContent string
	if req.Content != "" {
		postContent, err := s.PostContentRepo.FindByPostID(tx, post.ID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				processedContent := s.ProcessContentForSavingWithoutReferences(req.Content)
				postContent = &entities.PostContent{
					ID: uuid.NewV4(), PostID: post.ID, Content: processedContent,
					CreatedAt: time.Now(), UpdatedAt: time.Now(),
				}
				if err := s.PostContentRepo.Create(tx, postContent); err != nil {
					tx.Rollback()
					return nil, apperror.NewInternal("failed to create post content", err)
				}
			} else {
				tx.Rollback()
				return nil, apperror.NewInternal("failed to find post content", err)
			}
		} else {
			oldContent = postContent.Content
			processedContent := s.ProcessContentForSavingWithoutReferences(req.Content)
			postContent.Content = processedContent
			postContent.UpdatedAt = time.Now()
			if err := s.PostContentRepo.Update(tx, postContent); err != nil {
				tx.Rollback()
				return nil, apperror.NewInternal("failed to update post content", err)
			}
			if oldContent != processedContent {
				_ = s.UpdateImageReferences(context.Background(), post.ID, oldContent, processedContent)
			}
		}
	}

	if len(req.CategoryNames) > 0 {
		categories, err := s.findOrCreateCategories(tx, req.CategoryNames)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := s.PostRepo.ReplaceCategories(tx, post, categories); err != nil {
			tx.Rollback()
			return nil, apperror.NewInternal("failed to update categories", nil)
		}
	}

	if len(req.TagNames) > 0 {
		tags, err := s.findOrCreateTags(tx, req.TagNames)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := s.PostRepo.ReplaceTags(tx, post, tags); err != nil {
			tx.Rollback()
			return nil, apperror.NewInternal("failed to update tags", nil)
		}
	}

	// Send notifications (best-effort)
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	_ = eventProcessor.SendPostNotification(notification.EventTypePostUpdated, userID, post.ID, "Post updated")

	if err := tx.Commit().Error; err != nil {
		return nil, apperror.NewInternal("failed to commit transaction", err)
	}

	if req.Content != "" {
		processedContent := s.ProcessContentForSavingWithoutReferences(req.Content)
		_ = s.UpdateImageReferences(context.Background(), post.ID, oldContent, processedContent)
	}

	if err := s.PostRepo.LoadRelationships(s.DB, post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	return dto.NewPostResponse(post), nil
}

// DeletePost soft deletes a post by ID
func (s *InsightService) DeletePost(userID uuid.UUID, id uuid.UUID) error {
	tx := s.DB.Begin()
	if tx.Error != nil {
		return apperror.NewInternal("failed to start transaction", tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	post, err := s.PostRepo.FindByID(tx, id)
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("post not found")
		}
		return apperror.NewInternal("failed to find post", err)
	}

	if post.UserID != userID {
		tx.Rollback()
		return apperror.NewForbidden("you do not own this post")
	}

	if err := s.PostRepo.Delete(tx, post); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete post", err)
	}

	if err := s.CommentRepo.DeleteByPostID(tx, id); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete comments", err)
	}

	if err := s.ReplyRepo.DeleteByPostID(tx, id); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete replies", err)
	}

	if err := s.PostContentRepo.DeleteByPostID(tx, id); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete post content", err)
	}

	// Send notifications (best-effort)
	eventProcessor := notification.GetDefaultProcessor(s.DB)
	_ = eventProcessor.SendPostNotification(notification.EventTypePostDeleted, userID, id, "Post deleted")

	if err := tx.Commit().Error; err != nil {
		return apperror.NewInternal("failed to commit transaction", err)
	}
	return nil
}

// DeletePostImages deletes all images referenced in a post
func (s *InsightService) DeletePostImages(ctx context.Context, postID uuid.UUID, userID uuid.UUID) error {
	imageRefs, err := s.ImageRepo.FindReferencesByPostID(s.DB, postID)
	if err != nil {
		return fmt.Errorf("FindReferencesByPostID: %w", err)
	}
	for _, ref := range imageRefs {
		_ = s.DeleteImageV2(ctx, ref.ImageID.String(), userID)
	}
	return nil
}

// GetUserPosts retrieves posts by user ID
func (s *InsightService) GetUserPosts(userID uuid.UUID, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	posts, err := s.PostRepo.FindByUserID(s.DBR2, userID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get user posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(s.DBR2, posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, int64(len(responses)), nil
}

// SearchPosts searches for posts
func (s *InsightService) SearchPosts(query string, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	posts, err := s.PostRepo.Search(s.DBR2, query, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to search posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(s.DBR2, posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, int64(len(responses)), nil
}

// GetAllPosts retrieves all posts (admin only)
func (s *InsightService) GetAllPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 50
	}

	posts, err := s.PostRepo.List(s.DB, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list all posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(s.DB, posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, int64(len(responses)), nil
}

// SearchAll searches across all content
func (s *InsightService) SearchAll(query string) (interface{}, error) {
	return map[string]interface{}{"message": "Search all not implemented yet", "query": query}, nil
}

// GetLatestPosts retrieves latest posts
func (s *InsightService) GetLatestPosts(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	posts, err := s.PostRepo.List(s.DBR2, limit, 0)
	if err != nil {
		return nil, apperror.NewInternal("failed to get latest posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(s.DBR2, posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, nil
}

// GetPopularPosts retrieves popular posts based on engagement
func (s *InsightService) GetPopularPosts(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	posts, err := s.PostRepo.GetPopular(s.DBR2, limit)
	if err != nil {
		return nil, apperror.NewInternal("failed to get popular posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(s.DBR2, posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, nil
}

// GetRecentPosts retrieves recent posts (alias for GetLatestPosts)
func (s *InsightService) GetRecentPosts(limit int) ([]*dto.PostResponse, error) {
	return s.GetLatestPosts(limit)
}

// GetTopPosts retrieves top posts (alias for GetPopularPosts)
func (s *InsightService) GetTopPosts(limit int) ([]*dto.PostResponse, error) {
	return s.GetPopularPosts(limit)
}

// GetPostsByYearMonth retrieves posts by year and month
func (s *InsightService) GetPostsByYearMonth(year, month int, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	posts, err := s.PostRepo.FindByYearMonth(s.DBR2, year, month, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get posts by year/month", err)
	}

	total, err := s.PostRepo.CountByYearMonth(s.DBR2, year, month)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts by year/month", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(s.DBR2, posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, total, nil
}

// GetPostsByCategory retrieves posts by category name
func (s *InsightService) GetPostsByCategory(categoryName string, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	category, err := s.CategoryRepo.FindByName(s.DBR2, categoryName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, apperror.NewNotFound("category not found")
		}
		return nil, 0, apperror.NewInternal("failed to find category", err)
	}

	posts, err := s.PostRepo.FindByCategory(s.DBR2, category.ID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get posts by category", err)
	}

	total, err := s.PostRepo.CountByCategory(s.DBR2, category.ID)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts by category", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(s.DBR2, posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, total, nil
}

// HasUserClappedPost checks if a user has clapped a specific post
func (s *InsightService) HasUserClappedPost(userID, postID uuid.UUID) (bool, error) {
	return s.UserActivityRepo.HasUserClapped(s.DB, userID, "post", postID)
}

// ClapPost adds a clap for a post
func (s *InsightService) ClapPost(userID, postID uuid.UUID) (bool, error) {
	existing, err := s.UserActivityRepo.FindByUserAndPost(s.DB, userID, postID, "clap_post")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, apperror.NewInternal("failed to check clap status", err)
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		activity := &entities.UserActivity{
			ID: uuid.NewV4(), UserID: userID, PostID: &postID,
			ActionType: "clap_post", Count: 1, CreatedAt: time.Now(),
		}
		if err := s.UserActivityRepo.Create(s.DB, activity); err != nil {
			return false, apperror.NewInternal("failed to create clap", err)
		}
		return true, nil
	}

	if err := s.UserActivityRepo.IncrementCount(s.DB, existing); err != nil {
		return false, apperror.NewInternal("failed to increment clap", err)
	}
	return true, nil
}

// ClapComment adds a clap for a comment
func (s *InsightService) ClapComment(userID, commentID uuid.UUID) (bool, error) {
	existing, err := s.UserActivityRepo.FindByUserAndComment(s.DB, userID, commentID, "clap_comment")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, apperror.NewInternal("failed to check clap status", err)
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		activity := &entities.UserActivity{
			ID: uuid.NewV4(), UserID: userID, CommentID: &commentID,
			ActionType: "clap_comment", Count: 1, CreatedAt: time.Now(),
		}
		if err := s.UserActivityRepo.Create(s.DB, activity); err != nil {
			return false, apperror.NewInternal("failed to create clap", err)
		}
		return true, nil
	}

	if err := s.UserActivityRepo.IncrementCount(s.DB, existing); err != nil {
		return false, apperror.NewInternal("failed to increment clap", err)
	}
	return true, nil
}

// ClapReply adds a clap for a reply
func (s *InsightService) ClapReply(userID, replyID uuid.UUID) (bool, error) {
	existing, err := s.UserActivityRepo.FindByUserAndReply(s.DB, userID, replyID, "clap_reply")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, apperror.NewInternal("failed to check clap status", err)
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		activity := &entities.UserActivity{
			ID: uuid.NewV4(), UserID: userID, ReplyID: &replyID,
			ActionType: "clap_reply", Count: 1, CreatedAt: time.Now(),
		}
		if err := s.UserActivityRepo.Create(s.DB, activity); err != nil {
			return false, apperror.NewInternal("failed to create clap", err)
		}
		return true, nil
	}

	if err := s.UserActivityRepo.IncrementCount(s.DB, existing); err != nil {
		return false, apperror.NewInternal("failed to increment clap", err)
	}
	return true, nil
}

// GetClapsCount returns clap count for post/comment/reply
func (s *InsightService) GetClapsCount(itemType string, itemID uuid.UUID) (int64, error) {
	return s.UserActivityRepo.GetClapCount(s.DB, itemType, itemID)
}

// GetPostIDFromComment gets post ID from comment ID
func (s *InsightService) GetPostIDFromComment(commentID uuid.UUID) (*uuid.UUID, error) {
	comment, err := s.CommentRepo.FindByID(s.DB, commentID)
	if err != nil {
		return nil, apperror.NewNotFound("comment not found")
	}
	return &comment.PostID, nil
}

// HasUserClapped checks if user has clapped an item
func (s *InsightService) HasUserClapped(userID uuid.UUID, itemType string, itemID uuid.UUID) (bool, error) {
	return s.UserActivityRepo.HasUserClapped(s.DB, userID, itemType, itemID)
}

// ProcessContentForSavingWithoutReferences converts image URLs to data-image-id without creating references
func (s *InsightService) ProcessContentForSavingWithoutReferences(content string) string {
	re := regexp.MustCompile(`src=['"]([^'"]*\/images\/v2\/([^'"\/]+))['"]`)
	return re.ReplaceAllStringFunc(content, func(match string) string {
		matches := re.FindStringSubmatch(match)
		if len(matches) < 3 {
			return match
		}
		return fmt.Sprintf(`data-image-id="%s"`, matches[2])
	})
}

// CreateImageReferencesFromContent creates image references after post is committed
func (s *InsightService) CreateImageReferencesFromContent(ctx context.Context, postID uuid.UUID, content string) error {
	re := regexp.MustCompile(`data-image-id=['"]([^'"]+)['"]`)
	matches := re.FindAllStringSubmatch(content, -1)
	for _, match := range matches {
		if len(match) > 1 {
			_ = s.createImageReference(match[1], postID, "content")
		}
	}
	return nil
}

func (s *InsightService) createImageReference(imageID string, postID uuid.UUID, refType string) error {
	id, err := uuid.FromString(imageID)
	if err != nil {
		return err
	}

	if _, err := s.ImageRepo.FindReference(s.DB, id, postID, refType); err == nil {
		return nil // Already exists
	}

	ref := &entities.ImageReference{
		ID: uuid.NewV4(), ImageID: id, PostID: postID,
		RefType: refType, CreatedAt: time.Now(),
	}
	return s.ImageRepo.CreateReference(s.DB, ref)
}

// findOrCreateCategories finds or creates categories by name
func (s *InsightService) findOrCreateCategories(tx *gorm.DB, names []string) ([]entities.Category, error) {
	var categories []entities.Category
	for _, name := range names {
		category, err := s.CategoryRepo.FindByName(tx, name)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				category = &entities.Category{
					ID: uuid.NewV4(), Name: name,
					CreatedAt: time.Now(), UpdatedAt: time.Now(),
				}
				if err := s.CategoryRepo.Create(tx, category); err != nil {
					return nil, apperror.NewInternal("failed to create category", err)
				}
			} else {
				return nil, apperror.NewInternal("failed to find category", err)
			}
		}
		categories = append(categories, *category)
	}
	return categories, nil
}

// findOrCreateTags finds or creates tags by name
func (s *InsightService) findOrCreateTags(tx *gorm.DB, names []string) ([]entities.Tag, error) {
	var tags []entities.Tag
	for _, name := range names {
		tag, err := s.TagRepo.FindByName(tx, name)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				tag = &entities.Tag{
					ID: uuid.NewV4(), Name: name,
					CreatedAt: time.Now(), UpdatedAt: time.Now(),
				}
				if err := s.TagRepo.Create(tx, tag); err != nil {
					return nil, apperror.NewInternal("failed to create tag", err)
				}
			} else {
				return nil, apperror.NewInternal("failed to find tag", err)
			}
		}
		tags = append(tags, *tag)
	}
	return tags, nil
}
