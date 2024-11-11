package search_api

// IKeyClient provides methods for calling KeyAPI
type ISearchClient interface {
	SearchPost(param string) ([]byte, error)
}
