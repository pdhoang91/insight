// main.go
package main

import (
	"log"

	"github.com/pdhoang91/blog/config"
	"github.com/pdhoang91/blog/database"
	"github.com/pdhoang91/blog/router"
)

func main() {
	err := config.Init()
	if err != nil {
		log.Fatal(err)
	}

	// Kết nối cơ sở dữ liệu, thực hiện migration và thiết lập các callback cho Elasticsearch
	database.InitializeDatabase()
	log.Println("Connected to database and set up Elasticsearch hooks")

	// Thiết lập router và chạy server
	r := router.SetupRouter()

	err = r.Run(":81")
	if err != nil {
		log.Fatal(err)
	}
}
