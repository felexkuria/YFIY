import os
import json
import sqlite3
from database import db

def migrate_posters():
    print("[*] Starting poster migration for existing movies...")
    
    with db.get_connection() as conn:
        # 1. Update existing yts.mx links to img.yts.bz for ALL movies
        print("[*] Rewriting YTS domains in database...")
        conn.execute('''
            UPDATE movies 
            SET cover_image = REPLACE(cover_image, 'yts.mx', 'img.yts.bz'),
                background_image = REPLACE(background_image, 'yts.mx', 'img.yts.bz')
            WHERE cover_image LIKE '%yts.mx%' OR background_image LIKE '%yts.mx%'
        ''')
        conn.execute('''
            UPDATE movies 
            SET cover_image = REPLACE(cover_image, 'yts.bz', 'img.yts.bz'),
                background_image = REPLACE(background_image, 'yts.bz', 'img.yts.bz')
            WHERE (cover_image LIKE '%yts.bz%' AND cover_image NOT LIKE '%img.yts.bz%')
               OR (background_image LIKE '%yts.bz%' AND background_image NOT LIKE '%img.yts.bz%')
        ''')
        
        # 2. Find movies missing local posters
        cursor = conn.execute("SELECT id, title, cover_image FROM movies WHERE local_poster_path IS NULL OR local_poster_path = ''")
        movies = cursor.fetchall()
        
    print(f"[*] Found {len(movies)} movies missing local posters.")
    
    count = 0
    for movie in movies:
        mid = movie['id']
        title = movie['title']
        img_url = movie['cover_image']
        
        if img_url:
            db._download_poster_locally(mid, title, img_url)
            count += 1
            if count % 10 == 0:
                print(f"[*] Task: {count}/{len(movies)} processed...")
                
    print(f"[✓] Migration finished. Processed {count} posters.")

if __name__ == '__main__':
    migrate_posters()
