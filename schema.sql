-- Ninja Movie Vault Database Schema

CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY,
    imdb_code TEXT,
    title TEXT NOT NULL,
    year INTEGER,
    rating REAL,
    runtime INTEGER,
    language TEXT,
    description TEXT,
    cover_image TEXT,
    background_image TEXT,
    genres TEXT, -- JSON array
    url TEXT,
    local_poster_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS torrents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    quality TEXT,
    type TEXT,
    size TEXT,
    hash TEXT UNIQUE,
    seeds INTEGER DEFAULT 0,
    peers INTEGER DEFAULT 0,
    video_codec TEXT,
    audio_channels TEXT,
    subtitle_url TEXT,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS watch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    user_session TEXT,
    current_time INTEGER DEFAULT 0, -- seconds
    duration INTEGER, -- total duration
    progress_pct REAL DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info TEXT,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    user_session TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(movie_id, user_session),
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_movie_id INTEGER NOT NULL,
    recommended_movie_id INTEGER NOT NULL,
    user_session TEXT DEFAULT 'default',
    UNIQUE(source_movie_id, recommended_movie_id, user_session),
    FOREIGN KEY (source_movie_id) REFERENCES movies(id),
    FOREIGN KEY (recommended_movie_id) REFERENCES movies(id)
);

CREATE TABLE IF NOT EXISTS api_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT UNIQUE,
    cache_data TEXT, -- JSON
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_movies_year ON movies(year);
CREATE INDEX idx_movies_rating ON movies(rating);
CREATE INDEX idx_torrents_movie ON torrents(movie_id);
CREATE INDEX idx_watch_history_movie ON watch_history(movie_id);
CREATE INDEX idx_watch_history_session ON watch_history(user_session);
CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_recommendations_source ON recommendations(source_movie_id);
