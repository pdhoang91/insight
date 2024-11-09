package search

import (
	"context"
	"fmt"
	"log"

	"github.com/olivere/elastic/v7"

	"github.com/pdhoang91/blog/models"
)

func BulkIndexPosts(posts []models.SearchPost) error {
	ctx := context.Background()
	bulkRequest := Client.Bulk()

	for _, post := range posts {
		doc := map[string]interface{}{
			"id":              post.ID.String(),
			"title":           post.Title,
			"title_name":      post.TitleName,
			"preview_content": post.PreviewContent,
			"content":         post.Content,
			"tags":            post.Tags,
			"categories":      post.Categories,
			"user_id":         post.UserID.String(),
			"created_at":      post.CreatedAt,
			"claps":           post.ClapCount,
			"views":           post.Views,
			"comments_count":  post.CommentsCount,
			"average_rating":  post.AverageRating,
		}

		req := elastic.NewBulkIndexRequest().
			Index("posts").
			Id(post.ID.String()).
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
					log.Printf("Failed to index post ID %s: %s", resp.Id, resp.Error.Reason)
				}
			}
		}
		return fmt.Errorf("bulk indexing encountered errors")
	}

	return nil
}
