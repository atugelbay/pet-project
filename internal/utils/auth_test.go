package utils

import (
	"strings"
	"testing"
	"time"
)

func TestHashAndCompare(t *testing.T) {
	raw := "somePassword!"
	hash, err := HashPassword(raw)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}
	if len(hash) == 0 || !strings.HasPrefix(hash, "$2") {
		t.Errorf("HashPassword returned invalid hash: %q", hash)
	}
	if err := ComparePassword(hash, raw); err != nil {
		t.Errorf("ComparePassword should match but got error: %v", err)
	}
	if err := ComparePassword(hash, "wrong"); err == nil {
		t.Error("ComparePassword should fail for wrong password")
	}
}

func TestGenerateAndParseJWT(t *testing.T) {
	secret := "unitTestSecret"
	uid := 123
	expires := 1 * time.Second

	token, err := GenerateJWT(secret, uid, expires)
	if err != nil {
		t.Fatalf("GenerateJWT failed: %v", err)
	}
	if token == "" {
		t.Fatal("GenerateJWT returned empty token")
	}
	parsed, err := ParseJWT(secret, token)
	if err != nil {
		t.Fatalf("ParseJWT failed: %v", err)
	}
	if parsed != uid {
		t.Errorf("ParseJWT returned %d; want %d", parsed, uid)
	}
	// Дожидаемся, пока токен истечёт
	time.Sleep(expires + 10*time.Millisecond)
	if _, err := ParseJWT(secret, token); err == nil {
		t.Error("ParseJWT should fail on expired token")
	}
}
