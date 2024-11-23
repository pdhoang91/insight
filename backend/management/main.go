// main.go
package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"

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
	// Khởi tạo controller
	//c := controllers.NewController()
	//log.Println("Initialized controller:", c)
	//search_api.New()

	// Thiết lập router và chạy server
	r := router.SetupRouter()

	// Đăng ký endpoint /metrics
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	err = r.Run(":81")
	if err != nil {
		log.Fatal(err)
	}
}
