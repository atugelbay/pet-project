package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"pet-project/internal/config"
	"pet-project/internal/router"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func main() {
	port := config.Getenv("PORT", "8080")

	cfg := config.LoadConfig()

	//postgres connection
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName,
	)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	dbpool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		log.Fatalf("pgxpool.New error: %v", err)
	}
	defer dbpool.Close()

	if err := dbpool.Ping(ctx); err != nil {
		log.Fatalf("Postgres ping error: %v", err)
	}
	log.Println("Connected to Postgres")

	//redis connection
	rdb := redis.NewClient(&redis.Options{
		Addr: cfg.RedisHost + ":" + cfg.RedisPort,
		DB:   0,
	})
	defer rdb.Close()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Redis ping error: %v", err)
	}
	log.Println("Connected to Redis")

	//server
	r := router.NewRouter(dbpool, rdb, cfg.JWTSecret, cfg.JWTExpiresIn)

	addr := ":" + port
	log.Printf("Server listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
