package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"pet-project/internal/middleware"
	"pet-project/internal/utils"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ProfileResponse — структура JSON-ответа
type ProfileResponse struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// GET /me — отдаёт ID и имя текущего пользователя
func GetProfileHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := middleware.FromContext(r.Context())
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		var p ProfileResponse
		err := db.QueryRow(context.Background(),
			`SELECT id, name FROM users WHERE id=$1`, userID,
		).Scan(&p.ID, &p.Name)
		if err != nil {
			http.Error(w, "user not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(p)
	}
}

// PUT /me — меняет только имя
type updateProfileReq struct {
	Name string `json:"name"`
}

func UpdateProfileHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := middleware.FromContext(r.Context())
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		var req updateProfileReq
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if req.Name == "" {
			http.Error(w, "name is required", http.StatusBadRequest)
			return
		}

		if _, err := db.Exec(context.Background(),
			`UPDATE users SET name=$1 WHERE id=$2`, req.Name, userID,
		); err != nil {
			http.Error(w, "could not update profile", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(ProfileResponse{ID: userID, Name: req.Name})
	}
}

// POST /me/password — меняет пароль
type changePasswordReq struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func ChangePasswordHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := middleware.FromContext(r.Context())
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		var req changePasswordReq
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// получаем текущий хеш
		var hash string
		if err := db.QueryRow(context.Background(),
			`SELECT password_hash FROM users WHERE id=$1`, userID,
		).Scan(&hash); err != nil {
			http.Error(w, "user not found", http.StatusNotFound)
			return
		}
		// сравниваем пароль
		if err := utils.ComparePassword(hash, req.CurrentPassword); err != nil {
			http.Error(w, "current password is incorrect", http.StatusUnauthorized)
			return
		}
		// генерируем новый хеш и сохраняем
		newHash, err := utils.HashPassword(req.NewPassword)
		if err != nil {
			http.Error(w, "could not hash password", http.StatusInternalServerError)
			return
		}
		if _, err := db.Exec(context.Background(),
			`UPDATE users SET password_hash=$1 WHERE id=$2`, newHash, userID,
		); err != nil {
			http.Error(w, "could not update password", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}
}
