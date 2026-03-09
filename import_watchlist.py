import requests
import json
import sqlite3
import os
import time
from database import db

watchlist_data = [
    {"added_at": "2026-02-12 22:49:51", "movie_id": 33463},
    {"added_at": "2026-02-12 22:49:48", "movie_id": 37563},
    {"added_at": "2026-02-12 22:49:30", "movie_id": 31920},
    {"added_at": "2026-02-12 22:49:18", "movie_id": 33797},
    {"added_at": "2026-02-12 22:49:16", "movie_id": 32174},
    {"added_at": "2026-02-12 22:48:53", "movie_id": 33015},
    {"added_at": "2026-02-12 22:48:52", "movie_id": 28357},
    {"added_at": "2026-02-12 22:48:39", "movie_id": 25286},
    {"added_at": "2026-02-12 22:40:17", "movie_id": 13596},
    {"added_at": "2026-02-12 22:40:05", "movie_id": 12640},
    {"added_at": "2026-02-12 22:40:03", "movie_id": 9947},
    {"added_at": "2026-02-12 22:40:01", "movie_id": 10960},
    {"added_at": "2026-02-12 22:39:59", "movie_id": 11250},
    {"added_at": "2026-02-12 22:39:34", "movie_id": 11107},
    {"added_at": "2026-02-12 22:27:23", "movie_id": 73776},
    {"added_at": "2026-02-12 22:27:20", "movie_id": 23627},
    {"added_at": "2026-02-12 22:26:30", "movie_id": 73765},
    {"added_at": "2026-02-12 22:24:46", "movie_id": 22668},
    {"added_at": "2026-02-12 22:24:43", "movie_id": 24502},
    {"added_at": "2026-02-12 22:24:41", "movie_id": 23905},
    {"added_at": "2026-02-12 22:24:39", "movie_id": 24459},
    {"added_at": "2026-02-12 22:18:48", "movie_id": 63209},
    {"added_at": "2026-02-12 22:04:47", "movie_id": 60283}
]

API_BASE = 'https://movies-api.accel.li/api/v2'

def import_data():
    print(f"[*] Starting import of {len(watchlist_data)} movies and recommendations...")
    
    for item in watchlist_data:
        movie_id = item['movie_id']
        added_at = item['added_at']
        
        print(f"[*] Processing movie ID: {movie_id}...")
        
        try:
            # 1. Fetch movie details
            res = requests.get(f"{API_BASE}/movie_details.json?movie_id={movie_id}")
            if res.ok:
                data = res.json()
                movie_data = data.get('data', {}).get('movie')
                
                if movie_data:
                    db.save_movie(movie_data)
                    
                    with db.get_connection() as conn:
                        conn.execute(
                            'INSERT OR IGNORE INTO watchlist (movie_id, user_session, added_at) VALUES (?, ?, ?)',
                            (movie_id, 'default', added_at)
                        )
                    print(f"[+] Imported movie: {movie_data['title']}")

                    # 2. Fetch and save recommendations (movie suggestions)
                    print(f"    [*] Fetching recommendations for {movie_data['title']}...")
                    sug_res = requests.get(f"{API_BASE}/movie_suggestions.json?movie_id={movie_id}")
                    if sug_res.ok:
                        sug_data = sug_res.json()
                        suggestions = sug_data.get('data', {}).get('movies', [])
                        if suggestions:
                            db.save_recommendations(movie_id, suggestions, 'default')
                            print(f"    [+] Saved {len(suggestions)} recommendations")
                        else:
                            print(f"    [!] No recommendations found")
                    
                    # Sleep slightly to be nice to the API
                    time.sleep(0.5)
                else:
                    print(f"[!] No movie data found for ID {movie_id}")
            else:
                print(f"[!] API request failed for ID {movie_id}")
                
        except Exception as e:
            print(f"[!] Error importing ID {movie_id}: {e}")

    print("[*] Import complete! Your 'Recommended For You' row should now have data.")

if __name__ == '__main__':
    import_data()
