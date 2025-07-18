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
	r.Get("/chats/{chatID}/messages", handlers.ListMessages(db))

	return r
}
