package entities

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

// Tag represents a tag entity in the domain
type Tag struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `gorm:"size:100;unique;not null" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Posts []Post `gorm:"many2many:post_tags;" json:"posts"`
}

func (Tag) TableName() string {
	return "tags"
}

// ==================== REPOSITORY METHODS ====================

// Create creates a new tag in the database
func (t *Tag) Create(db *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.NewV4()
	}
	return db.Create(t).Error
}

// Update updates a tag in the database
func (t *Tag) Update(db *gorm.DB) error {
	return db.Save(t).Error
}

// FindByID finds a tag by ID
func (*Tag) FindByID(db *gorm.DB, id uuid.UUID) (*Tag, error) {
	var tag Tag
	err := db.Where("id = ?", id).First(&tag).Error
	return &tag, err
}

// FindByName finds a tag by name
func (*Tag) FindByName(db *gorm.DB, name string) (*Tag, error) {
	var tag Tag
	err := db.Where("name = ?", name).First(&tag).Error
	return &tag, err
}

// List retrieves tags with pagination
func (*Tag) List(db *gorm.DB, limit, offset int) ([]*Tag, error) {
	var tags []*Tag
	err := db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&tags).Error
	return tags, err
}

// GetPopular retrieves popular tags based on post count
func (*Tag) GetPopular(db *gorm.DB, limit int) ([]*Tag, error) {
	var tags []*Tag
	err := db.Table("tags").
		Select("tags.*, COUNT(post_tags.post_id) as post_count").
		Joins("LEFT JOIN post_tags ON tags.id = post_tags.tag_id").
		Group("tags.id").
		Order("post_count DESC").
		Limit(limit).
		Find(&tags).Error
	return tags, err
}

// DeleteByID deletes a tag by ID
func (*Tag) DeleteByID(db *gorm.DB, id uuid.UUID) error {
	return db.Where("id = ?", id).Delete(&Tag{}).Error
}

// FindAll retrieves all tags with pagination
func (*Tag) FindAll(db *gorm.DB, limit, offset int) ([]*Tag, error) {
	var tags []*Tag
	err := db.Order("created_at DESC").
		Limit(limit).Offset(offset).
		Find(&tags).Error
	return tags, err
}

// Count returns total number of tags
func (*Tag) Count(db *gorm.DB) (int64, error) {
	var count int64
	err := db.Model(&Tag{}).Count(&count).Error
	return count, err
}

// Search searches tags by name
func (*Tag) Search(db *gorm.DB, query string, limit int) ([]*Tag, error) {
	var tags []*Tag
	err := db.Where("name ILIKE ?", "%"+query+"%").
		Order("name ASC").
		Limit(limit).
		Find(&tags).Error
	return tags, err
}
