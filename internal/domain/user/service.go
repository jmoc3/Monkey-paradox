package user

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jmoc3/Social-Network.git/internal/infrastructure/http/middleware"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) FindAll(ctx context.Context) ([]UserBase, error) {
	users, err := s.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (s *Service) FindOne(ctx context.Context, id string) (*UserBase, error) {
	user, err := s.repo.FindOne(ctx, id)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) SearchQuery(ctx context.Context, content string) ([]map[string]any, error) {
	records, err := s.repo.FindBy(ctx, []string{"id", "name", "email", "date_of_birth", "url_image"}, "users", "name ILIKE "+"'%"+content+"%'")
	if err != nil {
		return nil, err
	}

	return records, nil
}

func (s *Service) Register(ctx context.Context, body RegisterDTO) (bool, error) {

	if body.ConfirmPassword != body.Password {
		return false, errors.New("Las contraseñas no coinciden")
	}

	bytes, err := bcrypt.GenerateFromPassword([]byte(body.Password), 14)

	if err != nil {
		return false, err
	}

	body.Password = string(bytes)

	_, err = s.Save(ctx, SaveUserDTO{
		Email:       body.Email,
		Name:        body.Name,
		DateOfBirth: body.DateOfBirth,
		Password:    body.Password,
	})

	if err != nil {

		if strings.Contains(err.Error(), "users_date_of_birth_check") {
			return false, errors.New("Usuario debe ser mayor a 12 años")
		}

		if strings.Contains(err.Error(), "users_email_key") {
			return false, errors.New("Correo ya registrado")
		}

		return false, fmt.Errorf("Error creating user: %w", err)
	}

	return true, nil
}

func (s *Service) Login(ctx context.Context, body LoginDTO) (string, error) {
	filter := fmt.Sprintf("email = '%s'", body.Email)

	rows, err := s.repo.FindBy(ctx, []string{"id", "name", "date_of_birth", "password"}, "users", filter)
	if err != nil {
		return "", err
	}

	if len(rows) == 0 {
		return "", errors.New("Usuario no encontrado")
	}

	psw := rows[0]["password"]
	err = bcrypt.CompareHashAndPassword([]byte(psw.(string)), []byte(body.Password))
	equalPsw := err == nil

	if !equalPsw {
		return "", errors.New("Contraseña incorrecta")
	}
	token, err := middleware.GenerateToken(fmt.Sprint(rows[0]["id"]), body.Email, fmt.Sprint(rows[0]["name"]), fmt.Sprint(rows[0]["date_of_birth"]))

	if err != nil {
		return "", fmt.Errorf("Error generando el token: %w", err)
	}

	return token, nil
}

func (s *Service) Save(ctx context.Context, user SaveUserDTO) (*UserBase, error) {
	userCreated, err := s.repo.Save(ctx, user)
	if err != nil {
		return nil, err
	}

	return userCreated, nil
}

func (s *Service) Update(ctx context.Context, id int, userRequest UpdateUserRequest) (int, error) {
	idUpdated, err := s.repo.Update(ctx, id, userRequest)
	if err != nil {
		return 0, err
	}

	return idUpdated, nil
}

func (s *Service) Delete(ctx context.Context, id string) (*UserBase, error) {
	user, err := s.repo.Delete(ctx, id)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) UploadProfilePicture(ctx context.Context, id int, file string) (bool, error) {
	decoded, err := base64.StdEncoding.DecodeString(file)
	if err != nil {
		return false, err
	}

	os.MkdirAll("uploads", os.ModePerm)
	filename := fmt.Sprintf("uploads/%d.png", time.Now().Unix())

	ok, err := s.repo.UploadProfilePicture(ctx, id, filename)
	if err != nil {
		return false, err
	}
	if err := os.WriteFile(filename, decoded, 0644); err != nil {
		return false, err
	}

	return ok, nil
}
