package middleware

import (
	"context"
	"net/http"
	"strings"

	"pet-project/internal/utils"
)

// ключ для контекста
type ctxKeyUserID struct{}

// FromContext позволяет из handler’а достать userID
func FromContext(ctx context.Context) (int, bool) {
	id, ok := ctx.Value(ctxKeyUserID{}).(int)
	return id, ok
}

// JWTAuth возвращает middleware, который:
// читает заголовок Authorization: Bearer <token>
// валидирует токен через utils.ParseJWT
// кладёт userID в контекст r.Context()
// ызывает следующий handler или возвращает 401
func JWTAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			if !strings.HasPrefix(h, "Bearer ") {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			token := strings.TrimPrefix(h, "Bearer ")
			uid, err := utils.ParseJWT(secret, token)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			// помещаем userID в контекст
			ctx := context.WithValue(r.Context(), ctxKeyUserID{}, uid)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
