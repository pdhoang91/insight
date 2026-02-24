package repository

import (
	"fmt"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type userActivityRepo struct{}

func NewUserActivityRepository() UserActivityRepository { return &userActivityRepo{} }

func (r *userActivityRepo) Create(db *gorm.DB, activity *entities.UserActivity) error {
	return db.Create(activity).Error
}

func (r *userActivityRepo) FindByUserAndPost(db *gorm.DB, userID, postID uuid.UUID, actionType string) (*entities.UserActivity, error) {
	var activity entities.UserActivity
	err := db.Where("user_id = ? AND post_id = ? AND action_type = ?", userID, postID, actionType).First(&activity).Error
	return &activity, err
}

func (r *userActivityRepo) FindByUserAndComment(db *gorm.DB, userID, commentID uuid.UUID, actionType string) (*entities.UserActivity, error) {
	var activity entities.UserActivity
	err := db.Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, commentID, actionType).First(&activity).Error
	return &activity, err
}

func (r *userActivityRepo) FindByUserAndReply(db *gorm.DB, userID, replyID uuid.UUID, actionType string) (*entities.UserActivity, error) {
	var activity entities.UserActivity
	err := db.Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, replyID, actionType).First(&activity).Error
	return &activity, err
}

func (r *userActivityRepo) IncrementCount(db *gorm.DB, activity *entities.UserActivity) error {
	return db.Model(activity).Update("count", gorm.Expr("count + ?", 1)).Error
}

func (r *userActivityRepo) GetClapCount(db *gorm.DB, itemType string, itemID uuid.UUID) (int64, error) {
	var count int64
	var query *gorm.DB

	switch itemType {
	case "post":
		query = db.Model(&entities.UserActivity{}).Where("post_id = ? AND action_type = ?", itemID, "clap_post")
	case "comment":
		query = db.Model(&entities.UserActivity{}).Where("comment_id = ? AND action_type = ?", itemID, "clap_comment")
	case "reply":
		query = db.Model(&entities.UserActivity{}).Where("reply_id = ? AND action_type = ?", itemID, "clap_reply")
	default:
		return 0, fmt.Errorf("invalid item type: %s", itemType)
	}

	err := query.Select("COALESCE(SUM(count), 0)").Row().Scan(&count)
	return count, err
}

func (r *userActivityRepo) HasUserClapped(db *gorm.DB, userID uuid.UUID, itemType string, itemID uuid.UUID) (bool, error) {
	var count int64
	var query *gorm.DB

	switch itemType {
	case "post":
		query = db.Model(&entities.UserActivity{}).Where("user_id = ? AND post_id = ? AND action_type = ?", userID, itemID, "clap_post")
	case "comment":
		query = db.Model(&entities.UserActivity{}).Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, itemID, "clap_comment")
	case "reply":
		query = db.Model(&entities.UserActivity{}).Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, itemID, "clap_reply")
	default:
		return false, fmt.Errorf("invalid item type: %s", itemType)
	}

	err := query.Count(&count).Error
	return count > 0, err
}

func (r *userActivityRepo) CalculateCommentsAndRepliesCounts(db *gorm.DB, comments []*entities.Comment) error {
	if len(comments) == 0 {
		return nil
	}

	commentIDs := make([]uuid.UUID, len(comments))
	var replyIDs []uuid.UUID
	for i, c := range comments {
		commentIDs[i] = c.ID
		for _, reply := range c.Replies {
			replyIDs = append(replyIDs, reply.ID)
		}
	}

	// Bulk reply counts
	type ReplyCountResult struct {
		CommentID  uuid.UUID
		ReplyCount int64
	}
	var replyCounts []ReplyCountResult
	if err := db.Model(&entities.Reply{}).
		Select("comment_id, COUNT(*) as reply_count").
		Where("comment_id IN ?", commentIDs).
		Group("comment_id").Scan(&replyCounts).Error; err != nil {
		return err
	}

	// Bulk comment clap counts
	type ClapResult struct {
		CommentID uuid.UUID
		ClapCount int64
	}
	var commentClaps []ClapResult
	if err := db.Model(&entities.UserActivity{}).
		Select("comment_id, COALESCE(SUM(count), 0) as clap_count").
		Where("comment_id IN ? AND action_type = ?", commentIDs, "clap_comment").
		Group("comment_id").Scan(&commentClaps).Error; err != nil {
		return err
	}

	// Bulk reply clap counts
	var replyClaps []struct {
		ReplyID   uuid.UUID
		ClapCount int64
	}
	if len(replyIDs) > 0 {
		if err := db.Model(&entities.UserActivity{}).
			Select("reply_id, COALESCE(SUM(count), 0) as clap_count").
			Where("reply_id IN ? AND action_type = ?", replyIDs, "clap_reply").
			Group("reply_id").Scan(&replyClaps).Error; err != nil {
			return err
		}
	}

	replyCountMap := make(map[uuid.UUID]int64)
	for _, r := range replyCounts {
		replyCountMap[r.CommentID] = r.ReplyCount
	}
	commentClapMap := make(map[uuid.UUID]int64)
	for _, r := range commentClaps {
		commentClapMap[r.CommentID] = r.ClapCount
	}
	replyClapMap := make(map[uuid.UUID]int64)
	for _, r := range replyClaps {
		replyClapMap[r.ReplyID] = r.ClapCount
	}

	for _, comment := range comments {
		comment.RepliesCount = uint64(replyCountMap[comment.ID])
		comment.ClapCount = uint64(commentClapMap[comment.ID])
		for i := range comment.Replies {
			comment.Replies[i].ClapCount = uint64(replyClapMap[comment.Replies[i].ID])
		}
	}
	return nil
}
