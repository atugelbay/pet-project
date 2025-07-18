package handlers

import (
	"encoding/json"
	"net/http"

	"pet-project/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateUser(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Name string `json:"name"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		if req.Name == "" {
			http.Error(w, "Name required", http.StatusBadRequest)
			return
		}
		row := db.QueryRow(
			r.Context(),
			`INSERT INTO users (name) VALUES ($1) RETURNING id, name`,
			req.Name,
		)
		var u models.User
		if err := row.Scan(&u.ID, &u.Name); err != nil {
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(u)
	}
}
