package search_api

// IKeyClient provides methods for calling KeyAPI
type ISearchClient interface {
	SearchPost(query string, page int, limit int) ([]byte, int, error)
}
