// search/search.go
package search

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/olivere/elastic/v7"
	uuid "github.com/satori/go.uuid"

	"github.com/pdhoang91/blog/models"
)

var Client *elastic.Client

// InitElasticsearch khởi tạo client Elasticsearch và tạo các index nếu chưa tồn tại
func InitElasticsearch(url string) *elastic.Client {
	var err error

	for i := 0; i < 5; i++ {
		Client, err = elastic.NewClient(elastic.SetURL(url), elastic.SetSniff(false))
		if err != nil {
			log.Printf("Failed to create Elasticsearch client: %v", err)
			log.Printf("Elasticsearch not ready, retrying in 5 seconds... (%d/5)", i+1)
			time.Sleep(5 * time.Second)
			continue
		}

		// Kiểm tra trạng thái kết nối
		ctx := context.Background()
		_, _, err = Client.Ping(url).Do(ctx)
		if err == nil {
			log.Printf("Elasticsearch connected: %s", url)
			break
		}

		log.Printf("Failed to connect to Elasticsearch: %s", err)
		log.Printf("Elasticsearch not ready, retrying in 5 seconds... (%d/5)", i+1)
		time.Sleep(5 * time.Second)
	}

	if Client == nil {
		log.Fatalf("Failed to create Elasticsearch client after 5 attempts: %v", err)
	}

	// Tạo mapping nếu chưa tồn tại
	if err := CreatePostsIndexIfNotExists(); err != nil {
		log.Fatalf("Failed to create posts index: %v", err)
	}
	if err := CreateTagsIndexIfNotExists(); err != nil {
		log.Fatalf("Failed to create tags index: %v", err)
	}
	if err := CreateCategoriesIndexIfNotExists(); err != nil {
		log.Fatalf("Failed to create categories index: %v", err)
	}

	log.Println("Elasticsearch initialized successfully.")
	return Client
}

// CreatePostsIndexIfNotExists tạo index "posts" nếu chưa tồn tại
func CreatePostsIndexIfNotExists() error {
	ctx := context.Background()
	exists, err := Client.IndexExists("posts").Do(ctx)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	mapping := `
	{
		"mappings": {
			"properties": {
				"title": { "type": "text" },
				"content": { "type": "text" },
				"tags": { "type": "keyword" },
				"categories": { "type": "keyword" },
				"user_id": { "type": "integer" },
				"created_at": { "type": "date" },
				"claps": { "type": "integer" },
				"views": { "type": "integer" },
				"clap_count": { "type": "integer" },
				"comments_count": { "type": "long" },
				"average_rating": { "type": "float" }
			}
		}
	}`

	_, err = Client.CreateIndex("posts").BodyString(mapping).Do(ctx)
	if err != nil {
		return err
	}

	return nil
}

// CreateTagsIndexIfNotExists tạo index "tags" nếu chưa tồn tại
func CreateTagsIndexIfNotExists() error {
	ctx := context.Background()
	exists, err := Client.IndexExists("tags").Do(ctx)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	mapping := `
	{
		"mappings": {
			"properties": {
				"name": { 
					"type": "completion" 
				}
			}
		}
	}`

	_, err = Client.CreateIndex("tags").BodyString(mapping).Do(ctx)
	if err != nil {
		return err
	}

	return nil
}

// CreateCategoriesIndexIfNotExists tạo index "categories" nếu chưa tồn tại
func CreateCategoriesIndexIfNotExists() error {
	ctx := context.Background()
	exists, err := Client.IndexExists("categories").Do(ctx)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	mapping := `
	{
		"mappings": {
			"properties": {
				"name": { 
					"type": "completion" 
				}
			}
		}
	}`

	_, err = Client.CreateIndex("categories").BodyString(mapping).Do(ctx)
	if err != nil {
		return err
	}

	return nil
}

// IndexPost chỉ định một bài viết vào Elasticsearch
func IndexPost(post models.Post) error {
	ctx := context.Background()

	// Chuẩn bị dữ liệu cho Elasticsearch
	var tags []string
	for _, tag := range post.Tags {
		tags = append(tags, tag.Name)
	}

	var categories []string
	for _, cat := range post.Categories {
		categories = append(categories, cat.Name)
	}

	doc := map[string]interface{}{
		"id":             post.ID,
		"title":          post.Title,
		"content":        post.Content,
		"tags":           tags,
		"categories":     categories,
		"user_id":        post.UserID,
		"created_at":     post.CreatedAt,
		"claps":          post.ClapCount, // Đảm bảo bạn có trường ClapCount trong mô hình Post
		"views":          post.Views,     // Đảm bảo bạn có trường Views trong mô hình Post
		"comments_count": post.CommentsCount,
		"average_rating": post.AverageRating,
	}

	_, err := Client.Index().
		Index("posts").
		Id(fmt.Sprintf("%d", post.ID)).
		BodyJson(doc).
		Do(ctx)
	if err != nil {
		log.Printf("Failed to index post ID %d: %v", post.ID, err)
		return err
	}
	log.Printf("Successfully indexed post ID %d", post.ID)
	return err
}

// DeletePostFromIndex xóa bài viết khỏi Elasticsearch
func DeletePostFromIndex(postID uuid.UUID) error {
	ctx := context.Background()
	_, err := Client.Delete().
		Index("posts").
		Id(fmt.Sprintf("%d", postID)).
		Do(ctx)
	return err
}

// IndexTag chỉ định một tag vào Elasticsearch
func IndexTag(tag models.Tag) error {
	ctx := context.Background()

	doc := map[string]interface{}{
		"name": tag.Name,
	}

	_, err := Client.Index().
		Index("tags").
		Id(fmt.Sprintf("%d", tag.ID)).
		BodyJson(doc).
		Do(ctx)

	if err != nil {
		log.Printf("Failed to index tag ID %d: %v", tag.ID, err)
		return err
	}
	log.Printf("Successfully indexed tag ID %d", tag.ID)
	return err
}

// DeleteTagFromIndex xóa tag khỏi Elasticsearch
func DeleteTagFromIndex(tagID uuid.UUID) error {
	ctx := context.Background()
	_, err := Client.Delete().
		Index("tags").
		Id(fmt.Sprintf("%d", tagID)).
		Do(ctx)
	if err != nil {
		log.Printf("Failed to DeleteTagFromIndex %d: %v", tagID, err)
		return err
	}
	log.Printf("Successfully DeleteTagFromIndex %d", tagID)
	return err
}

// IndexCategory chỉ định một category vào Elasticsearch
func IndexCategory(category models.Category) error {
	ctx := context.Background()

	doc := map[string]interface{}{
		"name": category.Name,
	}

	_, err := Client.Index().
		Index("categories").
		Id(fmt.Sprintf("%d", category.ID)).
		BodyJson(doc).
		Do(ctx)

	if err != nil {
		log.Printf("Failed to index category ID %d: %v", category.ID, err)
		return err
	}

	log.Printf("Successfully indexed category ID %d", category.ID)
	return err
}

// DeleteCategoryFromIndex xóa category khỏi Elasticsearch
func DeleteCategoryFromIndex(categoryID uuid.UUID) error {
	ctx := context.Background()
	_, err := Client.Delete().
		Index("categories").
		Id(fmt.Sprintf("%d", categoryID)).
		Do(ctx)
	return err
}

func SearchPosts(query string, category string, tags []string, fuzzy bool, autocomplete bool, page int, limit int) ([]models.SearchPost, int, error) {
	ctx := context.Background()
	boolQuery := elastic.NewBoolQuery()

	// Thêm điều kiện tìm kiếm tiêu đề và nội dung
	if query != "" {
		matchTitle := elastic.NewMatchQuery("title", query).Operator("or")
		matchContent := elastic.NewMatchQuery("content", query).Operator("or")
		boolQuery = boolQuery.Should(matchTitle, matchContent)
	}

	// Thêm điều kiện lọc theo category
	if category != "" {
		boolQuery = boolQuery.Filter(elastic.NewTermQuery("categories", category))
	}

	// Thêm điều kiện lọc theo tags
	if len(tags) > 0 {
		// Chuyển []string sang []interface{}
		tagsInterface := make([]interface{}, len(tags))
		for i, tag := range tags {
			tagsInterface[i] = tag
		}
		boolQuery = boolQuery.Filter(elastic.NewTermsQuery("tags", tagsInterface...))
	}

	// Thêm tính năng fuzzy search
	if fuzzy && query != "" {
		fuzzyTitle := elastic.NewFuzzyQuery("title", query).Fuzziness("AUTO")
		fuzzyContent := elastic.NewFuzzyQuery("content", query).Fuzziness("AUTO")
		boolQuery = boolQuery.Should(fuzzyTitle, fuzzyContent)
	}

	// Tính toán pagination
	from := (page - 1) * limit

	// Tạo search service với các tham số đã cấu hình
	searchService := Client.Search().
		Index("posts").
		Query(boolQuery).
		Sort("created_at", false). // Sắp xếp theo ngày tạo mới nhất
		From(from).
		Size(limit)

	// Thêm tính năng autocomplete nếu cần
	if autocomplete {
		completionQuery := elastic.NewCompletionSuggester("suggest").
			Field("name").
			Prefix(query).
			Fuzziness("AUTO").
			Size(5)

		searchService = searchService.Suggester(completionQuery)
	}

	// Thực hiện tìm kiếm
	searchResult, err := searchService.Do(ctx)
	if err != nil {
		return nil, 0, err
	}

	// Tổng số kết quả
	total := int(searchResult.Hits.TotalHits.Value)

	log.Printf("Search query: %s, found %d results", query, total)

	// Xử lý kết quả tìm kiếm
	var posts []models.SearchPost
	for _, hit := range searchResult.Hits.Hits {
		var post models.SearchPost
		if err := json.Unmarshal(hit.Source, &post); err != nil {
			log.Printf("json.Unmarshal err: %s", err)
			continue
		}
		posts = append(posts, post)
	}

	return posts, total, nil
}

// SuggestTags cung cấp gợi ý cho tags
func SuggestTags(query string) ([]string, error) {
	ctx := context.Background()
	suggest := elastic.NewCompletionSuggester("tag-suggest").
		Field("name").
		Prefix(query).
		Fuzziness("AUTO").
		Size(5)

	searchService := Client.Search().
		Index("tags").
		Suggester(suggest)

	searchResult, err := searchService.Do(ctx)
	if err != nil {
		return nil, err
	}

	var suggestions []string
	if tagSuggest, found := searchResult.Suggest["tag-suggest"]; found {
		for _, option := range tagSuggest[0].Options {
			suggestions = append(suggestions, option.Text)
		}
	}

	return suggestions, nil
}

// SuggestCategories cung cấp gợi ý cho categories
func SuggestCategories(query string) ([]string, error) {
	ctx := context.Background()
	suggest := elastic.NewCompletionSuggester("category-suggest").
		Field("name").
		Prefix(query).
		Fuzziness("AUTO").
		Size(5)

	searchService := Client.Search().
		Index("categories").
		Suggester(suggest)

	searchResult, err := searchService.Do(ctx)
	if err != nil {
		return nil, err
	}

	var suggestions []string
	if categorySuggest, found := searchResult.Suggest["category-suggest"]; found {
		for _, option := range categorySuggest[0].Options {
			suggestions = append(suggestions, option.Text)
		}
	}

	return suggestions, nil
}

// BulkIndexPosts chỉ định nhiều bài viết vào Elasticsearch trong một lần bulk.
func BulkIndexPosts(posts []models.Post) error {
	ctx := context.Background()
	bulkRequest := Client.Bulk()

	for _, post := range posts {
		// Chuẩn bị tài liệu cho bulk index
		doc := map[string]interface{}{
			"id":             post.ID,
			"title":          post.Title,
			"content":        post.Content,
			"tags":           extractTagNames(post.Tags),
			"categories":     extractCategoryNames(post.Categories),
			"user_id":        post.UserID,
			"created_at":     post.CreatedAt,
			"claps":          post.ClapCount,
			"views":          post.Views,
			"comments_count": post.CommentsCount,
			"average_rating": post.AverageRating,
		}

		req := elastic.NewBulkIndexRequest().
			Index("posts").
			Id(fmt.Sprintf("%d", post.ID)).
			Doc(doc)

		bulkRequest = bulkRequest.Add(req)
	}

	// Thực hiện bulk request
	bulkResponse, err := bulkRequest.Do(ctx)
	if err != nil {
		return err
	}

	// Kiểm tra lỗi trong bulk response
	if bulkResponse.Errors {
		// Lặp qua các mục để tìm lỗi
		for _, item := range bulkResponse.Items {
			for _, resp := range item {
				if resp.Error != nil {
					log.Printf("Failed to index post ID %s: %s", resp.Id, resp.Error.Reason)
				}
			}
		}
		return fmt.Errorf("bulk indexing encountered errors")
	}

	return nil
}

// Hàm hỗ trợ để lấy tên tags
func extractTagNames(tags []models.Tag) []string {
	names := make([]string, len(tags))
	for i, tag := range tags {
		names[i] = tag.Name
	}
	return names
}

// Hàm hỗ trợ để lấy tên categories
func extractCategoryNames(categories []models.Category) []string {
	names := make([]string, len(categories))
	for i, cat := range categories {
		names[i] = cat.Name
	}
	return names
}

// BulkIndexTags chỉ định nhiều tag vào Elasticsearch trong một lần bulk.
func BulkIndexTags(tags []models.Tag) error {
	ctx := context.Background()
	bulkRequest := Client.Bulk()

	for _, tag := range tags {
		doc := map[string]interface{}{
			"name": tag.Name,
		}

		req := elastic.NewBulkIndexRequest().
			Index("tags").
			Id(fmt.Sprintf("%d", tag.ID)).
			Doc(doc)

		bulkRequest = bulkRequest.Add(req)
	}

	// Thực hiện bulk request
	bulkResponse, err := bulkRequest.Do(ctx)
	if err != nil {
		return err
	}

	// Kiểm tra lỗi trong bulk response
	if bulkResponse.Errors {
		for _, item := range bulkResponse.Items {
			for _, resp := range item {
				if resp.Error != nil {
					log.Printf("Failed to index tag ID %s: %s", resp.Id, resp.Error.Reason)
				}
			}
		}
		return fmt.Errorf("bulk indexing tags encountered errors")
	}

	return nil
}

// BulkIndexCategories chỉ định nhiều category vào Elasticsearch trong một lần bulk.
func BulkIndexCategories(categories []models.Category) error {
	ctx := context.Background()
	bulkRequest := Client.Bulk()

	for _, category := range categories {
		doc := map[string]interface{}{
			"name": category.Name,
		}

		req := elastic.NewBulkIndexRequest().
			Index("categories").
			Id(fmt.Sprintf("%d", category.ID)).
			Doc(doc)

		bulkRequest = bulkRequest.Add(req)
	}

	// Thực hiện bulk request
	bulkResponse, err := bulkRequest.Do(ctx)
	if err != nil {
		return err
	}

	// Kiểm tra lỗi trong bulk response
	if bulkResponse.Errors {
		for _, item := range bulkResponse.Items {
			for _, resp := range item {
				if resp.Error != nil {
					log.Printf("Failed to index category ID %s: %s", resp.Id, resp.Error.Reason)
				}
			}
		}
		return fmt.Errorf("bulk indexing categories encountered errors")
	}

	return nil
}
