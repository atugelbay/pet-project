package config

import (
	"log"
	"os"
	"time"
)

type Config struct {
	DBUser, DBPassword, DBName, DBHost, DBPort string
	RedisHost, RedisPort                       string
	JWTSecret                                  string
	JWTExpiresIn                               time.Duration
}

func LoadConfig() Config {
	// читаем строку и проверяем
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	// читаем строку и парсим duration
	expires := os.Getenv("JWT_EXPIRES_IN")
	if expires == "" {
		expires = "24h"
	}
	dur, err := time.ParseDuration(expires)
	if err != nil {
		log.Fatalf("invalid JWT_EXPIRES_IN: %v", err)
	}
	return Config{
		DBUser:       os.Getenv("DB_USER"),
		DBPassword:   os.Getenv("DB_PASSWORD"),
		DBName:       os.Getenv("DB_NAME"),
		DBHost:       os.Getenv("DB_HOST"),
		DBPort:       os.Getenv("DB_PORT"),
		RedisHost:    os.Getenv("REDIS_HOST"),
		RedisPort:    os.Getenv("REDIS_PORT"),
		JWTSecret:    secret,
		JWTExpiresIn: dur,
	}
}

func Getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
