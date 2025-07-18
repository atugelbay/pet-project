package handlers

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

// CreatePost — заглушка для POST /posts
func CreatePost(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "CreatePost not implemented", http.StatusNotImplemented)
	}
}

// ListPosts — заглушка для GET /posts
func ListPosts(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "ListPosts not implemented", http.StatusNotImplemented)
	}
}

// GetPost — заглушка для GET /posts/{postID}
func GetPost(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "GetPost not implemented", http.StatusNotImplemented)
	}
}

// UpdatePost — заглушка для PUT /posts/{postID}
func UpdatePost(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "UpdatePost not implemented", http.StatusNotImplemented)
	}
}

// DeletePost — заглушка для DELETE /posts/{postID}
func DeletePost(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "DeletePost not implemented", http.StatusNotImplemented)
	}
}
