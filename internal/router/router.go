package router

import (
	"net/http"

	"pet-project/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func NewRouter(db *pgxpool.Pool, rdb *redis.Client) http.Handler {
	r := chi.NewRouter()

	//CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // фронт на Vite
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // кэш предзапроса на 5 минут
	}))

	r.Get("/", handlers.Index)
	//REST
	r.Post("/users", handlers.CreateUser(db))

	//сообщения
	r.Get("/chats", handlers.ListChats(db))
	r.Post("/chats", handlers.CreateChat(db))
	r.Get("/chats/{chatID}/messages", handlers.ListMessages(db))
	r.Post("/chats/{chatID}/messages", handlers.SendMessage(db, rdb))

	r.Get("/ws/{chatID}", handlers.WSHandler(rdb))

	//посты
	r.Post("/posts", handlers.CreatePost(db))
	r.Get("/posts", handlers.ListPosts(db))
	r.Get("/posts/{postID}", handlers.GetPost(db))
	r.Put("/posts/{postID}", handlers.UpdatePost(db))
	r.Delete("/posts/{postID}", handlers.DeletePost(db))

	return r
}
