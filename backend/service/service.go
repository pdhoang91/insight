package service

import (
	"github.com/pdhoang91/blog/external/search_api"
)

type Service struct {
	//*pg.DB
	SearchClient search_api.ISearchClient
}
