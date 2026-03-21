package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type categoryRepo struct{ db *gorm.DB }

func NewCategoryRepository(db *gorm.DB) CategoryRepository { return &categoryRepo{db: db} }

func (r *categoryRepo) WithTx(tx *gorm.DB) CategoryRepository { return &categoryRepo{db: tx} }

func (r *categoryRepo) Create(category *entities.Category) error {
	return r.db.Create(category).Error
}

func (r *categoryRepo) Update(category *entities.Category) error {
	return r.db.Save(category).Error
}

func (r *categoryRepo) Delete(id uuid.UUID) error {
	return r.db.Delete(&entities.Category{}, "id = ?", id).Error
}

func (r *categoryRepo) FindByID(id uuid.UUID) (*entities.Category, error) {
	var category entities.Category
	err := r.db.Where("id = ?", id).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepo) FindByName(name string) (*entities.Category, error) {
	var category entities.Category
	err := r.db.Where("name = ?", name).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepo) FindAll(limit, offset int) ([]*entities.Category, error) {
	var categories []*entities.Category
	err := r.db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&categories).Error
	return categories, err
}

func (r *categoryRepo) Count() (int64, error) {
	var count int64
	err := r.db.Model(&entities.Category{}).Count(&count).Error
	return count, err
}

func (r *categoryRepo) FindByNames(names []string, limit, offset int) ([]*entities.Category, error) {
	var categories []*entities.Category
	err := r.db.Where("name IN ?", names).Order("created_at desc").Limit(limit).Offset(offset).Find(&categories).Error
	return categories, err
}

func (r *categoryRepo) CountByNames(names []string) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Category{}).Where("name IN ?", names).Count(&count).Error
	return count, err
}

func (r *categoryRepo) FindPopularByPostCount(limit, offset int) ([]CategoryPostCount, int64, error) {
	var totalCount int64
	countQuery := `SELECT COUNT(DISTINCT c.id) FROM categories c INNER JOIN post_categories pc ON c.id = pc.category_id`
	if err := r.db.Raw(countQuery).Scan(&totalCount).Error; err != nil {
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
	if err := r.db.Raw(query, limit, offset).Scan(&results).Error; err != nil {
		return nil, 0, err
	}

	out := make([]CategoryPostCount, len(results))
	for i, r := range results {
		cat := r.Category
		out[i] = CategoryPostCount{Category: &cat, PostCount: r.PostCount}
	}
	return out, totalCount, nil
}

func (r *categoryRepo) CountPostsByCategory(categoryID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Table("post_categories").Where("category_id = ?", categoryID).Count(&count).Error
	return count, err
}
