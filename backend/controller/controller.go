package controller

import (
	"os"

	"github.com/olivere/elastic/v7"

	"github.com/pdhoang91/blog/search"
)

type Controller struct {
	ElasticClient *elastic.Client
}

func NewController() *Controller {
	//elasticsearchURL := "http://localhost:9200"
	elasticsearchURL := os.Getenv("ELASTICSEARCH_HOST")
	//ELASTICSEARCH_HOST
	client := search.InitElasticsearch(elasticsearchURL)
	return &Controller{
		ElasticClient: client,
	}
}
