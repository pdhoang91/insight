package main

import (
	"log"

	"github.com/pdhoang91/image-service/config"
	"github.com/pdhoang91/image-service/router"
	"github.com/pdhoang91/image-service/services"
)

func main() {
	// Khởi tạo S3 client
	config.InitS3Client()

	// Khởi tạo S3Service 1 lần
	s3Service := services.NewS3Service()

	// Truyền s3Service vào router
	r := router.SetupRouter(s3Service)

	if err := r.Run(":82"); err != nil {
		log.Fatal(err)
	}
}
