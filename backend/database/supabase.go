package database

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/supabase-community/postgrest-go"
	supa "github.com/supabase-community/supabase-go"

)

var SupabaseClient *supa.Client


func InitSupabase(url, key string) error {
	if url == "" || key == "" {
		log.Println("Supabase credentials not provided - match history disabled")
		return nil
	}


	client, err := supa.NewClient(url, key, nil)
	if err != nil {
		return fmt.Errorf("failed to create supabase client: %w", err)
	}

	SupabaseClient = client
	log.Println("Supabase connected successfully")
	return nil
}

type User struct {
	ID          string    `json:"id"`
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	CreatedAt   time.Time `json:"created_at"`
	LastSeen    time.Time `json:"last_seen"`
	GamesPlayed int       `json:"games_played"`
	GamesWon    int       `json:"games_won"`
}

type GameMatch struct {
	ID              string    `json:"id"`
	RoomCode        string    `json:"room_code"`
	WinnerRole      string    `json:"winner_role"`
	ImpostorID      string    `json:"impostor_id"`
	DurationSeconds int       `json:"duration_seconds"`
	StagesCompleted int       `json:"stages_completed"`
	EndedAt         time.Time `json:"ended_at"`
}

type MatchPlayer struct {
	MatchID       string `json:"match_id"`
	UserID        string `json:"user_id"`
	Role          string `json:"role"`
	WasEliminated bool   `json:"was_eliminated"`
}

func GetOrCreateUser(username string) (*User, error) {
	if SupabaseClient == nil {
		return &User{Username: username}, nil
	}

	var users []User
	

	data, _, err := SupabaseClient.From("users").
		Select("*", "", false).
		Eq("username", username).
		Execute()

	if err == nil {
		_ = json.Unmarshal(data, &users)
	}

	if len(users) > 0 {
		user := users[0]
		user.LastSeen = time.Now()


		_, _, _ = SupabaseClient.From("users").
			Update(map[string]interface{}{"last_seen": user.LastSeen}, "", "").
			Eq("id", user.ID).
			Execute()
			
		return &user, nil
	}

	newUser := User{
		Username:    username,
		DisplayName: username,
		CreatedAt:   time.Now(),
		LastSeen:    time.Now(),
		GamesPlayed: 0,
		GamesWon:    0,
	}

	var result []User

	data, _, err = SupabaseClient.From("users").
		Insert(newUser, false, "", "", "").
		Execute()

	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}
	
	if err := json.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("failed to parse created user: %w", err)
	}

	if len(result) > 0 {
		return &result[0], nil
	}

	return &newUser, nil
}

func SaveGameMatch(match GameMatch, players []MatchPlayer) error {
	if SupabaseClient == nil {
		log.Println("Supabase not configured - match not saved")
		return nil
	}

	var matchResult []GameMatch
	data, _, err := SupabaseClient.From("game_matches").
		Insert(match, false, "", "", "").
		Execute()

	if err != nil {
		return fmt.Errorf("failed to save game match: %w", err)
	}

	if err := json.Unmarshal(data, &matchResult); err != nil {
		return fmt.Errorf("failed to parse match result: %w", err)
	}

	if len(matchResult) == 0 {
		return fmt.Errorf("no match result returned")
	}

	matchID := matchResult[0].ID

	for i := range players {
		players[i].MatchID = matchID
	}

	_, _, err = SupabaseClient.From("match_players").
		Insert(players, false, "", "", "").
		Execute()

	if err != nil {
		log.Printf("Failed to save match players: %v", err)
	}


	for _, p := range players {

		currentUser, err := GetUserStats(p.UserID)
		if err != nil {
			log.Printf("Failed to fetch user %s for stats update: %v", p.UserID, err)
			continue
		}

		won := (match.WinnerRole == "CIVILIAN" && p.Role == "CIVILIAN") ||
			(match.WinnerRole == "IMPOSTER" && p.Role == "IMPOSTER")

		currentUser.GamesPlayed++
		if won {
			currentUser.GamesWon++
		}

		updateData := map[string]interface{}{
			"games_played": currentUser.GamesPlayed,
			"games_won":    currentUser.GamesWon,
		}

		_, _, err = SupabaseClient.From("users").
			Update(updateData, "", "").
			Eq("id", p.UserID).
			Execute()
			
		if err != nil {
			log.Printf("Failed to update stats for user %s", p.UserID)
		}
	}

	log.Printf("Match saved to Supabase: %s (Winner: %s)", matchID, match.WinnerRole)
	return nil
}

func GetUserStats(userID string) (*User, error) {
	if SupabaseClient == nil {
		return nil, fmt.Errorf("supabase not configured")
	}

	var users []User
	data, _, err := SupabaseClient.From("users").
		Select("*", "", false).
		Eq("id", userID).
		Execute()

	if err != nil {
		return nil, err
	}
	
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}

	if len(users) == 0 {
		return nil, fmt.Errorf("user not found")
	}

	return &users[0], nil
}

func GetLeaderboard(limit int) ([]User, error) {
	if SupabaseClient == nil {
		return nil, fmt.Errorf("supabase not configured")
	}

	var users []User	
	data, _, err := SupabaseClient.From("users").
		Select("*", "", false).
		Gte("games_played", "3").
		Order("games_won", &postgrest.OrderOpts{Ascending: false}). 
		Limit(limit, "").
		Execute()

	if err != nil {
		return nil, err
	}
	
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}

	return users, nil
}