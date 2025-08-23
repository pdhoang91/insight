package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Follow represents a follow relationship entity in the domain
type Follow struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	FollowerID  uuid.UUID `gorm:"type:uuid;uniqueIndex:idx_follower_following" json:"follower_id"`
	FollowingID uuid.UUID `gorm:"type:uuid;uniqueIndex:idx_follower_following" json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
}

func (Follow) TableName() string {
	return "follows"
}
