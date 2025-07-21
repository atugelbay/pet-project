package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"pet-project/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
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
			`SELECT 
				m.id,
				m.chat_id,
				m.sender_id,
				u.name       AS sender_name,
				m.content,
				m.created_at
			FROM messages m
			JOIN users u ON u.id = m.sender_id
			WHERE m.chat_id = $1
			ORDER BY m.created_at ASC
			`, chatID)
		if err != nil {
			log.Printf("[ListMessages] query error: %v", err)
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		//Сканируем результаты
		msgs := make([]models.Message, 0)
		for rows.Next() {
			var m models.Message
			if err := rows.Scan(&m.ID, &m.ChatID, &m.SenderID, &m.SenderName, &m.Content, &m.CreatedAt); err != nil {
				log.Printf("[ListMessages] scan error: %v", err)
				http.Error(w, "scan error", http.StatusInternalServerError)
				return
			}
			msgs = append(msgs, m)
		}
		if rows.Err() != nil {
			log.Printf("[ListMessages] rows.Err: %v", rows.Err())
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		//Возвращаем JSON‑массив сообщений
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(msgs); err != nil {
			log.Printf("[ListMessages] encode error: %v", err)
		}
	}
}

// SendMessage — заглушка для POST /chats/{chatID}/messages
func SendMessage(db *pgxpool.Pool, rdb *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//Парсим chatID
		chatIDStr := chi.URLParam(r, "chatID")
		chatID, err := strconv.Atoi(chatIDStr)
		if err != nil {
			log.Printf("[SendMessage] invalid chatID %q: %v", chatIDStr, err)
			http.Error(w, "Invalid chatId", http.StatusBadRequest)
			return
		}

		//Декодируем тело запроса
		var req struct {
			SenderID int    `json:"sender_id"`
			Content  string `json:"content"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("[SendMessage] JSON decode error: %v", err)
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		if req.Content == "" {
			log.Printf("[SendMessage] empty content in request: %+v", req)
			http.Error(w, "Content required", http.StatusBadRequest)
			return
		}

		//ВСтавляем в messages и получаем id+created_at
		row := db.QueryRow(
			r.Context(),
			`INSERT INTO messages (chat_id, sender_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, created_at`,
			chatID, req.SenderID, req.Content,
		)
		var msg models.Message
		msg.ChatID = chatID
		msg.SenderID = req.SenderID
		msg.Content = req.Content

		if err := row.Scan(&msg.ID, &msg.CreatedAt); err != nil {
			log.Printf("[SendMessage] DB insert error: %v", err)
			http.Error(w, "db error", http.StatusBadRequest)
			return
		}

		//redis публикация
		payload, _ := json.Marshal(msg)
		channel := fmt.Sprintf("chat:%d", chatID)
		if err := rdb.Publish(r.Context(), channel, payload).Err(); err != nil {
			log.Printf("WS publish error: %v", err)
		}

		//отдаем ответ с JSON
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(msg); err != nil {
			log.Printf("[SendMessage] JSON encode error: %v", err)
		}
	}
}
