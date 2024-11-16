package service

import (
	"github.com/pdhoang91/blog/external/search"
)

type Service struct {
	//*pg.DB
	SearchClient search.ISearchClient
}
