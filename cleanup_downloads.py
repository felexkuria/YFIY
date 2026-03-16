import os
import sqlite3
import re
from database import db

def cleanup():
    print("[*] Starting download cleanup...")
    
    with db.get_connection() as conn:
        # Get all records from downloaded_movies
        cursor = conn.execute("SELECT id, movie_id, title, quality, file_path FROM downloaded_movies")
        rows = cursor.fetchall()
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        downloads_dir = os.path.join(base_dir, 'downloads')
        
        removed_count = 0
        for row in rows:
            full_path = os.path.join(downloads_dir, row['file_path'])
            if not os.path.exists(full_path):
                print(f"[!] File missing: {row['file_path']} (Title: {row['title']})")
                conn.execute("DELETE FROM downloaded_movies WHERE id = ?", (row['id'],))
                removed_count += 1
        
        print(f"[✓] Cleanup finished. Removed {removed_count} stale records.")

if __name__ == '__main__':
    cleanup()
