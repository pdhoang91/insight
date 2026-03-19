package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/pdhoang91/blog/internal/apperror"
	"github.com/pdhoang91/blog/internal/dto"
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/pkg/notification"
	"github.com/pdhoang91/blog/pkg/revalidation"
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

	txPostRepo := s.PostRepo.WithTx(tx)
	txPostContentRepo := s.PostContentRepo.WithTx(tx)

	coverImage := req.CoverImage
	if coverImage == "" {
		feURL := os.Getenv("BASE_FE_URL")
		if feURL == "" {
			feURL = "http://localhost:3000"
		}
		coverImage = feURL + "/images/insight.jpg"
	}

	slug := utils.CreateSlug(req.Title)
	if _, err := s.PostRepo.FindBySlug(slug); err == nil {
		slug = fmt.Sprintf("%s-%s", slug, utils.GetUniquePrefix())
	}

	excerpt := req.Excerpt
	if excerpt == "" && len(req.Content) > 0 {
		excerpt = s.extractExcerpt(req.Content)
	}

	post := &entities.Post{
		ID:         uuid.NewV4(),
		UserID:     userID,
		Title:      req.Title,
		CoverImage: coverImage,
		Slug:       slug,
		Excerpt:    excerpt,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := txPostRepo.Create(post); err != nil {
		tx.Rollback()
		return nil, apperror.NewInternal("failed to create post", err)
	}

	var processedJSON json.RawMessage
	if len(req.Content) > 0 {
		processedJSON = s.StorageManager.ProcessJSONContent(req.Content)
		postContent := &entities.PostContent{
			ID:        uuid.NewV4(),
			PostID:    post.ID,
			Content:   processedJSON,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := txPostContentRepo.Create(postContent); err != nil {
			tx.Rollback()
			return nil, apperror.NewInternal("failed to create post content", err)
		}
	}

	if len(req.CategoryNames) > 0 {
		categories, err := s.findOrCreateCategories(req.CategoryNames)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := txPostRepo.AppendCategories(post, categories); err != nil {
			tx.Rollback()
			return nil, apperror.NewInternal("failed to associate categories", nil)
		}
	}

	if len(req.TagNames) > 0 {
		tags, err := s.findOrCreateTags(req.TagNames)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := txPostRepo.AppendTags(post, tags); err != nil {
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
	if len(processedJSON) > 0 {
		imageIDs := s.StorageManager.ExtractImageIDsFromJSON(processedJSON)
		for _, imgID := range imageIDs {
			_ = s.createImageReference(imgID, post.ID, "content")
		}
	}

	if err := s.PostRepo.LoadRelationships(post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	revalidation.TriggerPostRevalidation(post.Slug)
	s.invalidatePostListCaches()

	return dto.NewPostResponse(post), nil
}

func (s *InsightService) invalidatePostListCaches() {
	s.Cache.DeletePrefix("list_posts:")
	s.Cache.DeletePrefix("latest_posts:")
	s.Cache.DeletePrefix("popular_posts:")
	s.Cache.Delete("home_data")
}

func (s *InsightService) ListPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	cacheKey := fmt.Sprintf("list_posts:%d:%d", req.Limit, req.Offset)
	if cachedPosts, ok1 := s.Cache.Get(cacheKey); ok1 {
		if cachedTotal, ok2 := s.Cache.Get(cacheKey + ":total"); ok2 {
			return cachedPosts.([]*dto.PostResponse), cachedTotal.(int64), nil
		}
	}

	posts, err := s.PostRepo.FindAll(req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list posts", err)
	}

	total, err := s.PostRepo.Count()
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	s.Cache.Set(cacheKey, responses, 2*time.Minute)
	s.Cache.Set(cacheKey+":total", total, 2*time.Minute)
	return responses, total, nil
}

// GetPost retrieves a post by ID
func (s *InsightService) GetPost(id uuid.UUID) (*dto.PostResponse, error) {
	post, err := s.PostRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to get post", err)
	}

	// Increment view count (best-effort)
	_ = s.PostRepo.IncrementViews(post)

	s.loadPostContent(post)

	if err := s.PostRepo.LoadRelationships(post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	_ = s.PostRepo.CalculateCounts(post)
	return dto.NewPostResponse(post), nil
}

// GetPostBySlug retrieves a post by slug
func (s *InsightService) GetPostBySlug(slug string) (*dto.PostResponse, error) {
	post, err := s.PostRepo.FindBySlug(slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to get post by slug", err)
	}

	_ = s.PostRepo.IncrementViews(post)

	s.loadPostContent(post)

	if err := s.PostRepo.LoadRelationships(post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	_ = s.PostRepo.CalculateCounts(post)
	return dto.NewPostResponse(post), nil
}

// loadPostContent loads and processes post content for display
func (s *InsightService) loadPostContent(post *entities.Post) {
	postContent, err := s.PostContentRepo.FindByPostID(post.ID)
	if err != nil || postContent == nil {
		return
	}
	post.Content = s.StorageManager.ProcessJSONContentForDisplay(postContent.Content)
}

// GetPostEntity returns the raw post entity (for internal use)
func (s *InsightService) GetPostEntity(id uuid.UUID) (*entities.Post, error) {
	post, err := s.PostRepo.FindByID(id)
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

	txPostRepo := s.PostRepo.WithTx(tx)
	txPostContentRepo := s.PostContentRepo.WithTx(tx)

	post, err := txPostRepo.FindByID(id)
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
		newSlug := utils.CreateSlug(req.Title)
		if newSlug != post.Slug {
			if txPostRepo.ExistsBySlugExcluding(newSlug, post.ID) {
				newSlug = fmt.Sprintf("%s-%s", newSlug, utils.GetUniquePrefix())
			}
			post.Slug = newSlug
		}
	}
	if req.CoverImage != "" {
		post.CoverImage = req.CoverImage
	}
	if req.Excerpt != "" {
		post.Excerpt = req.Excerpt
	}
	if len(req.Content) > 0 && req.Excerpt == "" {
		post.Excerpt = s.extractExcerpt(req.Content)
	}

	post.UpdatedAt = time.Now()
	if err := txPostRepo.Update(post); err != nil {
		tx.Rollback()
		return nil, apperror.NewInternal("failed to update post", err)
	}

	if len(req.Content) > 0 {
		postContent, err := txPostContentRepo.FindByPostID(post.ID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				postContent = &entities.PostContent{
					ID:        uuid.NewV4(),
					PostID:    post.ID,
					CreatedAt: time.Now(),
				}
			} else {
				tx.Rollback()
				return nil, apperror.NewInternal("failed to find post content", err)
			}
		}

		oldContent := postContent.Content
		processedJSON := s.StorageManager.ProcessJSONContent(req.Content)
		postContent.Content = processedJSON
		postContent.UpdatedAt = time.Now()

		if postContent.ID == uuid.Nil {
			postContent.ID = uuid.NewV4()
			if err := txPostContentRepo.Create(postContent); err != nil {
				tx.Rollback()
				return nil, apperror.NewInternal("failed to create post content", err)
			}
		} else {
			if err := txPostContentRepo.Update(postContent); err != nil {
				tx.Rollback()
				return nil, apperror.NewInternal("failed to update post content", err)
			}
		}

		// Update image references (best-effort)
		_ = s.StorageManager.UpdateJSONImageReferences(context.Background(), post.ID, oldContent, postContent.Content)
	}

	if len(req.CategoryNames) > 0 {
		categories, err := s.findOrCreateCategories(req.CategoryNames)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := txPostRepo.ReplaceCategories(post, categories); err != nil {
			tx.Rollback()
			return nil, apperror.NewInternal("failed to update categories", nil)
		}
	}

	if len(req.TagNames) > 0 {
		tags, err := s.findOrCreateTags(req.TagNames)
		if err != nil {
			tx.Rollback()
			return nil, err
		}
		if err := txPostRepo.ReplaceTags(post, tags); err != nil {
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

	if err := s.PostRepo.LoadRelationships(post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	revalidation.TriggerPostRevalidation(post.Slug)
	s.invalidatePostListCaches()

	return dto.NewPostResponse(post), nil
}

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

	txPostRepo := s.PostRepo.WithTx(tx)
	txPostContentRepo := s.PostContentRepo.WithTx(tx)

	post, err := txPostRepo.FindByID(id)
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

	if err := txPostRepo.Delete(post); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete post", err)
	}

	if err := s.CommentRepo.DeleteByPostID(id); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete comments", err)
	}

	if err := s.ReplyRepo.DeleteByPostID(id); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete replies", err)
	}

	if err := txPostContentRepo.DeleteByPostID(id); err != nil {
		tx.Rollback()
		return apperror.NewInternal("failed to delete post content", err)
	}

	eventProcessor := notification.GetDefaultProcessor(s.DB)
	_ = eventProcessor.SendPostNotification(notification.EventTypePostDeleted, userID, id, "Post deleted")

	if err := tx.Commit().Error; err != nil {
		return apperror.NewInternal("failed to commit transaction", err)
	}

	revalidation.TriggerPostRevalidation(post.Slug)
	s.invalidatePostListCaches()

	return nil
}

func (s *InsightService) DeletePostImages(ctx context.Context, postID uuid.UUID, userID uuid.UUID) error {
	imageRefs, err := s.ImageRepo.FindReferencesByPostID(postID)
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

	posts, err := s.PostRepo.FindByUserID(userID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get user posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(posts)

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

	posts, err := s.PostRepo.Search(query, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to search posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(posts)

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

	posts, err := s.PostRepo.List(req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list all posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(posts)

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

func (s *InsightService) GetLatestPosts(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	cacheKey := fmt.Sprintf("latest_posts:%d", limit)
	if cached, ok := s.Cache.Get(cacheKey); ok {
		return cached.([]*dto.PostResponse), nil
	}

	posts, err := s.PostRepo.FindAll(limit, 0)
	if err != nil {
		return nil, apperror.NewInternal("failed to get latest posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	s.Cache.Set(cacheKey, responses, 2*time.Minute)
	return responses, nil
}

func (s *InsightService) GetPopularPosts(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	cacheKey := fmt.Sprintf("popular_posts:%d", limit)
	if cached, ok := s.Cache.Get(cacheKey); ok {
		return cached.([]*dto.PostResponse), nil
	}

	posts, err := s.PostRepo.GetPopular(limit)
	if err != nil {
		return nil, apperror.NewInternal("failed to get popular posts", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	s.Cache.Set(cacheKey, responses, 5*time.Minute)
	return responses, nil
}

func (s *InsightService) GetRecentPosts(limit int) ([]*dto.PostResponse, error) {
	return s.GetLatestPosts(limit)
}

func (s *InsightService) GetTopPosts(limit int) ([]*dto.PostResponse, error) {
	return s.GetPopularPosts(limit)
}

func (s *InsightService) GetHomeData() (*dto.HomeResponse, error) {
	if cached, ok := s.Cache.Get("home_data"); ok {
		return cached.(*dto.HomeResponse), nil
	}

	var (
		latestPosts  []*dto.PostResponse
		popularPosts []*dto.PostResponse
		categories   []*dto.CategoryResponse
		totalPosts   int64
		latestErr    error
		popularErr   error
		catErr       error
		countErr     error
		wg           sync.WaitGroup
	)

	wg.Add(4)
	go func() {
		defer wg.Done()
		latestPosts, latestErr = s.GetLatestPosts(10)
	}()
	go func() {
		defer wg.Done()
		popularPosts, popularErr = s.GetPopularPosts(5)
	}()
	go func() {
		defer wg.Done()
		cats, _, err := s.ListCategories(&dto.PaginationRequest{Limit: 8})
		categories, catErr = cats, err
	}()
	go func() {
		defer wg.Done()
		totalPosts, countErr = s.PostRepo.Count()
	}()
	wg.Wait()

	if latestErr != nil {
		return nil, latestErr
	}
	if popularErr != nil {
		return nil, popularErr
	}
	if catErr != nil {
		return nil, catErr
	}
	if countErr != nil {
		return nil, apperror.NewInternal("failed to count posts", countErr)
	}

	resp := &dto.HomeResponse{
		LatestPosts:  latestPosts,
		PopularPosts: popularPosts,
		Categories:   categories,
		TotalPosts:   totalPosts,
	}

	s.Cache.Set("home_data", resp, 2*time.Minute)
	return resp, nil
}

func (s *InsightService) RecalculateEngagementScores() {
	_ = s.PostRepo.RecalculateAllEngagementScores()
	s.Cache.DeletePrefix("popular_posts:")
	s.Cache.Delete("home_data")
}

// GetPostsByYearMonth retrieves posts by year and month
func (s *InsightService) GetPostsByYearMonth(year, month int, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	posts, err := s.PostRepo.FindByYearMonth(year, month, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get posts by year/month", err)
	}

	total, err := s.PostRepo.CountByYearMonth(year, month)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts by year/month", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(posts)

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

	category, err := s.CategoryRepo.FindByName(categoryName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, apperror.NewNotFound("category not found")
		}
		return nil, 0, apperror.NewInternal("failed to find category", err)
	}

	posts, err := s.PostRepo.FindByCategory(category.ID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get posts by category", err)
	}

	total, err := s.PostRepo.CountByCategory(category.ID)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts by category", err)
	}

	_ = s.PostRepo.CalculateCountsForPosts(posts)

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, total, nil
}

// HasUserClappedPost checks if a user has clapped a specific post
func (s *InsightService) HasUserClappedPost(userID, postID uuid.UUID) (bool, error) {
	return s.UserActivityRepo.HasUserClapped(userID, "post", postID)
}

// ClapPost adds a clap for a post
func (s *InsightService) ClapPost(userID, postID uuid.UUID) (bool, error) {
	existing, err := s.UserActivityRepo.FindByUserAndPost(userID, postID, "clap_post")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, apperror.NewInternal("failed to check clap status", err)
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		activity := &entities.UserActivity{
			ID: uuid.NewV4(), UserID: userID, PostID: &postID,
			ActionType: "clap_post", Count: 1, CreatedAt: time.Now(),
		}
		if err := s.UserActivityRepo.Create(activity); err != nil {
			return false, apperror.NewInternal("failed to create clap", err)
		}
		return true, nil
	}

	if err := s.UserActivityRepo.IncrementCount(existing); err != nil {
		return false, apperror.NewInternal("failed to increment clap", err)
	}
	return true, nil
}

// ClapComment adds a clap for a comment
func (s *InsightService) ClapComment(userID, commentID uuid.UUID) (bool, error) {
	existing, err := s.UserActivityRepo.FindByUserAndComment(userID, commentID, "clap_comment")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, apperror.NewInternal("failed to check clap status", err)
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		activity := &entities.UserActivity{
			ID: uuid.NewV4(), UserID: userID, CommentID: &commentID,
			ActionType: "clap_comment", Count: 1, CreatedAt: time.Now(),
		}
		if err := s.UserActivityRepo.Create(activity); err != nil {
			return false, apperror.NewInternal("failed to create clap", err)
		}
		return true, nil
	}

	if err := s.UserActivityRepo.IncrementCount(existing); err != nil {
		return false, apperror.NewInternal("failed to increment clap", err)
	}
	return true, nil
}

// ClapReply adds a clap for a reply
func (s *InsightService) ClapReply(userID, replyID uuid.UUID) (bool, error) {
	existing, err := s.UserActivityRepo.FindByUserAndReply(userID, replyID, "clap_reply")
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, apperror.NewInternal("failed to check clap status", err)
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		activity := &entities.UserActivity{
			ID: uuid.NewV4(), UserID: userID, ReplyID: &replyID,
			ActionType: "clap_reply", Count: 1, CreatedAt: time.Now(),
		}
		if err := s.UserActivityRepo.Create(activity); err != nil {
			return false, apperror.NewInternal("failed to create clap", err)
		}
		return true, nil
	}

	if err := s.UserActivityRepo.IncrementCount(existing); err != nil {
		return false, apperror.NewInternal("failed to increment clap", err)
	}
	return true, nil
}

// GetClapsCount returns clap count for post/comment/reply
func (s *InsightService) GetClapsCount(itemType string, itemID uuid.UUID) (int64, error) {
	return s.UserActivityRepo.GetClapCount(itemType, itemID)
}

// GetPostIDFromComment gets post ID from comment ID
func (s *InsightService) GetPostIDFromComment(commentID uuid.UUID) (*uuid.UUID, error) {
	comment, err := s.CommentRepo.FindByID(commentID)
	if err != nil {
		return nil, apperror.NewNotFound("comment not found")
	}
	return &comment.PostID, nil
}

// HasUserClapped checks if user has clapped an item
func (s *InsightService) HasUserClapped(userID uuid.UUID, itemType string, itemID uuid.UUID) (bool, error) {
	return s.UserActivityRepo.HasUserClapped(userID, itemType, itemID)
}

func (s *InsightService) createImageReference(imageID string, postID uuid.UUID, refType string) error {
	id, err := uuid.FromString(imageID)
	if err != nil {
		return err
	}

	if _, err := s.ImageRepo.FindReference(id, postID, refType); err == nil {
		return nil // Already exists
	}

	ref := &entities.ImageReference{
		ID: uuid.NewV4(), ImageID: id, PostID: postID,
		RefType: refType, CreatedAt: time.Now(),
	}
	return s.ImageRepo.CreateReference(ref)
}

// findOrCreateCategories finds or creates categories by name
func (s *InsightService) findOrCreateCategories(names []string) ([]entities.Category, error) {
	var categories []entities.Category
	for _, name := range names {
		category, err := s.CategoryRepo.FindByName(name)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				category = &entities.Category{
					ID: uuid.NewV4(), Name: name,
					CreatedAt: time.Now(), UpdatedAt: time.Now(),
				}
				if err := s.CategoryRepo.Create(category); err != nil {
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
func (s *InsightService) findOrCreateTags(names []string) ([]entities.Tag, error) {
	var tags []entities.Tag
	for _, name := range names {
		tag, err := s.TagRepo.FindByName(name)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				tag = &entities.Tag{
					ID: uuid.NewV4(), Name: name,
					CreatedAt: time.Now(), UpdatedAt: time.Now(),
				}
				if err := s.TagRepo.Create(tag); err != nil {
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

// extractExcerpt extracts preview text from JSON content
func (s *InsightService) extractExcerpt(content json.RawMessage) string {
	plainText := s.StorageManager.ExtractPlainTextFromJSON(content)
	words := strings.Fields(plainText)
	if len(words) > 55 {
		return strings.Join(words[:55], " ") + "..."
	}
	return plainText
}
