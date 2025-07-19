package router

import (
	"net/http"

	"pet-project/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func NewRouter(db *pgxpool.Pool, rdb *redis.Client) http.Handler {
	r := chi.NewRouter()
	r.Get("/", handlers.Index)
	//REST
	r.Post("/users", handlers.CreateUser(db))

	//сообщения
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
