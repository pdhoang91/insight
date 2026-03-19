package dto

type HomeResponse struct {
	LatestPosts  []*PostResponse    `json:"latest_posts"`
	PopularPosts []*PostResponse    `json:"popular_posts"`
	Categories   []*CategoryResponse `json:"categories"`
	TotalPosts   int64              `json:"total_posts"`
}
