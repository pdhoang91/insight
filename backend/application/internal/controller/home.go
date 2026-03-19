package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pdhoang91/blog/internal/service"
)

type HomeController struct {
	svc service.PostService
}

func (c *HomeController) GetHomeData(ctx *gin.Context) {
	data, err := c.svc.GetHomeData()
	if err != nil {
		respondError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": data})
}
