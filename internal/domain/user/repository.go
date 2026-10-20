package user

import (
	"context"
)

type Repository interface {
	FindAll(ctx context.Context) ([]UserBase, error)
	FindOne(ctx context.Context, id string) (*UserBase, error)
	FindBy(ctx context.Context, fields []string, table string, filter string) ([]map[string]any, error)
	Save(ctx context.Context, user SaveUserDTO) (*UserBase, error)
	Update(ctx context.Context, id int, user UpdateUserRequest) (int, error)
	Delete(ctx context.Context, id string) (*UserBase, error)
	UploadProfilePicture(ctx context.Context, id int, file string) (bool, error)
}

type User struct {
	UserBase
	Password string
}

type RegisterDTO struct {
	Name            string
	DateOfBirth     string
	Email           string
	Password        string
	ConfirmPassword string
}

type SaveUserDTO struct {
	Name        string
	DateOfBirth string
	Email       string
	Password    string
}

type LoginDTO struct {
	Email    string
	Password string
}

type UpdateUserRequest struct {
	Name        *string
	DateOfBirth *int
}
