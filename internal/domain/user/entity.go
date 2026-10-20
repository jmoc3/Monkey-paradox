package user

import (
	"errors"
	"time"
)

var (
	ErrUserInvalidPassword = errors.New("Contraseña invalida")
	ErrUserInvalidEmail    = errors.New("Contraseña invalida")
)

type UserBase struct {
	Id          int       `json:"id"`
	Name        string    `json:"name"`
	DateOfBirth time.Time `json:"date_of_birth"`
	Email       string    `json:"email"`
	UrlImage    string    `json:"url_image"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
