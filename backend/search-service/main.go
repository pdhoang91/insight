// main.go
package main

import (
	"log"

	"github.com/pdhoang91/search-service/database"
	"github.com/pdhoang91/search-service/router"
	"github.com/pdhoang91/search-service/service"
)

func main() {
	// Khởi tạo cấu hình
	// Kết nối cơ sở dữ liệu và thiết lập PostgreSQL search
	database.InitializeDatabase()
	log.Println("Connected to database")

	// Initialize PostgreSQL search service
	service.InitializeSearchService()
	log.Println("Initialized PostgreSQL search service")

	// Thiết lập router và chạy server
	r := router.SetupRouter()

	err := r.Run(":83")
	if err != nil {
		log.Fatal(err)
	}
}
