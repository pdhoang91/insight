package controller

import (
	"github.com/pdhoang91/blog/internal/service"
)

// Controller is the main controller that handles all HTTP requests
type Controller struct {
	service *service.InsightService
}

// NewController creates a new controller instance
func NewController(service *service.InsightService) *Controller {
	return &Controller{
		service: service,
	}
}
