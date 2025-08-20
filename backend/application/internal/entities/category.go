package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Category represents a category entity in the domain
type Category struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string    `gorm:"size:100;unique;not null" json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	Posts []Post `gorm:"many2many:post_categories;" json:"posts"`
}

func (Category) TableName() string {
	return "categories"
}

// ==================== CATEGORY REPOSITORY METHODS ====================

// Create creates a new category in the database
func (c *Category) Create(db *gorm.DB) error {
	return db.Create(c).Error
}

// Update updates the category in the database
func (c *Category) Update(db *gorm.DB) error {
	return db.Save(c).Error
}

// Delete deletes the category from the database
func (c *Category) Delete(db *gorm.DB) error {
	return db.Delete(c).Error
}

// FindByID finds a category by ID
func (*Category) FindByID(db *gorm.DB, id uuid.UUID) (*Category, error) {
	var category Category
	err := db.Where("id = ?", id).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// FindByName finds a category by name
func (*Category) FindByName(db *gorm.DB, name string) (*Category, error) {
	var category Category
	err := db.Where("name = ?", name).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// DeleteByID deletes a category by ID
func (*Category) DeleteByID(db *gorm.DB, id uuid.UUID) error {
	return db.Delete(&Category{}, "id = ?", id).Error
}

// List retrieves categories with pagination
func (*Category) List(db *gorm.DB, limit, offset int) ([]*Category, error) {
	var categories []*Category
	err := db.Limit(limit).Offset(offset).Find(&categories).Error
	return categories, err
}

// FindAll finds all categories with pagination
func (*Category) FindAll(db *gorm.DB, limit, offset int) ([]*Category, error) {
	var categories []*Category
	err := db.Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&categories).Error
	return categories, err
}

// Count returns total number of categories
func (*Category) Count(db *gorm.DB) (int64, error) {
	var count int64
	err := db.Model(&Category{}).Count(&count).Error
	return count, err
}
