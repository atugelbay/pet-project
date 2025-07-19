package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"pet-project/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CreatePost - создание поста POST/posts
func CreatePost(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//Жекодируем тело
		var req struct {
			AuthorID int    `json:"author_id"`
			Title    string `json:"title"`
			Body     string `json:"body"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("[CreatePost] error decoding json: %v", err)
			http.Error(w, "JSON error", http.StatusBadRequest)
			return
		}
		if req.Title == "" || req.Body == "" {
			http.Error(w, "Title and body required", http.StatusBadRequest)
			return
		}

		//вставляем в бд и получаем id + created_at
		row := db.QueryRow(
			r.Context(),
			`INSERT INTO posts (author_id, title, body)
             VALUES ($1, $2, $3)
             RETURNING id, created_at`,
			req.AuthorID, req.Title, req.Body,
		)
		var post models.Post
		post.AuthorID = req.AuthorID
		post.Title = req.Title
		post.Body = req.Body
		if err := row.Scan(&post.ID, &post.CreatedAt); err != nil {
			log.Printf("[CreatePost] error db insert error: %v", err)
			http.Error(w, "DB error", http.StatusInternalServerError)
			return
		}

		//отправляем ответ
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(post); err != nil {
			log.Printf("[CreatePost] JSON encode error: %v", err)
		}
	}
}

// ListPosts - вывод списка постов GET /posts
func ListPosts(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//Выполняем запрос
		rows, err := db.Query(
			r.Context(),
			`SELECT id, author_id, title, body, created_at
			 FROM posts
			 ORDER BY created_at DESC`,
		)
		if err != nil {
			log.Printf("[ListPOsts] error selecting post: %v", err)
			http.Error(w, "db error", http.StatusBadRequest)
			return
		}
		defer rows.Close()

		//Скаинруем строки в срез
		var posts []models.Post
		for rows.Next() {
			var p models.Post
			if err := rows.Scan(
				&p.ID, &p.AuthorID, &p.Title, &p.Body, &p.CreatedAt,
			); err != nil {
				log.Printf("[ListPosts] error scanning: %v", err)
				http.Error(w, "Scan errro", http.StatusInternalServerError)
				return
			}
			posts = append(posts, p)
		}
		if err := rows.Err(); err != nil {
			log.Printf("[ListPosts] error rows: %v", err)
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		//отдаем json
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(posts); err != nil {
			log.Printf("[CreatePost] JSON encode error: %v", err)
		}
	}
}

// GetPost - вывод одного поста GET /posts/{postID}
func GetPost(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//вытаскиваем id
		idStr := chi.URLParam(r, "postID")
		postID, err := strconv.Atoi(idStr)
		if err != nil {
			log.Printf("[GetPOst] error getting ID: %v", err)
			http.Error(w, "invalid postID", http.StatusBadRequest)
			return
		}

		//запрос к бд
		row := db.QueryRow(
			r.Context(),
			`SELECT id, author_id, title, body, created_at
			FROM posts
			WHERE id = $1`,
			postID,
		)

		var p models.Post
		if err := row.Scan(
			&p.ID, &p.AuthorID, &p.Title, &p.Body, &p.CreatedAt,
		); err != nil {
			if err == pgx.ErrNoRows {
				http.Error(w, "post not found", http.StatusNotFound)
			} else {
				log.Printf("[GetPsts] error in db: %v", err)
				http.Error(w, "db error", http.StatusInternalServerError)
			}
			return
		}

		//отдаем json statham
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(p)
	}
}

// UpdatePost - обновление поста PUT /posts/{postID}
func UpdatePost(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//СНОВА ID!!!
		idStr := chi.URLParam(r, "postID")
		postID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid postID", http.StatusBadRequest)
			return
		}

		//декодируем тело
		var req struct {
			Title string `json:"title"`
			Body  string `json:"body"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("[UpdatePost] error in json: %v", err)
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		if req.Title == "" || req.Body == "" {
			http.Error(w, "title and body required", http.StatusBadRequest)
			return
		}

		//обновляем и возвращаем author_id и created_at
		row := db.QueryRow(
			r.Context(),
			`UPDATE posts
               SET title = $1, body = $2
               WHERE id = $3
             RETURNING author_id, created_at`,
			req.Title, req.Body, postID,
		)
		var post models.Post
		post.ID = postID
		post.Title = req.Title
		post.Body = req.Body
		if err := row.Scan(&post.AuthorID, &post.CreatedAt); err != nil {
			if err == pgx.ErrNoRows {
				http.Error(w, "post not found", http.StatusNotFound)
			} else {
				log.Printf("[UpdatePost] error in db: %v", err)
				http.Error(w, "db error", http.StatusInternalServerError)
			}
			return
		}

		// отправляем обновлённый объект
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(post); err != nil {
			log.Printf("[CreatePost] JSON encode error: %v", err)
		}
	}
}

// DeletePost - удаление поста DELETE /posts/{postID}
func DeletePost(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//Айдишник
		idStr := chi.URLParam(r, "postID")
		postID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid postID", http.StatusBadRequest)
			return
		}

		//Удаляем из базы
		cmd, err := db.Exec(
			r.Context(),
			`DELETE FROM posts WHERE id = $1`,
			postID,
		)
		if err != nil {
			log.Printf("[DeletePost] error in db: %v", err)
			http.Error(w, "db error", http.StatusInternalServerError)
			return
		}
		if cmd.RowsAffected() == 0 {
			http.Error(w, "post not found", http.StatusNotFound)
			return
		}

		//Возвращаем 204 No Content
		w.WriteHeader(http.StatusNoContent)
	}
}
