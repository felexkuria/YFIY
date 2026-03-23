import sqlite3
import json
import os
from datetime import datetime, timedelta
from contextlib import contextmanager

class DatabaseManager:
    def __init__(self, db_path=None):
        if db_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            self.db_path = os.path.join(base_dir, 'movie_vault.db')
        else:
            self.db_path = os.path.abspath(db_path)
        
        print(f"[*] Initializing database at: {self.db_path}")
        self.init_db()
    
    @contextmanager
    def get_connection(self):
        conn = None
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False, timeout=30)
            conn.row_factory = sqlite3.Row
            conn.execute('PRAGMA journal_mode=WAL')
            yield conn
            conn.commit()
        except sqlite3.OperationalError as e:
            if "locked" in str(e).lower():
                print(f"[!] Database is locked. Retrying might help. Error: {e}")
            else:
                print(f"[!] Database connection error: {e}")
            raise e
        except Exception as e:
            print(f"[!] Unexpected error: {e}")
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
    
    def init_db(self):
        db_dir = os.path.dirname(self.db_path)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
        
        schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schema.sql')
        
        with self.get_connection() as conn:
            cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='movies'")
            if not cursor.fetchone():
                print("[*] Applying database schema...")
                if os.path.exists(schema_path):
                    with open(schema_path, 'r') as f:
                        schema = f.read()
                    conn.executescript(schema)
            
            cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='recommendations'")
            if not cursor.fetchone():
                print("[*] Adding recommendations table...")
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS recommendations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        source_movie_id INTEGER NOT NULL,
                        recommended_movie_id INTEGER NOT NULL,
                        user_session TEXT DEFAULT 'default',
                        UNIQUE(source_movie_id, recommended_movie_id, user_session),
                        FOREIGN KEY (source_movie_id) REFERENCES movies(id),
                        FOREIGN KEY (recommended_movie_id) REFERENCES movies(id)
                    )
                ''')
                conn.execute('CREATE INDEX IF NOT EXISTS idx_recommendations_source ON recommendations(source_movie_id)')
            
            cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='downloaded_movies'")
            if not cursor.fetchone():
                print("[*] Adding downloaded_movies table...")
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS downloaded_movies (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        movie_id INTEGER NOT NULL,
                        title TEXT NOT NULL,
                        quality TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        file_size_mb REAL,
                        subtitle_paths TEXT,
                        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(movie_id, quality)
                    )
                ''')
                conn.execute('CREATE INDEX IF NOT EXISTS idx_downloaded_movies_id ON downloaded_movies(movie_id)')
            else:
                # Add subtitle_paths column if it doesn't exist
                try:
                    conn.execute('ALTER TABLE downloaded_movies ADD COLUMN subtitle_paths TEXT')
                except:
                    pass

            # Migration: Ensure movies table has yt_trailer_code and background_image if schema was old
            try:
                conn.execute("ALTER TABLE movies ADD COLUMN yt_trailer_code TEXT")
            except: pass
            
            # Migration: Ensure torrents table has subtitle_url
            try:
                conn.execute("ALTER TABLE torrents ADD COLUMN subtitle_url TEXT")
            except: pass

            # Migration: Ensure torrents table has download_state
            try:
                conn.execute("ALTER TABLE torrents ADD COLUMN download_state TEXT DEFAULT 'available'")
            except: pass

            # Migration: Ensure movies table has local_poster_path
            try:
                conn.execute("ALTER TABLE movies ADD COLUMN local_poster_path TEXT")
            except: pass

            # Migration: Add users table if not exists (in case schema.sql wasn't rerun)
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    email TEXT UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
    
    def get_cache(self, key):
        with self.get_connection() as conn:
            result = conn.execute(
                'SELECT cache_data FROM api_cache WHERE cache_key = ? AND expires_at > ?',
                (key, datetime.now())
            ).fetchone()
            return json.loads(result['cache_data']) if result else None
    
    def set_cache(self, key, data, ttl_hours=24):
        expires_at = datetime.now() + timedelta(hours=ttl_hours)
        with self.get_connection() as conn:
            conn.execute(
                'INSERT OR REPLACE INTO api_cache (cache_key, cache_data, expires_at) VALUES (?, ?, ?)',
                (key, json.dumps(data), expires_at)
            )
    
    def save_movie(self, movie_data):
        self._process_movie_db_entry(movie_data)
        
        with self.get_connection() as conn:
            for torrent in movie_data.get('torrents', []):
                conn.execute('''
                    INSERT OR REPLACE INTO torrents 
                    (movie_id, quality, type, size, hash, seeds, peers, video_codec, audio_channels, subtitle_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT subtitle_url FROM torrents WHERE hash = ?), NULL))
                ''', (
                    movie_data['id'], 
                    torrent.get('quality', 'Unknown'), 
                    torrent.get('type', 'Unknown'),
                    torrent.get('size', '0'), 
                    torrent.get('hash', '').lower(), 
                    torrent.get('seeds', 0),
                    torrent.get('peers', 0), 
                    torrent.get('video_codec'),
                    torrent.get('audio_channels'),
                    torrent.get('hash', '').lower()
                ))

    def _process_movie_db_entry(self, movie_data):
        """Internal helper to save/update movie record with proper image rewriting and local posters."""
        cover_img = movie_data.get('medium_cover_image') or movie_data.get('cover_image', '')
        bg_img = movie_data.get('background_image', '')
        
        # Domain rewriting for YTS
        if cover_img:
            cover_img = cover_img.replace('https://movies-api.accel.li', 'https://img.yts.bz').replace('https://yts.bz', 'https://img.yts.bz').replace('https://yts.mx', 'https://img.yts.bz')
        if bg_img:
            bg_img = bg_img.replace('https://movies-api.accel.li', 'https://img.yts.bz').replace('https://yts.bz', 'https://img.yts.bz').replace('https://yts.mx', 'https://img.yts.bz')

        with self.get_connection() as conn:
            conn.execute('''
                INSERT OR REPLACE INTO movies 
                (id, imdb_code, title, year, rating, runtime, language, description, 
                 cover_image, background_image, genres, url, yt_trailer_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                movie_data['id'], movie_data.get('imdb_code'),
                movie_data['title'], movie_data['year'],
                movie_data.get('rating', 0),
                movie_data.get('runtime'),
                movie_data.get('language'), movie_data.get('description_full'),
                cover_img,
                bg_img,
                json.dumps(movie_data.get('genres', [])),
                movie_data.get('url'),
                movie_data.get('yt_trailer_code')
            ))
            
            # Download poster locally if missing
            self._download_poster_locally(movie_data['id'], movie_data['title'], cover_img)
    
    def get_movie_by_hash(self, torrent_hash):
        with self.get_connection() as conn:
            result = conn.execute('''
                SELECT m.id, m.title, m.year, m.rating, m.cover_image AS medium_cover_image, t.subtitle_url 
                FROM torrents t 
                JOIN movies m ON t.movie_id = m.id 
                WHERE LOWER(t.hash) = ?
            ''', (torrent_hash.lower() if torrent_hash else None,)).fetchone()
            return dict(result) if result else None

    def get_movie_by_title(self, title, year=None):
        """Fuzzy title match from local movies table."""
        import re as _re
        def normalize(s):
            s = s.lower().replace('-', ' ').replace(':', ' ')
            s = _re.sub(r'[^a-z0-9 ]', '', s)
            return _re.sub(r'\s+', ' ', s).strip()
        
        with self.get_connection() as conn:
            # First: exact-ish LIKE match with year
            if year:
                result = conn.execute(
                    'SELECT id, title, year, rating, cover_image AS medium_cover_image FROM movies WHERE LOWER(title) LIKE ? AND year = ? LIMIT 1',
                    (f'%{title.lower()}%', int(year))
                ).fetchone()
                if result:
                    return dict(result)
            # Second: LIKE without year
            result = conn.execute(
                'SELECT id, title, year, rating, cover_image AS medium_cover_image FROM movies WHERE LOWER(title) LIKE ? LIMIT 1',
                (f'%{title.lower()}%',)
            ).fetchone()
            if result:
                return dict(result)
            
            # Third: normalized comparison (strips punctuation like `:`, `-`, `!`)
            norm_search = normalize(title)
            candidates = conn.execute(
                'SELECT id, title, year, rating, cover_image AS medium_cover_image FROM movies WHERE year = ? LIMIT 200' if year
                else 'SELECT id, title, year, rating, cover_image AS medium_cover_image FROM movies LIMIT 500',
                (int(year),) if year else ()
            ).fetchall()
            for row in candidates:
                if normalize(row['title']) == norm_search:
                    return dict(row)
            # Partial normalized match
            for row in candidates:
                if norm_search in normalize(row['title']) or normalize(row['title']) in norm_search:
                    return dict(row)
            return None

    def update_subtitle_url(self, torrent_hash, url):
        with self.get_connection() as conn:
            conn.execute('''
                UPDATE torrents SET subtitle_url = ? WHERE LOWER(hash) = ?
            ''', (url, torrent_hash.lower() if torrent_hash else None))

    def get_torrent_state(self, torrent_hash):
        """Returns dict with download_state and subtitle_url for a torrent hash."""
        with self.get_connection() as conn:
            result = conn.execute('''
                SELECT t.download_state, t.subtitle_url, m.title, m.year
                FROM torrents t JOIN movies m ON t.movie_id = m.id
                WHERE LOWER(t.hash) = ?
            ''', (torrent_hash.lower() if torrent_hash else None,)).fetchone()
            return dict(result) if result else None

    def update_torrent_state(self, torrent_hash, state):
        """Persist state: 'available', 'downloading', 'downloaded', 'streaming'"""
        with self.get_connection() as conn:
            conn.execute('''
                UPDATE torrents SET download_state = ? WHERE LOWER(hash) = ?
            ''', (state, torrent_hash.lower() if torrent_hash else None))

    def update_watch_progress(self, movie_id, session_id, current_time, duration):
        current_time = float(current_time or 0)
        duration = float(duration or 0)
        progress = (current_time / duration * 100) if duration > 0 else 0
        completed = progress >= 90
        
        with self.get_connection() as conn:
            row = conn.execute('SELECT id, completed FROM watch_history WHERE movie_id = ? AND user_session = ?', (movie_id, session_id)).fetchone()
            
            if row:
                # Log completion event if just finished
                if completed and not row['completed']:
                    print(f"[✓] Movie {movie_id} marked as completed by {session_id}")
                
                conn.execute('''
                    UPDATE watch_history SET
                        current_time = ?,
                        duration = ?,
                        progress_pct = ?,
                        completed = ?,
                        last_watched = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (current_time, duration, progress, completed, row['id']))
            else:
                if completed:
                    print(f"[✓] Movie {movie_id} completed by {session_id}")
                conn.execute('''
                    INSERT INTO watch_history 
                    (movie_id, user_session, current_time, duration, progress_pct, completed)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (movie_id, session_id, current_time, duration, progress, completed))
    
    def get_watch_progress(self, movie_id, session_id):
        with self.get_connection() as conn:
            result = conn.execute('''
                SELECT current_time, duration, progress_pct, completed
                FROM watch_history
                WHERE movie_id = ? AND user_session = ?
                ORDER BY last_watched DESC LIMIT 1
            ''', (movie_id, session_id)).fetchone()
            return dict(result) if result else None

    def get_watch_history(self, session_id):
        with self.get_connection() as conn:
            results = conn.execute('''
                SELECT wh.*, m.title, m.cover_image as medium_cover_image, m.year, m.rating, m.local_poster_path
                FROM watch_history wh
                JOIN movies m ON wh.movie_id = m.id
                WHERE wh.id IN (
                    SELECT id FROM (
                        SELECT id, movie_id, MAX(last_watched) 
                        FROM watch_history 
                        WHERE user_session = ? AND completed = 0
                        GROUP BY movie_id
                    )
                )
                ORDER BY wh.last_watched DESC
            ''', (session_id,)).fetchall()
            return [dict(row) for row in results]
    
    def add_to_watchlist(self, movie_id, session_id='default'):
        with self.get_connection() as conn:
            conn.execute(
                'INSERT OR IGNORE INTO watchlist (movie_id, user_session) VALUES (?, ?)',
                (movie_id, session_id)
            )
    
    def remove_from_watchlist(self, movie_id, session_id='default'):
        with self.get_connection() as conn:
            conn.execute(
                'DELETE FROM watchlist WHERE movie_id = ? AND user_session = ?',
                (movie_id, session_id)
            )
            conn.execute(
                'DELETE FROM recommendations WHERE source_movie_id = ? AND user_session = ?',
                (movie_id, session_id)
            )
    
    def get_watchlist(self, session_id='default'):
        with self.get_connection() as conn:
            results = conn.execute('''
                SELECT m.id, m.title, m.year, m.rating, m.cover_image as medium_cover_image, m.local_poster_path
                FROM watchlist w
                JOIN movies m ON w.movie_id = m.id
                WHERE w.user_session = ?
                ORDER BY w.added_at DESC
            ''', (session_id,)).fetchall()
            return [dict(row) for row in results]

    def save_recommendations(self, source_movie_id, recommended_movies, session_id='default'):
        for movie in recommended_movies:
            self._process_movie_db_entry(movie)
            with self.get_connection() as conn:
                conn.execute('''
                    INSERT OR IGNORE INTO recommendations (source_movie_id, recommended_movie_id, user_session)
                    VALUES (?, ?, ?)
                ''', (source_movie_id, movie['id'], session_id))

    def get_all_recommendations(self, session_id='default'):
        with self.get_connection() as conn:
            results = conn.execute('''
                SELECT DISTINCT m.id, m.title, m.year, m.rating, m.cover_image as medium_cover_image, 
                                m.background_image, m.description, m.yt_trailer_code, m.local_poster_path
                FROM recommendations r
                JOIN movies m ON r.recommended_movie_id = m.id
                WHERE r.user_session = ?
                AND m.id NOT IN (SELECT movie_id FROM watchlist WHERE user_session = ?)
                ORDER BY m.rating DESC
                LIMIT 100
            ''', (session_id, session_id)).fetchall()
            return [dict(row) for row in results]
    
    def add_downloaded_movie(self, movie_id, title, quality, file_path, file_size_mb, subtitle_paths=None):
        with self.get_connection() as conn:
            conn.execute('''
                INSERT OR REPLACE INTO downloaded_movies (movie_id, title, quality, file_path, file_size_mb, subtitle_paths)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (movie_id, title, quality, file_path, file_size_mb, json.dumps(subtitle_paths) if subtitle_paths else None))
    
    def get_downloaded_movie(self, movie_id, quality):
        with self.get_connection() as conn:
            result = conn.execute('''
                SELECT * FROM downloaded_movies WHERE movie_id = ? AND quality = ?
            ''', (movie_id, quality)).fetchone()
            return dict(result) if result else None
    
    def get_all_downloaded_movies(self):
        with self.get_connection() as conn:
            results = conn.execute('SELECT * FROM downloaded_movies ORDER BY added_at DESC').fetchall()
            return [dict(row) for row in results]

    def create_user(self, username, password_hash, email=None):
        with self.get_connection() as conn:
            try:
                conn.execute(
                    'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
                    (username, password_hash, email)
                )
                return True
            except sqlite3.IntegrityError:
                return False

    def get_user(self, username):
        with self.get_connection() as conn:
            result = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
            return dict(result) if result else None

    def _download_poster_locally(self, movie_id, title, img_url):
        if not img_url: return
        
        try:
            import requests # already used in main server, but let's be safe
            import re
            
            # Create a safe folder name
            safe_title = re.sub(r'[^a-zA-Z0-9 ]', '', title)
            movie_dir = os.path.join(os.path.dirname(self.db_path), 'downloads', safe_title)
            os.makedirs(movie_dir, exist_ok=True)
            
            poster_path = os.path.join(movie_dir, 'poster.jpg')
            if os.path.exists(poster_path):
                # Update DB with path if missing
                with self.get_connection() as conn:
                    conn.execute('UPDATE movies SET local_poster_path = ? WHERE id = ?', (f"{safe_title}/poster.jpg", movie_id))
                return

            print(f"[*] Downloading poster for {title}...")
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(img_url, headers=headers, timeout=10)
            if response.status_code == 200:
                with open(poster_path, 'wb') as f:
                    f.write(response.content)
                
                with self.get_connection() as conn:
                    conn.execute('UPDATE movies SET local_poster_path = ? WHERE id = ?', (f"{safe_title}/poster.jpg", movie_id))
                print(f"[✓] Poster saved to {poster_path}")
        except Exception as e:
            print(f"[!] Error downloading poster: {e}")

db = DatabaseManager()
