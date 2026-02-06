package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {

	RedisURL      string
	RedisPassword string
	RedisDB       int


	SupabaseURL        string
	SupabaseKey        string
	SupabaseServiceKey string


	Port        string
	Environment string
}

var AppConfig *Config

func Load() {

	godotenv.Load()

	AppConfig = &Config{
		RedisURL:           getEnv("REDIS_URL", "localhost:6379"),
		RedisPassword:      getEnv("REDIS_PASSWORD", ""),
		RedisDB:            0,
		SupabaseURL:        getEnv("SUPABASE_URL", ""),
		SupabaseKey:        getEnv("SUPABASE_KEY", ""),
		SupabaseServiceKey: getEnv("SUPABASE_SERVICE_KEY", ""),
		Port:               getEnv("PORT", "8080"),
		Environment:        getEnv("ENVIRONMENT", "development"),
	}


	if AppConfig.SupabaseURL == "" {
		log.Println("WARNING: SUPABASE_URL not set - match history disabled")
	}

	log.Printf("Config loaded - Environment: %s, Port: %s", AppConfig.Environment, AppConfig.Port)
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}