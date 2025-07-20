package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"pet-project/internal/utils"

	"github.com/jackc/pgx/v5/pgxpool"
)

type authRequest struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

func Register(db *pgxpool.Pool, jwtSecret string, jwtExp time.Duration) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req authRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		if req.Name == "" || req.Password == "" {
			http.Error(w, "name and password required", http.StatusBadRequest)
			return
		}

		// Хешируем пароль
		hash, err := utils.HashPassword(req.Password)
		if err != nil {
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}

		// Сохраняем в БД, возвращаем userID
		var userID int
		row := db.QueryRow(
			r.Context(),
			`INSERT INTO users (name, password_hash) VALUES ($1, $2) RETURNING id`,
			req.Name, hash,
		)
		if err := row.Scan(&userID); err != nil {
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}

		// генерим JWT
		token, err := utils.GenerateJWT(jwtSecret, userID, jwtExp)
		if err != nil {
			http.Error(w, "token generation failed", http.StatusInternalServerError)
			return
		}

		// Отправляем JSON { "token": "<JWT>" }
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"token": token})
	}
}

func Login(db *pgxpool.Pool, jwtSecret string, jwtExp time.Duration) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req authRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		if req.Name == "" || req.Password == "" {
			http.Error(w, "name and password required", http.StatusBadRequest)
			return
		}

		// Получаем хеш из БД
		var userID int
		var hash string
		row := db.QueryRow(
			r.Context(),
			`SELECT id, password_hash FROM users WHERE name = $1`,
			req.Name,
		)
		if err := row.Scan(&userID, &hash); err != nil {
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}

		// Сравниваем хеш с переданным паролем
		if err := utils.ComparePassword(hash, req.Password); err != nil {
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}

		// Генерим JWT
		token, err := utils.GenerateJWT(jwtSecret, userID, jwtExp)
		if err != nil {
			http.Error(w, "token generation failed", http.StatusInternalServerError)
			return
		}

		// Возвращаем токен
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"token": token})
	}
}

// POST /logout — сбрасываем cookie с рефрешем
func LogoutHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// если refresh‑токен был в cookie:
		http.SetCookie(w, &http.Cookie{
			Name:     "refresh_token",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			Secure:   true, // в проде
			SameSite: http.SameSiteLaxMode,
		})
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"logged_out"}`))
	}
}
