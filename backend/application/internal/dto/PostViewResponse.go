package dto

import uuid "github.com/satori/go.uuid"

// PostViewStats represents post view statistics
type PostViewStats struct {
	PostID      uuid.UUID `json:"post_id"`
	TotalViews  int64     `json:"total_views"`
	UniqueViews int64     `json:"unique_views"`
	DailyViews  int64     `json:"daily_views"`
	WeeklyViews int64     `json:"weekly_views"`
}
