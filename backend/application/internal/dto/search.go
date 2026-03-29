package dto

// SearchSuggestion represents a single autocomplete suggestion.
type SearchSuggestion struct {
	Text  string  `json:"text"`
	Score float64 `json:"score"`
}

// PopularSearch represents a trending search query in the last 7 days.
type PopularSearch struct {
	Query string `json:"query"`
	Count int    `json:"count"`
}
