# Controller Architecture Documentation

## Overview

The application uses a controller-based architecture where each domain has its own controller with dedicated responsibilities. All controllers are initialized in the `main()` function for explicit dependency management.

## Controller Structure

### Available Controllers

1. **ImageController** - Image upload, management, S3 operations
2. **PostController** - Post creation, updates, content management
3. **SearchController** - Search functionality across posts/users
4. **CommentController** - Comment and reply management
5. **UserController** - User profile, settings management
6. **AuthController** - Authentication, login/register
7. **CategoryController** - Category management
8. **TagController** - Tag operations

## Initialization Flow

```go
// main.go
func main() {
    // 1. Initialize config
    config.Init()
    
    // 2. Initialize database
    database.DB = database.ConnectDatabase()
    
    // 3. Initialize all controllers
    controllers, err := controller.InitControllers()
    if err != nil {
        log.Fatal("Failed to initialize controllers: ", err)
    }
    
    // 4. Start background services
    services.StartBackgroundServices()
    
    // 5. Setup router with controller access
    r := router.SetupRouter()
    
    // 6. Start server
    r.Run(":" + port)
}
```

## Controller Manager

### Global Variables
```go
var (
    ImageCtrl    *ImageController
    PostCtrl     *PostController
    SearchCtrl   *SearchController
    CommentCtrl  *CommentController
    UserCtrl     *UserController
    AuthCtrl     *AuthController
    CategoryCtrl *CategoryController
    TagCtrl      *TagController
)
```

### Initialization
```go
func InitControllers() (*Controllers, error) {
    // Initialize each controller with proper error handling
    ImageCtrl, err = NewImageController()
    if err != nil {
        return nil, fmt.Errorf("failed to initialize ImageController: %w", err)
    }
    
    PostCtrl, err = NewPostController()
    if err != nil {
        return nil, fmt.Errorf("failed to initialize PostController: %w", err)
    }
    
    // ... initialize other controllers
    
    return &Controllers{
        Image:    ImageCtrl,
        Post:     PostCtrl,
        Search:   SearchCtrl,
        Comment:  CommentCtrl,
        User:     UserCtrl,
        Auth:     AuthCtrl,
        Category: CategoryCtrl,
        Tag:      TagCtrl,
    }, nil
}
```

## Router Integration

### Using Controllers in Router
```go
func SetupRouter() *gin.Engine {
    r := gin.Default()
    
    // Get controller instances
    imageCtrl := controllers.GetImageController()
    postCtrl := controllers.GetPostController()
    
    // Use controller methods instead of standalone functions
    r.POST("/images/upload/v2/:type", imageCtrl.UploadImage)
    r.POST("/posts", postCtrl.CreatePost)
    
    return r
}
```

## Controller Structure

### Example Controller Implementation
```go
// controller/image_controller.go
type ImageController struct {
    s3Service *services.S3Service
}

func NewImageController() (*ImageController, error) {
    s3Service, err := services.NewS3Service()
    if err != nil {
        return nil, err
    }
    
    return &ImageController{
        s3Service: s3Service,
    }, nil
}

func (ic *ImageController) UploadImage(c *gin.Context) {
    // Implementation
}
```

## Migration Strategy

### Current State
- Existing handler functions remain as standalone functions
- Controllers are created but not yet used for all endpoints
- Gradual migration approach to avoid breaking changes

### Migration Steps
1. ✅ Create controller structs
2. ✅ Initialize controllers in main()
3. ✅ Use controllers for new features (like ImageController)
4. 🔄 Gradually migrate existing handlers to controller methods
5. 🔄 Add service layer dependencies to controllers
6. 🔄 Remove standalone handler functions

### Example Migration
```go
// Before (standalone function)
func CreatePost(c *gin.Context) {
    // Implementation
}

// After (controller method)
func (pc *PostController) CreatePost(c *gin.Context) {
    // Implementation with access to pc.postImageService, etc.
}

// Router update
// Before: r.POST("/posts", controllers.CreatePost)
// After:  r.POST("/posts", postCtrl.CreatePost)
```

## Benefits

### 1. **Explicit Initialization**
- All dependencies initialized in main()
- Clear startup sequence
- Easy to debug initialization issues

### 2. **Better Organization**
- Each domain has its own controller
- Related functionality grouped together
- Clear separation of concerns

### 3. **Service Integration**
- Controllers can have service dependencies
- Better testability with dependency injection
- Cleaner architecture

### 4. **Scalability**
- Easy to add new controllers
- Clear pattern for future development
- Maintainable codebase structure

## Error Handling

### Controller Initialization Errors
```go
// Each controller initialization is wrapped with proper error context
PostCtrl, err = NewPostController()
if err != nil {
    return nil, fmt.Errorf("failed to initialize PostController: %w", err)
}
```

### Runtime Access Errors
```go
func GetPostController() *PostController {
    if PostCtrl == nil {
        log.Fatal("Post controller not initialized. Call InitControllers() first.")
    }
    return PostCtrl
}
```

## Best Practices

### 1. **Controller Design**
- Keep controllers focused on HTTP handling
- Delegate business logic to services
- Use dependency injection for services

### 2. **Error Handling**
- Always check initialization errors
- Provide meaningful error messages
- Fail fast on missing dependencies

### 3. **Service Integration**
- Initialize services in controller constructors
- Pass services as dependencies
- Keep service interfaces clean

### 4. **Testing**
- Mock services for controller testing
- Test controller initialization separately
- Use dependency injection for testability

## Future Enhancements

### 1. **Service Layer**
- Create dedicated service packages
- Move business logic from controllers to services
- Implement service interfaces for better testing

### 2. **Middleware Integration**
- Controller-specific middleware
- Better request/response handling
- Validation middleware integration

### 3. **Configuration**
- Controller-specific configuration
- Environment-based controller behavior
- Feature flags for controller functionality

## Example Usage

### Creating a New Controller
```go
// 1. Create controller file
// controller/example_controller.go
type ExampleController struct {
    exampleService *services.ExampleService
}

func NewExampleController() (*ExampleController, error) {
    exampleService, err := services.NewExampleService()
    if err != nil {
        return nil, err
    }
    
    return &ExampleController{
        exampleService: exampleService,
    }, nil
}

// 2. Add to manager.go
var ExampleCtrl *ExampleController

// Add to InitControllers()
ExampleCtrl, err = NewExampleController()
if err != nil {
    return nil, fmt.Errorf("failed to initialize ExampleController: %w", err)
}

// 3. Use in router
exampleCtrl := controllers.GetExampleController()
r.GET("/example", exampleCtrl.GetExample)
```

This architecture provides a solid foundation for scalable, maintainable, and testable code.
