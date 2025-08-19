// models/Follow.go
package models

import (
	"time"

	uuid "github.com/satori/go.uuid"
)

// Follow lưu trữ thông tin theo dõi giữa người dùng
type Follow struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();" json:"id"`
	FollowerID  uuid.UUID `gorm:"type:uuid;uniqueIndex:idx_follower_following" json:"follower_id"`  // ID của người theo dõi
	FollowingID uuid.UUID `gorm:"type:uuid;uniqueIndex:idx_follower_following" json:"following_id"` // ID của người được theo dõi
	CreatedAt   time.Time `json:"created_at"`
}
