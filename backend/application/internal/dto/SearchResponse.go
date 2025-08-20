package dto

// SearchResults represents comprehensive search results
type SearchResults struct {
	Query      string              `json:"query"`
	TotalCount int64               `json:"total_count"`
	Posts      []*PostResponse     `json:"posts"`
	Users      []*UserResponse     `json:"users"`
	Categories []*CategoryResponse `json:"categories"`
	Tags       []*TagResponse      `json:"tags"`
}

// SearchSuggestions represents search suggestions
type SearchSuggestions struct {
	Posts      []string `json:"posts"`
	Tags       []string `json:"tags"`
	Categories []string `json:"categories"`
	Users      []string `json:"users"`
}
