package models

import "time"

// User — структура для таблицы users
type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// Chat — структура для таблицы chats
type Chat struct {
	ID      int    `json:"id"`
	Title   string `json:"title,omitempty"` // пустое для личных чатов
	IsGroup bool   `json:"is_group"`
	Members []int  `json:"members,omitempty"` // список user_id, можно не возвращать всегда
}

// Message — структура для таблицы messages
type Message struct {
	ID        int       `json:"id"`
	ChatID    int       `json:"chat_id"`
	SenderID  int       `json:"sender_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

// Post — структура для таблицы posts
type Post struct {
	ID        int       `json:"id"`
	AuthorID  int       `json:"author_id"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}
