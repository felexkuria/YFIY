from database import db

def check():
    with db.get_connection() as conn:
        movies_count = conn.execute("SELECT COUNT(*) FROM movies").fetchone()[0]
        watchlist_count = conn.execute("SELECT COUNT(*) FROM watchlist").fetchone()[0]
        recs_count = conn.execute("SELECT COUNT(*) FROM recommendations").fetchone()[0]
        
        print(f"Movies in DB: {movies_count}")
        print(f"Movies in Watchlist: {watchlist_count}")
        print(f"Recommendations in DB: {recs_count}")
        
        if recs_count > 0:
            sample = conn.execute("SELECT * FROM recommendations LIMIT 1").fetchone()
            print(f"Sample Rec: Source {sample['source_movie_id']} -> Rec {sample['recommended_movie_id']}")
            
            joined = conn.execute('''
                SELECT COUNT(*) FROM recommendations r 
                JOIN movies m ON r.recommended_movie_id = m.id
            ''').fetchone()[0]
            print(f"Recommendations with valid Movie records: {joined}")

if __name__ == '__main__':
    check()
