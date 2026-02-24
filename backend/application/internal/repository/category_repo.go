package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type categoryRepo struct{}

func NewCategoryRepository() CategoryRepository { return &categoryRepo{} }

func (r *categoryRepo) Create(db *gorm.DB, category *entities.Category) error {
	return db.Create(category).Error
}

func (r *categoryRepo) Update(db *gorm.DB, category *entities.Category) error {
	return db.Save(category).Error
}

func (r *categoryRepo) Delete(db *gorm.DB, id uuid.UUID) error {
	return db.Delete(&entities.Category{}, "id = ?", id).Error
}

func (r *categoryRepo) FindByID(db *gorm.DB, id uuid.UUID) (*entities.Category, error) {
	var category entities.Category
	err := db.Where("id = ?", id).First(&category).Error
	return &category, err
}

func (r *categoryRepo) FindByName(db *gorm.DB, name string) (*entities.Category, error) {
	var category entities.Category
	err := db.Where("name = ?", name).First(&category).Error
	return &category, err
}

func (r *categoryRepo) FindAll(db *gorm.DB, limit, offset int) ([]*entities.Category, error) {
	var categories []*entities.Category
	err := db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&categories).Error
	return categories, err
}

func (r *categoryRepo) Count(db *gorm.DB) (int64, error) {
	var count int64
	err := db.Model(&entities.Category{}).Count(&count).Error
	return count, err
}

func (r *categoryRepo) FindByNames(db *gorm.DB, names []string, limit, offset int) ([]*entities.Category, error) {
	var categories []*entities.Category
	err := db.Where("name IN ?", names).Order("created_at desc").Limit(limit).Offset(offset).Find(&categories).Error
	return categories, err
}

func (r *categoryRepo) CountByNames(db *gorm.DB, names []string) (int64, error) {
	var count int64
	err := db.Model(&entities.Category{}).Where("name IN ?", names).Count(&count).Error
	return count, err
}

func (r *categoryRepo) FindPopularByPostCount(db *gorm.DB, limit, offset int) ([]CategoryPostCount, int64, error) {
	var totalCount int64
	countQuery := `SELECT COUNT(DISTINCT c.id) FROM categories c INNER JOIN post_categories pc ON c.id = pc.category_id`
	if err := db.Raw(countQuery).Scan(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	type rawResult struct {
		entities.Category
		PostCount int64 `gorm:"column:post_count"`
	}
	var results []rawResult
	query := `SELECT c.id, c.name, c.description, c.created_at, c.updated_at, COUNT(pc.post_id) as post_count
		FROM categories c 
		INNER JOIN post_categories pc ON c.id = pc.category_id 
		GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at 
		ORDER BY post_count DESC 
		LIMIT ? OFFSET ?`
	if err := db.Raw(query, limit, offset).Scan(&results).Error; err != nil {
		return nil, 0, err
	}

	out := make([]CategoryPostCount, len(results))
	for i, r := range results {
		cat := r.Category
		out[i] = CategoryPostCount{Category: &cat, PostCount: r.PostCount}
	}
	return out, totalCount, nil
}

func (r *categoryRepo) CountPostsByCategory(db *gorm.DB, categoryID uuid.UUID) (int64, error) {
	var count int64
	err := db.Table("post_categories").Where("category_id = ?", categoryID).Count(&count).Error
	return count, err
}
