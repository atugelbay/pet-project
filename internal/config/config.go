package config

import "os"

type Config struct {
	DBUser, DBPassword, DBName, DBHost, DBPort string
	RedisHost, RedisPort                       string
}

func LoadConfig() Config {
	return Config{
		DBUser:     Getenv("DB_USER", "user"),
		DBPassword: Getenv("DB_PASSWORD", "password"),
		DBName:     Getenv("DB_NAME", "DB"),
		DBHost:     Getenv("DB_HOST", "db"),
		DBPort:     Getenv("DB_PORT", "5432"),
		RedisHost:  Getenv("REDIS_HOST", "redis"),
		RedisPort:  Getenv("REDIS_PORT", "6379"),
	}
}

func Getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
