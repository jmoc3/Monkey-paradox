package middleware

import (
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func AuthMiddleware(c *fiber.Ctx) error {
	fmt.Printf("> AuthMiddleware activated \n")
	token := c.Cookies("token")
	if token == "" {
		return c.Status(401).JSON(fiber.Map{"msg": "Token Requerido", "status": false})
	}
	c.Locals("token", token)

	claims, err := validarToken(token)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"msg": "Token invalido o expirado", "status": false})
	}

	c.Locals("claims", claims)
	return c.Next()
}

func GenerateToken(userId string, email string, name string, dateOfBirth string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":       userId,
		"name":          name,
		"email":         email,
		"date_of_birth": userId,
		"exp":           time.Now().Add(time.Hour * 24).Unix(),
	}

	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(jwtSecret)
}

func validarToken(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Algoritmo invalido")
		}

		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("Token invalido")
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		return nil, fmt.Errorf("claims invalidos")
	}

	return claims, nil
}
