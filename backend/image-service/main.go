package main

import (
	"github.com/pdhoang91/image-service/router"
)

func main() {
	r := router.SetupRouter()

	r.Run(":82") // Chạy trên cổng 81, bạn có thể thay đổi nếu cần
}
