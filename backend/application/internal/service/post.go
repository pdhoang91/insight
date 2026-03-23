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
	"github.com/pdhoang91/blog/internal/repository"
	"github.com/pdhoang91/blog/pkg/revalidation"
	"github.com/pdhoang91/blog/pkg/utils"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// CreatePost creates a new post
func (s *InsightService) CreatePost(userID uuid.UUID, req *dto.CreatePostRequest) (*dto.PostResponse, error) {
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, apperror.NewInternal("failed to start transaction", tx.Error)
	}
	defer tx.Rollback() //nolint:errcheck

	txPostRepo := s.postRepo.WithTx(tx)
	txPostContentRepo := s.postContentRepo.WithTx(tx)
	txCategoryRepo := s.categoryRepo.WithTx(tx)
	txTagRepo := s.tagRepo.WithTx(tx)

	coverImage := req.CoverImage
	if coverImage == "" {
		feURL := os.Getenv("BASE_FE_URL")
		if feURL == "" {
			feURL = "http://localhost:3000"
		}
		coverImage = feURL + "/images/insight.jpg"
	}

	slug := utils.CreateSlug(req.Title)
	if _, err := s.postRepo.FindBySlug(slug); err == nil {
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
		return nil, apperror.NewInternal("failed to create post", err)
	}

	var processedJSON json.RawMessage
	if len(req.Content) > 0 {
		processedJSON = s.storageManager.ProcessJSONContent(req.Content)
		postContent := &entities.PostContent{
			ID:        uuid.NewV4(),
			PostID:    post.ID,
			Content:   processedJSON,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := txPostContentRepo.Create(postContent); err != nil {
			return nil, apperror.NewInternal("failed to create post content", err)
		}
	}

	if len(req.CategoryNames) > 0 {
		categories, err := s.findOrCreateCategories(req.CategoryNames, txCategoryRepo)
		if err != nil {
			return nil, err
		}
		if err := txPostRepo.AppendCategories(post, categories); err != nil {
			return nil, apperror.NewInternal("failed to associate categories", nil)
		}
	}

	if len(req.TagNames) > 0 {
		tags, err := s.findOrCreateTags(req.TagNames, txTagRepo)
		if err != nil {
			return nil, err
		}
		if err := txPostRepo.AppendTags(post, tags); err != nil {
			return nil, apperror.NewInternal("failed to associate tags", nil)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, apperror.NewInternal("failed to commit transaction", err)
	}

	// Create image references after commit (best-effort)
	if len(processedJSON) > 0 {
		imageIDs := s.storageManager.ExtractImageIDsFromJSON(processedJSON)
		for _, imgID := range imageIDs {
			_ = s.createImageReference(imgID, post.ID, "content")
		}
	}

	if err := s.postRepo.LoadRelationships(post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	revalidation.TriggerPostRevalidation(post.Slug)
	s.invalidatePostListCaches()

	return dto.NewPostResponse(post), nil
}

func (s *InsightService) invalidatePostListCaches() {
	s.cache.DeletePrefix("list_posts:")
	s.cache.DeletePrefix("latest_posts:")
	s.cache.DeletePrefix("popular_posts:")
	s.cache.Delete("home_data")
}

func (s *InsightService) invalidatePostDetailCaches(slug string, id uuid.UUID) {
	s.cache.Delete("post_slug:" + slug)
	s.cache.Delete(fmt.Sprintf("post_id:%s", id.String()))
}

func (s *InsightService) ListPosts(req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	cacheKey := fmt.Sprintf("list_posts:%d:%d", req.Limit, req.Offset)
	if cachedPosts, ok1 := s.cache.Get(cacheKey); ok1 {
		if cachedTotal, ok2 := s.cache.Get(cacheKey + ":total"); ok2 {
			return cachedPosts.([]*dto.PostResponse), cachedTotal.(int64), nil
		}
	}

	posts, err := s.postRepo.FindAll(req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to list posts", err)
	}

	total, err := s.postRepo.Count()
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts", err)
	}

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	s.cache.Set(cacheKey, responses, 2*time.Minute)
	s.cache.Set(cacheKey+":total", total, 2*time.Minute)
	return responses, total, nil
}

// GetPost retrieves a post by ID
func (s *InsightService) GetPost(id uuid.UUID) (*dto.PostResponse, error) {
	cacheKey := fmt.Sprintf("post_id:%s", id.String())
	if cached, ok := s.cache.Get(cacheKey); ok {
		if resp, ok := cached.(*dto.PostResponse); ok {
			s.BufferViewIncrement(id)
			return resp, nil
		}
	}

	post, err := s.postRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to get post", err)
	}

	s.BufferViewIncrement(post.ID)
	if err := s.loadPostRelationsParallel(post); err != nil {
		return nil, apperror.NewInternal("failed to load post relations", err)
	}

	resp := dto.NewPostResponse(post)
	s.cache.Set(cacheKey, resp, 60*time.Second)
	return resp, nil
}

// GetPostBySlug retrieves a post by slug
func (s *InsightService) GetPostBySlug(slug string) (*dto.PostResponse, error) {
	cacheKey := "post_slug:" + slug
	if cached, ok := s.cache.Get(cacheKey); ok {
		if resp, ok := cached.(*dto.PostResponse); ok {
			s.BufferViewIncrement(resp.ID)
			return resp, nil
		}
	}

	post, err := s.postRepo.FindBySlug(slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to get post by slug", err)
	}

	s.BufferViewIncrement(post.ID)
	if err := s.loadPostRelationsParallel(post); err != nil {
		return nil, apperror.NewInternal("failed to load post relations", err)
	}

	resp := dto.NewPostResponse(post)
	s.cache.Set(cacheKey, resp, 60*time.Second)
	return resp, nil
}

// loadPostRelationsParallel loads post content and relationships concurrently.
func (s *InsightService) loadPostRelationsParallel(post *entities.Post) error {
	var relErr error
	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		s.loadPostContent(post)
	}()
	go func() {
		defer wg.Done()
		relErr = s.postRepo.LoadRelationships(post)
	}()
	wg.Wait()
	return relErr
}

// loadPostContent loads and processes post content for display
func (s *InsightService) loadPostContent(post *entities.Post) {
	postContent, err := s.postContentRepo.FindByPostID(post.ID)
	if err != nil || postContent == nil {
		return
	}
	post.Content = s.storageManager.ProcessJSONContentForDisplay(postContent.Content)
}

// GetPostEntity returns the raw post entity (for internal use)
func (s *InsightService) GetPostEntity(id uuid.UUID) (*entities.Post, error) {
	post, err := s.postRepo.FindByID(id)
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
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, apperror.NewInternal("failed to start transaction", tx.Error)
	}
	defer tx.Rollback() //nolint:errcheck

	txPostRepo := s.postRepo.WithTx(tx)
	txPostContentRepo := s.postContentRepo.WithTx(tx)
	txCategoryRepo := s.categoryRepo.WithTx(tx)
	txTagRepo := s.tagRepo.WithTx(tx)

	post, err := txPostRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperror.NewNotFound("post not found")
		}
		return nil, apperror.NewInternal("failed to find post", err)
	}

	if post.UserID != userID {
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
				return nil, apperror.NewInternal("failed to find post content", err)
			}
		}

		oldContent := postContent.Content
		processedJSON := s.storageManager.ProcessJSONContent(req.Content)
		postContent.Content = processedJSON
		postContent.UpdatedAt = time.Now()

		if postContent.ID == uuid.Nil {
			postContent.ID = uuid.NewV4()
			if err := txPostContentRepo.Create(postContent); err != nil {
				return nil, apperror.NewInternal("failed to create post content", err)
			}
		} else {
			if err := txPostContentRepo.Update(postContent); err != nil {
				return nil, apperror.NewInternal("failed to update post content", err)
			}
		}

		// Update image references (best-effort)
		_ = s.storageManager.UpdateJSONImageReferences(context.Background(), post.ID, oldContent, postContent.Content)
	}

	if req.CategoryNames != nil {
		var categories []entities.Category
		if len(*req.CategoryNames) > 0 {
			var err error
			categories, err = s.findOrCreateCategories(*req.CategoryNames, txCategoryRepo)
			if err != nil {
				return nil, err
			}
		}
		if err := txPostRepo.ReplaceCategories(post, categories); err != nil {
			return nil, apperror.NewInternal("failed to update categories", nil)
		}
	}

	if req.TagNames != nil {
		var tags []entities.Tag
		if len(*req.TagNames) > 0 {
			var err error
			tags, err = s.findOrCreateTags(*req.TagNames, txTagRepo)
			if err != nil {
				return nil, err
			}
		}
		if err := txPostRepo.ReplaceTags(post, tags); err != nil {
			return nil, apperror.NewInternal("failed to update tags", nil)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, apperror.NewInternal("failed to commit transaction", err)
	}

	if err := s.postRepo.LoadRelationships(post); err != nil {
		return nil, apperror.NewInternal("failed to load post relationships", err)
	}

	revalidation.TriggerPostRevalidation(post.Slug)
	s.invalidatePostListCaches()
	s.invalidatePostDetailCaches(post.Slug, post.ID)

	return dto.NewPostResponse(post), nil
}

func (s *InsightService) DeletePost(userID uuid.UUID, id uuid.UUID) error {
	tx := s.db.Begin()
	if tx.Error != nil {
		return apperror.NewInternal("failed to start transaction", tx.Error)
	}
	defer tx.Rollback() //nolint:errcheck

	txPostRepo := s.postRepo.WithTx(tx)
	txPostContentRepo := s.postContentRepo.WithTx(tx)
	txCommentRepo := s.commentRepo.WithTx(tx)
	txReplyRepo := s.replyRepo.WithTx(tx)

	post, err := txPostRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NewNotFound("post not found")
		}
		return apperror.NewInternal("failed to find post", err)
	}

	if post.UserID != userID {
		return apperror.NewForbidden("you do not own this post")
	}

	if err := txPostRepo.Delete(post); err != nil {
		return apperror.NewInternal("failed to delete post", err)
	}

	if err := txCommentRepo.DeleteByPostID(id); err != nil {
		return apperror.NewInternal("failed to delete comments", err)
	}

	if err := txReplyRepo.DeleteByPostID(id); err != nil {
		return apperror.NewInternal("failed to delete replies", err)
	}

	if err := txPostContentRepo.DeleteByPostID(id); err != nil {
		return apperror.NewInternal("failed to delete post content", err)
	}

	if err := tx.Commit().Error; err != nil {
		return apperror.NewInternal("failed to commit transaction", err)
	}

	revalidation.TriggerPostRevalidation(post.Slug)
	s.invalidatePostListCaches()
	s.invalidatePostDetailCaches(post.Slug, post.ID)

	return nil
}

func (s *InsightService) DeletePostImages(ctx context.Context, postID uuid.UUID, userID uuid.UUID) error {
	imageRefs, err := s.imageRepo.FindReferencesByPostID(postID)
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

	posts, err := s.postRepo.FindByUserID(userID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get user posts", err)
	}

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	total, err := s.postRepo.CountByUserID(userID)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count user posts", err)
	}
	return responses, total, nil
}

// SearchPosts searches for posts
func (s *InsightService) SearchPosts(query string, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	posts, err := s.postRepo.Search(query, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to search posts", err)
	}

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	total, err := s.postRepo.CountSearch(query)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count search results", err)
	}
	return responses, total, nil
}

func (s *InsightService) GetLatestPosts(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	cacheKey := fmt.Sprintf("latest_posts:%d", limit)
	if cached, ok := s.cache.Get(cacheKey); ok {
		return cached.([]*dto.PostResponse), nil
	}

	posts, err := s.postRepo.FindAll(limit, 0)
	if err != nil {
		return nil, apperror.NewInternal("failed to get latest posts", err)
	}

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	s.cache.Set(cacheKey, responses, 2*time.Minute)
	return responses, nil
}

func (s *InsightService) GetPopularPosts(limit int) ([]*dto.PostResponse, error) {
	if limit == 0 {
		limit = 5
	}

	cacheKey := fmt.Sprintf("popular_posts:%d", limit)
	if cached, ok := s.cache.Get(cacheKey); ok {
		return cached.([]*dto.PostResponse), nil
	}

	posts, err := s.postRepo.GetPopular(limit)
	if err != nil {
		return nil, apperror.NewInternal("failed to get popular posts", err)
	}

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}

	s.cache.Set(cacheKey, responses, 5*time.Minute)
	return responses, nil
}

func (s *InsightService) GetHomeData() (*dto.HomeResponse, error) {
	if cached, ok := s.cache.Get("home_data"); ok {
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
		totalPosts, countErr = s.postRepo.Count()
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

	s.cache.Set("home_data", resp, 2*time.Minute)
	return resp, nil
}

func (s *InsightService) RecalculateEngagementScores() {
	_ = s.postRepo.RecalculateAllEngagementScores()
	s.cache.DeletePrefix("popular_posts:")
	s.cache.Delete("home_data")
}

func (s *InsightService) GetArchiveSummary() ([]*dto.ArchiveSummaryItem, error) {
	const cacheKey = "archive_summary"
	if cached, ok := s.cache.Get(cacheKey); ok {
		return cached.([]*dto.ArchiveSummaryItem), nil
	}

	items, err := s.postRepo.GetArchiveSummary()
	if err != nil {
		return nil, apperror.NewInternal("failed to get archive summary", err)
	}

	s.cache.Set(cacheKey, items, 10*time.Minute)
	return items, nil
}

// GetPostsByYearMonth retrieves posts by year and month
func (s *InsightService) GetPostsByYearMonth(year, month int, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 20
	}

	posts, err := s.postRepo.FindByYearMonth(year, month, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get posts by year/month", err)
	}

	total, err := s.postRepo.CountByYearMonth(year, month)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts by year/month", err)
	}

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

	category, err := s.categoryRepo.FindByName(categoryName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, apperror.NewNotFound("category not found")
		}
		return nil, 0, apperror.NewInternal("failed to find category", err)
	}

	posts, err := s.postRepo.FindByCategory(category.ID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get posts by category", err)
	}

	total, err := s.postRepo.CountByCategory(category.ID)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts by category", err)
	}

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, total, nil
}

// GetPostsByTag retrieves posts by tag name
func (s *InsightService) GetPostsByTag(tagName string, req *dto.PaginationRequest) ([]*dto.PostResponse, int64, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	tag, err := s.tagRepo.FindByName(tagName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, apperror.NewNotFound("tag not found")
		}
		return nil, 0, apperror.NewInternal("failed to find tag", err)
	}

	posts, err := s.postRepo.FindByTag(tag.ID, req.Limit, req.Offset)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to get posts by tag", err)
	}

	total, err := s.postRepo.CountByTag(tag.ID)
	if err != nil {
		return nil, 0, apperror.NewInternal("failed to count posts by tag", err)
	}

	responses := make([]*dto.PostResponse, 0, len(posts))
	for _, post := range posts {
		responses = append(responses, dto.NewPostResponse(post))
	}
	return responses, total, nil
}

// GetPostIDFromComment gets post ID from comment ID
func (s *InsightService) GetPostIDFromComment(commentID uuid.UUID) (*uuid.UUID, error) {
	comment, err := s.commentRepo.FindByID(commentID)
	if err != nil {
		return nil, apperror.NewNotFound("comment not found")
	}
	return &comment.PostID, nil
}

func (s *InsightService) createImageReference(imageID string, postID uuid.UUID, refType string) error {
	id, err := uuid.FromString(imageID)
	if err != nil {
		return err
	}

	if _, err := s.imageRepo.FindReference(id, postID, refType); err == nil {
		return nil // Already exists
	}

	ref := &entities.ImageReference{
		ID: uuid.NewV4(), ImageID: id, PostID: postID,
		RefType: refType, CreatedAt: time.Now(),
	}
	return s.imageRepo.CreateReference(ref)
}

// findOrCreateCategories finds or creates categories by name within a transaction
func (s *InsightService) findOrCreateCategories(names []string, txCategoryRepo repository.CategoryRepository) ([]entities.Category, error) {
	var categories []entities.Category
	for _, name := range names {
		category, err := txCategoryRepo.FindByName(name)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				category = &entities.Category{
					ID: uuid.NewV4(), Name: name,
					CreatedAt: time.Now(), UpdatedAt: time.Now(),
				}
				if err := txCategoryRepo.Create(category); err != nil {
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

// findOrCreateTags finds or creates tags by name within a transaction
func (s *InsightService) findOrCreateTags(names []string, txTagRepo repository.TagRepository) ([]entities.Tag, error) {
	var tags []entities.Tag
	for _, name := range names {
		tag, err := txTagRepo.FindByName(name)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				tag = &entities.Tag{
					ID: uuid.NewV4(), Name: name,
					CreatedAt: time.Now(), UpdatedAt: time.Now(),
				}
				if err := txTagRepo.Create(tag); err != nil {
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
	plainText := s.storageManager.ExtractPlainTextFromJSON(content)
	words := strings.Fields(plainText)
	if len(words) > 55 {
		return strings.Join(words[:55], " ") + "..."
	}
	return plainText
}
