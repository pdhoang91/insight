// main.go
package main

import (
	"log"

	"github.com/pdhoang91/auth-service/config"
	"github.com/pdhoang91/auth-service/database"
	"github.com/pdhoang91/auth-service/router"
)

func main() {

	err := config.Init()
	if err != nil {
		log.Fatal(err)
	}

	// Kết nối cơ sở dữ liệu, thực hiện migration và thiết lập các callback cho Elasticsearch
	// Khởi tạo cấu hình
	// Kết nối cơ sở dữ liệu, thực hiện migration và thiết lập các callback cho Elasticsearch
	database.InitializeDatabase()
	log.Println("Connected to database")

	// Thiết lập router và chạy server
	r := router.SetupRouter()

	err = r.Run(":84")
	if err != nil {
		log.Fatal(err)
	}
}
