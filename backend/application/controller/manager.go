// controller/manager.go
package controller

import (
	"fmt"
	"log"
)

// Global controller instance - single controller for the entire app
var (
	AppController *Controller
)

// Controllers holds the main controller instance
type Controllers struct {
	Main *Controller
}

// InitControllers initializes the main controller
func InitControllers() (*Controllers, error) {
	log.Println("Initializing controller...")

	// Initialize the main controller with all services
	var err error
	AppController, err = NewController()
	if err != nil {
		return nil, fmt.Errorf("failed to initialize main controller: %w", err)
	}

	controllers := &Controllers{
		Main: AppController,
	}

	log.Println("Controller initialized successfully")
	return controllers, nil
}

// Getter function for the main controller
func GetController() *Controller {
	if AppController == nil {
		log.Fatal("Controller not initialized. Call InitControllers() first.")
	}
	return AppController
}
