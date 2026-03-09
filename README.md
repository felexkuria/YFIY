# Ninja Movie Vault - Python Streaming Backend

## 🚀 Setup Instructions

### 1. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate  # On Windows
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the Streaming Server
```bash
python stream_server.py
```

Server runs on `http://localhost:5001`

### 4. Open the Website
```bash
open index.html
```

## 🎬 How It Works

### Python Backend (libtorrent)
- **Sequential Download**: Downloads video from beginning to end
- **Stream While Downloading**: Watch after 5% buffered
- **Professional Grade**: Same library used by Deluge, qBittorrent

### Features
- Real-time progress tracking
- Peer connection monitoring
- Automatic video file detection
- HTTP streaming to browser

## 📊 API Endpoints

### POST /api/stream
Start a torrent download
```json
{
  "magnet": "magnet:?xt=urn:btih:..."
}
```

### GET /api/status/<torrent_id>
Get download progress
```json
{
  "progress": 45.2,
  "num_peers": 12,
  "download_rate": 1048576
}
```

### GET /api/video/<torrent_id>
Stream video file (starts after 5% buffered)

## 🎯 For Your Portfolio

This demonstrates:
- **Backend Development**: Flask REST API
- **P2P Networking**: BitTorrent protocol
- **Data Streaming**: Sequential file delivery
- **Full-Stack Integration**: Python + JavaScript

Perfect for showcasing to OUK professors! 🎓


# Database Setup
1. Initialize database: python -c "from database import db"
2. Database file: movie_vault.db
3. Auto-creates tables on first run
