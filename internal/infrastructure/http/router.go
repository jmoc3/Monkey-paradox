package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jmoc3/Social-Network.git/internal/infrastructure/http/handler"
	"github.com/jmoc3/Social-Network.git/internal/infrastructure/http/middleware"
)

func NewRouter(statisticHandler *handler.StatisticHanlder, userHandler *handler.UserHandler) *fiber.App {
	app := fiber.New(fiber.Config{
		EnablePrintRoutes: true,
		BodyLimit:         10 * 1024 * 1024,
	})
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173",
		AllowMethods:     "GET, POST, PUT, PATCH, DELETE",
		AllowHeaders:     "Origin, Content-Type, Authorization",
		AllowCredentials: true,
	},
	))
	api := app.Group("/api/v1")
	api.Post("/login", userHandler.Login)
	api.Post("/register", userHandler.Register)
	api.Get("/users/search_query/:content", userHandler.SearchQuery)

	registerUserRoutes(api, userHandler)
	registerStatisticRoutes(api, statisticHandler)

	return app
}

func registerStatisticRoutes(router fiber.Router, h *handler.StatisticHanlder) {
	statistics := router.Group("/statistics", middleware.AuthMiddleware)
	statistics.Get("/", h.FindAll)
	statistics.Get("/:id", h.FindOne)
	statistics.Post("/", h.Save)
	statistics.Get("/user/:user_id", h.FindByUser)
	statistics.Patch("/:id", h.Update)
	statistics.Delete("/:id", h.Delete)
}

func registerUserRoutes(router fiber.Router, h *handler.UserHandler) {
	users := router.Group("/users", middleware.AuthMiddleware)
	users.Get("/me", h.Me)
	users.Patch("/:id", h.Update)
	users.Get("/query", h.SearchQuery)
	users.Post("/upload_profile_picture/:id", h.UploadProfilePicture)
	users.Get("/getProfileImage/:filename", h.GetProfileImage)
}
