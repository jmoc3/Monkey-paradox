package handler

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jmoc3/Social-Network.git/internal/domain/user"
)

type UserHandler struct {
	service *user.Service
}

func NewUserHandler(service *user.Service) *UserHandler {
	return &UserHandler{
		service: service,
	}
}

func (h *UserHandler) FindOne(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	user, err := h.service.FindOne(ctx, id)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{"user": user})
}

func (h *UserHandler) FindAll(c *fiber.Ctx) error {
	ctx := c.Context()
	users, err := h.service.FindAll(ctx)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{"users": users})
}

func (h *UserHandler) SearchQuery(c *fiber.Ctx) error {
	ctx := c.Context()
	content := c.Params("content")
	query, err := h.service.SearchQuery(ctx, content)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{"query": query})
}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	ctx := c.Context()
	var body user.RegisterDTO
	if err := c.BodyParser(&body); err != nil {
		return err
	}

	ok, err := h.service.Register(ctx, body)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"msg": err.Error(), "status": ok})
	}

	return c.Status(200).JSON(fiber.Map{"msg": "Usuario creado exitosamente", "status": ok})
}

func (h *UserHandler) Me(c *fiber.Ctx) error {
	claimsRaw := c.Locals("claims")
	fmt.Printf("> Me 1 activated \n")

	if claimsRaw == nil {
		return c.Status(401).JSON(fiber.Map{"msg": "Token invalido o expirado", "status": false})
	}
	claims := claimsRaw.(jwt.MapClaims)
	userId := claims["user_id"]

	fmt.Printf("> Me 2 activated \n")
	user, err := h.service.FindOne(c.Context(), userId.(string))
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{
		"msg":         "User authenticated successfully",
		"status":      true,
		"user_id":     user.Id,
		"name":        user.Name,
		"email":       user.Email,
		"url_image":   user.UrlImage,
		"dateOfBirth": user.DateOfBirth,
	})
}

func (h *UserHandler) Login(c *fiber.Ctx) error {
	ctx := c.Context()
	var body user.LoginDTO
	if err := c.BodyParser(&body); err != nil {
		return err
	}

	token, err := h.service.Login(ctx, body)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"msg": err.Error(), "status": false})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
		Path:     "/",
		Expires:  time.Now().Add(time.Hour * 24),
	})

	return c.Status(200).JSON(fiber.Map{"msg": "User successfully authenticated", "status": true, "token": token})
}

func (h *UserHandler) Save(c *fiber.Ctx) error {
	ctx := c.Context()
	var user user.SaveUserDTO
	if err := c.BodyParser(&user); err != nil {
		return err
	}

	insertedId, err := h.service.Save(ctx, user)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{"insertedId": insertedId})
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	ctx := c.Context()
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(418).JSON(fiber.Map{"error": err.Error()})
	}

	var user user.UpdateUserRequest
	if err := c.BodyParser(&user); err != nil {
		return err
	}

	updatedId, err := h.service.Update(ctx, id, user)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{"updatedId": updatedId})
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {

	ctx := c.Context()
	id := c.Params("id")

	user, err := h.service.Delete(ctx, id)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{"userDeleted": user})
}

func (h *UserHandler) UploadProfilePicture(c *fiber.Ctx) error {
	ctx := c.Context()
	var body map[string]string

	if err := c.BodyParser(&body); err != nil {
		return c.Status(500).JSON(fiber.Map{"msg": "Invalid body content", "status": false})
	}

	file := body["file"]
	if idx := strings.Index(file, ","); idx != -1 {
		file = file[idx+1:]
	}

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"msg": "Id casting failed", "status": false})
	}

	ok, err := h.service.UploadProfilePicture(ctx, id, file)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(fiber.Map{"msg": "Profile picture uploaded successfully", "status": ok})
}

func (h *UserHandler) GetProfileImage(c *fiber.Ctx) error {
	filename := c.Params("filename")
	return c.SendFile("./uploads/" + filename)
}
