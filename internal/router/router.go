package router

import (
	"net/http"

	"pet-project/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Post("/users", handlers.CreateUser(db))
	r.Post("/chats", handlers.CreateChat(db))

	// сообщения
	r.Get("/chats/{chatID}/messages", handlers.ListMessages(db))
	r.Post("/chats/{chatID}/messages", handlers.SendMessage(db))

	//посты
	r.Post("/posts", handlers.CreatePost(db))
	r.Get("/posts", handlers.ListPosts(db))
	r.Get("/posts/{postID}", handlers.GetPost(db))
	r.Put("/posts/{postID}", handlers.UpdatePost(db))
	r.Delete("/posts/{postID}", handlers.DeletePost(db))

	return r
}
