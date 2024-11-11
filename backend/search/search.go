// search/search.go
package search

// import (
// 	"context"
// 	"encoding/json"
// 	"fmt"
// 	"log"
// 	"time"

// 	"github.com/olivere/elastic/v7"
// 	uuid "github.com/satori/go.uuid"

// 	"github.com/pdhoang91/blog/models"
// )

// var Client *elastic.Client

// // InitElasticsearch khởi tạo client Elasticsearch và tạo các index nếu chưa tồn tại
// func InitElasticsearch(url string) *elastic.Client {
// 	var err error

// 	for i := 0; i < 5; i++ {
// 		Client, err = elastic.NewClient(elastic.SetURL(url), elastic.SetSniff(false))
// 		if err != nil {
// 			log.Printf("Failed to create Elasticsearch client: %v", err)
// 			log.Printf("Elasticsearch not ready, retrying in 5 seconds... (%d/5)", i+1)
// 			time.Sleep(5 * time.Second)
// 			continue
// 		}

// 		// Kiểm tra trạng thái kết nối
// 		ctx := context.Background()
// 		_, _, err = Client.Ping(url).Do(ctx)
// 		if err == nil {
// 			log.Printf("Elasticsearch connected: %s", url)
// 			break
// 		}

// 		log.Printf("Failed to connect to Elasticsearch: %s", err)
// 		log.Printf("Elasticsearch not ready, retrying in 5 seconds... (%d/5)", i+1)
// 		time.Sleep(5 * time.Second)
// 	}

// 	if Client == nil {
// 		log.Fatalf("Failed to create Elasticsearch client after 5 attempts: %v", err)
// 	}

// 	//err = RecreatePostsIndex()
// 	//if err != nil {
// 	//	log.Fatalf("Failed to RecreatePostsIndex: %v", err)
// 	//	return nil
// 	//}

// 	// Tạo mapping nếu chưa tồn tại
// 	if err := CreatePostsIndexIfNotExists(); err != nil {
// 		log.Fatalf("Failed to create posts index: %v", err)
// 	}

// 	log.Println("Elasticsearch initialized successfully.")
// 	return Client
// }

// func RecreatePostsIndex() error {
// 	ctx := context.Background()

// 	// Xóa chỉ mục hiện tại
// 	_, err := Client.DeleteIndex("posts").Do(ctx)
// 	if err != nil {
// 		return fmt.Errorf("failed to delete existing posts index: %v", err)
// 	}

// 	return nil
// }

// // CreatePostsIndexIfNotExists tạo index "posts" nếu chưa tồn tại
// func CreatePostsIndexIfNotExists() error {
// 	ctx := context.Background()
// 	exists, err := Client.IndexExists("posts").Do(ctx)
// 	if err != nil {
// 		return err
// 	}
// 	if exists {
// 		return nil
// 	}

// 	mapping := `
//    {
//        "mappings": {
//            "properties": {
//                "id": { "type": "keyword" },
//                "title": { "type": "text", "analyzer": "standard" },
//                "title_name": { "type": "text", "analyzer": "standard" },
//                "preview_content": { "type": "text", "analyzer": "standard" },
//                "content": { "type": "text", "analyzer": "standard" },
//                "tags": { "type": "keyword" },
//                "categories": { "type": "keyword" },
//                "user_id": { "type": "keyword" },
//                "created_at": { "type": "date" },
//                "claps": { "type": "integer" },
//                "views": { "type": "integer" },
//                "comments_count": { "type": "long" },
//                "average_rating": { "type": "float" }
//            }
//        }
//    }`

// 	_, err = Client.CreateIndex("posts").BodyString(mapping).Do(ctx)
// 	if err != nil {
// 		return err
// 	}

// 	return nil
// }

// // / IndexPost chỉ định một bài viết vào Elasticsearch
// func IndexPost(post models.SearchPost) error {
// 	ctx := context.Background()

// 	doc := map[string]interface{}{
// 		"id":              post.ID.String(),
// 		"title":           post.Title,
// 		"title_name":      post.TitleName,
// 		"preview_content": post.PreviewContent,
// 		"content":         post.Content, // Nội dung từ PostContent
// 		"tags":            post.Tags,
// 		"categories":      post.Categories,
// 		"user_id":         post.UserID.String(),
// 		"created_at":      post.CreatedAt,
// 		"claps":           post.ClapCount,
// 		"views":           post.Views,
// 		"comments_count":  post.CommentsCount,
// 		"average_rating":  post.AverageRating,
// 	}

// 	_, err := Client.Index().
// 		Index("posts").
// 		Id(post.ID.String()).
// 		BodyJson(doc).
// 		Do(ctx)
// 	if err != nil {
// 		log.Printf("Failed to index post ID %s: %v", post.ID, err)
// 		return err
// 	}
// 	log.Printf("Successfully indexed post ID %s", post.ID)
// 	return nil
// }

// // DeletePostFromIndex xóa bài viết khỏi Elasticsearch
// func DeletePostFromIndex(postID uuid.UUID) error {
// 	ctx := context.Background()
// 	_, err := Client.Delete().
// 		Index("posts").
// 		Id(postID.String()).
// 		Do(ctx)
// 	if err != nil {
// 		log.Printf("Failed to delete post ID %s from index: %v", postID, err)
// 	}
// 	return err
// }

// // IndexPostContent chỉ định một PostContent vào Elasticsearch
// func IndexPostContent(postContent models.PostContent) error {
// 	ctx := context.Background()

// 	doc := map[string]interface{}{
// 		"id":         postContent.ID.String(),
// 		"post_id":    postContent.PostID.String(),
// 		"content":    postContent.Content,
// 		"created_at": postContent.CreatedAt,
// 		"updated_at": postContent.UpdatedAt,
// 	}

// 	_, err := Client.Index().
// 		Index("postcontents").
// 		Id(postContent.ID.String()).
// 		BodyJson(doc).
// 		Do(ctx)
// 	if err != nil {
// 		log.Printf("Failed to index PostContent ID %s: %v", postContent.ID, err)
// 		return err
// 	}
// 	log.Printf("Successfully indexed PostContent ID %s", postContent.ID)
// 	return nil
// }

// // DeletePostContentFromIndex xóa PostContent khỏi Elasticsearch
// func DeletePostContentFromIndex(postContentID uuid.UUID) error {
// 	ctx := context.Background()
// 	_, err := Client.Delete().
// 		Index("postcontents").
// 		Id(postContentID.String()).
// 		Do(ctx)
// 	if err != nil {
// 		log.Printf("Failed to delete PostContent ID %s from index: %v", postContentID, err)
// 	}
// 	return err
// }

// // SearchPosts thực hiện tìm kiếm trên chỉ mục "posts"
// func SearchPosts(query string, page int, limit int) ([]models.SearchPost, int, error) {
// 	ctx := context.Background()
// 	boolQuery := elastic.NewBoolQuery()

// 	// Thêm điều kiện tìm kiếm trong các trường title, TitleName, PreviewContent, và content
// 	if query != "" {
// 		multiMatch := elastic.NewMultiMatchQuery(query, "title", "title_name", "preview_content", "content").
// 			Operator("or")
// 		boolQuery = boolQuery.Should(multiMatch)
// 	}

// 	// Thêm tính năng fuzzy search kết hợp với prefix search
// 	if query != "" {
// 		// Fuzzy MultiMatch Query
// 		fuzzyMatch := elastic.NewMultiMatchQuery(query, "title", "title_name", "preview_content", "content").
// 			Fuzziness("AUTO").
// 			Operator("or")

// 		// Prefix Query để tìm các từ bắt đầu bằng phần đầu của query
// 		prefixMatch := elastic.NewPrefixQuery("content", query)

// 		// Thêm cả hai vào boolQuery
// 		boolQuery = boolQuery.Should(fuzzyMatch, prefixMatch)
// 	}

// 	// Tính toán pagination
// 	from := (page - 1) * limit

// 	// Tạo search service với các tham số đã cấu hình
// 	searchService := Client.Search().
// 		Index("posts").
// 		Query(boolQuery).
// 		Sort("created_at", false). // Sắp xếp theo ngày tạo mới nhất
// 		From(from).
// 		Size(limit).
// 		TrackTotalHits(true)

// 	// Thực hiện tìm kiếm
// 	searchResult, err := searchService.Do(ctx)
// 	if err != nil {
// 		return nil, 0, err
// 	}

// 	// Tổng số kết quả
// 	total := int(searchResult.Hits.TotalHits.Value)

// 	log.Printf("Search query: %s, found %d results", query, total)

// 	// Xử lý kết quả tìm kiếm
// 	var posts []models.SearchPost
// 	for _, hit := range searchResult.Hits.Hits {
// 		var post models.SearchPost
// 		if err := json.Unmarshal(hit.Source, &post); err != nil {
// 			log.Printf("json.Unmarshal err: %s", err)
// 			continue
// 		}
// 		posts = append(posts, post)
// 	}

// 	return posts, total, nil
// }
