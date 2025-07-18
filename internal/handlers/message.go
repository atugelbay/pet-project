package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"pet-project/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func ListMessages(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//Получаем chatID из пути
		chatIDStr := chi.URLParam(r, "chatID")
		chatID, err := strconv.Atoi(chatIDStr)
		if err != nil {
			http.Error(w, "invalid chatID", http.StatusBadRequest)
			return
		}

		//Делаем запрос к БД
		rows, err := db.Query(
			r.Context(),
			`SELECT id, chat_id, sender_id, content, created_at
             FROM messages
             WHERE chat_id = $1
             ORDER BY created_at ASC`,
			chatID,
		)
		if err != nil {
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		//Сканируем результаты
		var msgs []models.Message
		for rows.Next() {
			var m models.Message
			if err := rows.Scan(&m.ID, &m.ChatID, &m.SenderID, &m.Content, &m.CreatedAt); err != nil {
				http.Error(w, "scan error", http.StatusInternalServerError)
				return
			}
			msgs = append(msgs, m)
		}
		if rows.Err() != nil {
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		//Возвращаем JSON‑массив сообщений
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(msgs)
	}
}

// SendMessage — заглушка для POST /chats/{chatID}/messages
func SendMessage(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "SendMessage not implemented", http.StatusNotImplemented)
	}
}
