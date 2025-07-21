package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"pet-project/internal/middleware"
	"pet-project/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ListChats(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := middleware.FromContext(r.Context())
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		rows, err := db.Query(
			r.Context(),
			`SELECT
				c.id,
				c.is_group,
				COALESCE(
					NULLIF(c.title, ''),
					MAX(u2.name),
					''
				) AS title
			FROM chats c
			-- обязательно проверяем, что вы в этом чате
			JOIN chat_members cm1 
				ON cm1.chat_id = c.id 
			AND cm1.user_id = $1
			-- все остальные участники
			LEFT JOIN chat_members cm2 
				ON cm2.chat_id = c.id 
			AND cm2.user_id <> $1
			LEFT JOIN users u2 
				ON u2.id = cm2.user_id
			GROUP BY c.id, c.is_group, c.title
			ORDER BY c.id DESC
			`, userID)
		if err != nil {
			log.Printf("[ListChats] query error: %v", err)
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		chats := make([]models.Chat, 0)
		for rows.Next() {
			var c models.Chat
			if err := rows.Scan(&c.ID, &c.IsGroup, &c.Title); err != nil {
				log.Printf("[ListChats] scan error: %v", err)
				http.Error(w, "scan error", http.StatusInternalServerError)
				return
			}
			chats = append(chats, c)
		}
		if err := rows.Err(); err != nil {
			log.Printf("[ListChats] rows.Err: %v", rows.Err())
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(chats); err != nil {
			log.Printf("[ListChats] encode error: %v", err)
		}
	}
}

func CreateChat(db *pgxpool.Pool) http.HandlerFunc {
	type reqBody struct {
		Title   string `json:"title"`
		IsGroup bool   `json:"is_group"`
		Members []int  `json:"members"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// 1) Получаем userID из контекста (JWTAuth уже сработал)
		userID, ok := middleware.FromContext(r.Context())
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		// 2) Декодим тело
		var req reqBody
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		// Добавляем создателя в список участников, если его там ещё нет
		membersMap := map[int]struct{}{}
		for _, u := range req.Members {
			membersMap[u] = struct{}{}
		}
		membersMap[userID] = struct{}{}

		if len(membersMap) <= 1 && !req.IsGroup {
			http.Error(w, "members required", http.StatusBadRequest)
			return
		}

		// 3) Создаём чат
		row := db.QueryRow(
			r.Context(),
			`INSERT INTO chats (title, is_group) VALUES ($1, $2) RETURNING id`,
			req.Title, req.IsGroup,
		)
		var chatID int
		if err := row.Scan(&chatID); err != nil {
			http.Error(w, "db error (chats)", http.StatusInternalServerError)
			return
		}

		// 4) Вставляем участников (включая создателя)
		for u := range membersMap {
			if _, err := db.Exec(
				r.Context(),
				`INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)`,
				chatID, u,
			); err != nil {
				http.Error(w, "db error (members)", http.StatusInternalServerError)
				return
			}
		}

		// 5) Отдаём клиенту новый чат
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(models.Chat{
			ID:      chatID,
			Title:   req.Title,
			IsGroup: req.IsGroup,
			Members: func() []int {
				ms := make([]int, 0, len(membersMap))
				for u := range membersMap {
					ms = append(ms, u)
				}
				return ms
			}(),
		})
	}
}
