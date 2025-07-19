package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var upgrager = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func WSHandler(rdb *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		chatID := chi.URLParam(r, "chatID")
		channel := fmt.Sprintf("chat:%s", chatID)

		conn, err := upgrager.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("[WSHandler] upgrader error: %s", err)
			return
		}
		defer conn.Close()

		pubsub := rdb.Subscribe(r.Context(), channel)
		defer pubsub.Close()

		for msg := range pubsub.Channel() {
			if err := conn.WriteMessage(websocket.TextMessage, []byte(msg.Payload)); err != nil {
				break
			}
		}
	}
}
