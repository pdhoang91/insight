package repository

import (
	"github.com/pdhoang91/blog/internal/entities"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type userRepo struct{ db *gorm.DB }

func NewUserRepository(db *gorm.DB) UserRepository { return &userRepo{db: db} }

func (r *userRepo) Create(user *entities.User) error {
	return r.db.Create(user).Error
}

func (r *userRepo) Update(user *entities.User) error {
	return r.db.Save(user).Error
}

func (r *userRepo) Delete(id uuid.UUID) error {
	return r.db.Delete(&entities.User{}, "id = ?", id).Error
}

func (r *userRepo) FindByID(id uuid.UUID) (*entities.User, error) {
	var user entities.User
	err := r.db.Where("id = ?", id).First(&user).Error
	return &user, err
}

func (r *userRepo) FindByEmail(email string) (*entities.User, error) {
	var user entities.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *userRepo) FindByUsername(username string) (*entities.User, error) {
	var user entities.User
	err := r.db.Where("username = ?", username).First(&user).Error
	return &user, err
}

func (r *userRepo) FindByGoogleID(googleID string) (*entities.User, error) {
	var user entities.User
	err := r.db.Where("google_id = ?", googleID).First(&user).Error
	return &user, err
}

func (r *userRepo) List(limit, offset int) ([]*entities.User, error) {
	var users []*entities.User
	err := r.db.Limit(limit).Offset(offset).Find(&users).Error
	return users, err
}
