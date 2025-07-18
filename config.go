package main

import "os"

type Config struct {
	DBUser, DBPassword, DBName, DBHost, DBPort string
	RedisHost, RedisPort                       string
}

func loadConfig() Config {
	return Config{
		DBUser:     getenv("DB_USER", "user"),
		DBPassword: getenv("DB_PASSWORD", "password"),
		DBName:     getenv("DB_NAME", "DB"),
		DBHost:     getenv("DB_HOST", "db"),
		DBPort:     getenv("DB_PORT", "5432"),
		RedisHost:  getenv("REDIS_HOST", "redis"),
		RedisPort:  getenv("REDIS_PORT", "6379"),
	}
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
