// main.go
package main

import (
	"log"
	"os"

	"github.com/pdhoang91/search-service/database"
	"github.com/pdhoang91/search-service/router"
	"github.com/pdhoang91/search-service/service"
)

func main() {
	// Khởi tạo cấu hình
	// Kết nối cơ sở dữ liệu, thực hiện migration và thiết lập các callback cho Elasticsearch
	database.InitializeDatabase()
	log.Println("Connected to database")
	elasticsearchURL := os.Getenv("ELASTICSEARCH_HOST")
	service.InitElasticsearch(elasticsearchURL)
	log.Println("Init Elasticsearch")

	// Thiết lập router và chạy server
	r := router.SetupRouter()

	err := r.Run(":83")
	if err != nil {
		log.Fatal(err)
	}
}
