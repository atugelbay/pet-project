package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"pet-project/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

// CreateChat — заглушка для POST /chats
func CreateChat(db *pgxpool.Pool) http.HandlerFunc {
	type reqBody struct {
		Title   string `json:"title"`
		IsGroup bool   `json:"is_group"`
		Members []int  `json:"members"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		//декодируем json
		var req reqBody
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("CreateChat decode error: %v", err)
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		if len(req.Members) == 0 {
			http.Error(w, "members required", http.StatusBadRequest)
			return
		}

		//вставляем чат
		row := db.QueryRow(
			r.Context(),
			`INSERT INTO chats (title, is_group) VALUES ($1, $2) RETURNING id`,
			req.Title, req.IsGroup,
		)
		var chatID int
		if err := row.Scan(&chatID); err != nil {
			log.Printf("CreateChat INSERT chats error: %v", err)
			http.Error(w, "db error (chats)", http.StatusInternalServerError)
			return
		}

		//вставляем участников
		for _, userID := range req.Members {
			if _, err := db.Exec(
				r.Context(),
				`INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)`,
				chatID, userID,
			); err != nil {
				log.Printf("CreateChat INSERT chat_members error (chat %d, user %d): %v",
					chatID, userID, err,
				)
				http.Error(w, "db error (members)", http.StatusInternalServerError)
				return
			}
		}

		//отправляем ответ
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(models.Chat{
			ID:      chatID,
			Title:   req.Title,
			IsGroup: req.IsGroup,
			Members: req.Members,
		}); err != nil {
			log.Printf("CreateChat encoding response error: %v", err)
		}
	}
}
