package service

import (
	"github.com/pdhoang91/blog/internal/entities"
	"github.com/pdhoang91/blog/internal/model"
	uuid "github.com/satori/go.uuid"
)

// InsightService contains all dependencies and business logic
type InsightService struct {
	*BaseService

	// Entity instances for method calls
	User        *entities.User
	Post        *entities.Post
	Category    *entities.Category
	Comment     *entities.Comment
	Reply       *entities.Reply
	Bookmark    *entities.Bookmark
	Tag         *entities.Tag
	PostContent *entities.PostContent

	// External clients (to be implemented later)
	// Logger         *clog.Clog
	// HttpCnt        httpCnt.IHttpClient
	// AhCnt          ahclient.IAutoHelperClient
	// KeyCnt         keyclient.IKeyClient
	// MCnt           modelclient.IModelClient
	// SCnt           sourceclient.ISourceClient
	// UserCnt        userClient.IUserClient
	// ImgCvt         imgconvert.IImageConvert
	// WebHookCnt     webhook.WebhookClient
	// TokenMaker     token.IMakerV1
	// EventProcessor eventprocessor.IEventProcessor
}

// NewInsightService creates a new insight service with all dependencies
func NewInsightService(
	baseService *BaseService,
) *InsightService {
	return &InsightService{
		BaseService: baseService,
		User:        &entities.User{},
		Post:        &entities.Post{},
		Category:    &entities.Category{},
		Comment:     &entities.Comment{},
		Reply:       &entities.Reply{},
		Bookmark:    &entities.Bookmark{},
		Tag:         &entities.Tag{},
		PostContent: &entities.PostContent{},
	}
}

// GetUserBookmarksWithUsername is a wrapper method for GetUserBookmarks that returns username
func (s *InsightService) GetUserBookmarksWithUsername(userID uuid.UUID, req *model.PaginationRequest) ([]*model.PostResponse, string, int64, error) {
	return s.GetUserBookmarks(userID, req)
}
