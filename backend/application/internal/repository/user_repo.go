package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type userRepo struct{}

func NewUserRepository() UserRepository { return &userRepo{} }

func (r *userRepo) Create(db *gorm.DB, user *entities.User) error {
	return db.Create(user).Error
}

func (r *userRepo) Update(db *gorm.DB, user *entities.User) error {
	return db.Save(user).Error
}

func (r *userRepo) Delete(db *gorm.DB, id uuid.UUID) error {
	return db.Delete(&entities.User{}, "id = ?", id).Error
}

func (r *userRepo) FindByID(db *gorm.DB, id uuid.UUID) (*entities.User, error) {
	var user entities.User
	err := db.Where("id = ?", id).First(&user).Error
	return &user, err
}

func (r *userRepo) FindByEmail(db *gorm.DB, email string) (*entities.User, error) {
	var user entities.User
	err := db.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *userRepo) FindByUsername(db *gorm.DB, username string) (*entities.User, error) {
	var user entities.User
	err := db.Where("username = ?", username).First(&user).Error
	return &user, err
}

func (r *userRepo) FindByGoogleID(db *gorm.DB, googleID string) (*entities.User, error) {
	var user entities.User
	err := db.Where("google_id = ?", googleID).First(&user).Error
	return &user, err
}

func (r *userRepo) List(db *gorm.DB, limit, offset int) ([]*entities.User, error) {
	var users []*entities.User
	err := db.Limit(limit).Offset(offset).Find(&users).Error
	return users, err
}
