package repository

import (
	"fmt"

	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type userActivityRepo struct{ db *gorm.DB }

func NewUserActivityRepository(db *gorm.DB) UserActivityRepository {
	return &userActivityRepo{db: db}
}

func (r *userActivityRepo) Create(activity *entities.UserActivity) error {
	return r.db.Create(activity).Error
}

func (r *userActivityRepo) FindByUserAndPost(userID, postID uuid.UUID, actionType string) (*entities.UserActivity, error) {
	var activity entities.UserActivity
	err := r.db.Where("user_id = ? AND post_id = ? AND action_type = ?", userID, postID, actionType).First(&activity).Error
	return &activity, err
}

func (r *userActivityRepo) FindByUserAndComment(userID, commentID uuid.UUID, actionType string) (*entities.UserActivity, error) {
	var activity entities.UserActivity
	err := r.db.Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, commentID, actionType).First(&activity).Error
	return &activity, err
}

func (r *userActivityRepo) FindByUserAndReply(userID, replyID uuid.UUID, actionType string) (*entities.UserActivity, error) {
	var activity entities.UserActivity
	err := r.db.Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, replyID, actionType).First(&activity).Error
	return &activity, err
}

func (r *userActivityRepo) IncrementCount(activity *entities.UserActivity) error {
	return r.db.Model(activity).Update("count", gorm.Expr("count + ?", 1)).Error
}

func (r *userActivityRepo) GetClapCount(itemType string, itemID uuid.UUID) (int64, error) {
	var count int64
	var query *gorm.DB

	switch itemType {
	case "post":
		query = r.db.Model(&entities.UserActivity{}).Where("post_id = ? AND action_type = ?", itemID, "clap_post")
	case "comment":
		query = r.db.Model(&entities.UserActivity{}).Where("comment_id = ? AND action_type = ?", itemID, "clap_comment")
	case "reply":
		query = r.db.Model(&entities.UserActivity{}).Where("reply_id = ? AND action_type = ?", itemID, "clap_reply")
	default:
		return 0, fmt.Errorf("invalid item type: %s", itemType)
	}

	err := query.Select("COALESCE(SUM(count), 0)").Row().Scan(&count)
	return count, err
}

func (r *userActivityRepo) HasUserClapped(userID uuid.UUID, itemType string, itemID uuid.UUID) (bool, error) {
	var count int64
	var query *gorm.DB

	switch itemType {
	case "post":
		query = r.db.Model(&entities.UserActivity{}).Where("user_id = ? AND post_id = ? AND action_type = ?", userID, itemID, "clap_post")
	case "comment":
		query = r.db.Model(&entities.UserActivity{}).Where("user_id = ? AND comment_id = ? AND action_type = ?", userID, itemID, "clap_comment")
	case "reply":
		query = r.db.Model(&entities.UserActivity{}).Where("user_id = ? AND reply_id = ? AND action_type = ?", userID, itemID, "clap_reply")
	default:
		return false, fmt.Errorf("invalid item type: %s", itemType)
	}

	err := query.Count(&count).Error
	return count > 0, err
}

func (r *userActivityRepo) CalculateCommentsAndRepliesCounts(comments []*entities.Comment) error {
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
	if err := r.db.Model(&entities.Reply{}).
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
	if err := r.db.Model(&entities.UserActivity{}).
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
		if err := r.db.Model(&entities.UserActivity{}).
			Select("reply_id, COALESCE(SUM(count), 0) as clap_count").
			Where("reply_id IN ? AND action_type = ?", replyIDs, "clap_reply").
			Group("reply_id").Scan(&replyClaps).Error; err != nil {
			return err
		}
	}

	replyCountMap := make(map[uuid.UUID]int64)
	for _, rc := range replyCounts {
		replyCountMap[rc.CommentID] = rc.ReplyCount
	}
	commentClapMap := make(map[uuid.UUID]int64)
	for _, cc := range commentClaps {
		commentClapMap[cc.CommentID] = cc.ClapCount
	}
	replyClapMap := make(map[uuid.UUID]int64)
	for _, rc := range replyClaps {
		replyClapMap[rc.ReplyID] = rc.ClapCount
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
