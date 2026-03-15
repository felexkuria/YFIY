from flask import Flask, send_from_directory, request, Response, jsonify, send_file
from flask_cors import CORS
import libtorrent as lt
import time
import os
import threading
import glob
import re
from urllib.parse import quote_plus
import urllib.request
import mimetypes
import json
import socket
from database import DatabaseManager

app = Flask(__name__, static_folder='.')
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
db = DatabaseManager()

def get_lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

LAN_IP = get_lan_ip()

@app.route('/api/system-info')
def system_info():
    return jsonify({'lan_ip': LAN_IP, 'port': 5001})

ses = lt.session({'listen_interfaces': '0.0.0.0:6881'})
active_torrents = {}

@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Range'
    response.headers['Access-Control-Expose-Headers'] = 'Content-Range, Content-Length, Accept-Ranges'
    response.headers['Accept-Ranges'] = 'bytes'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

def find_existing_file(torrent_hash):
    try:
        import sqlite3, re, glob
        conn = sqlite3.connect('movie_vault.db')
        cur = conn.cursor()
        cur.execute("SELECT t.movie_id, t.quality, m.title FROM torrents t JOIN movies m ON t.movie_id = m.id WHERE LOWER(t.hash) = ?", (torrent_hash.lower(),))
        t_row = cur.fetchone()
        if t_row:
            movie_id, quality, title = t_row
            cur.execute("SELECT file_path FROM downloaded_movies WHERE movie_id = ? AND quality = ?", (movie_id, quality))
            d_row = cur.fetchone()
            if d_row:
                full_path = os.path.join('./downloads', d_row[0])
                if os.path.exists(full_path):
                    return full_path
            
            title_norm = re.sub(r'[^a-z0-9]+', '', title.lower())
            search_path = os.path.join('./downloads', '**', '*.*')
            for file in glob.iglob(search_path, recursive=True):
                if file.lower().endswith(('.mp4', '.mkv', '.avi')):
                    fname = os.path.basename(file).lower()
                    fname_norm = re.sub(r'[^a-z0-9]+', '', fname)
                    if title_norm in fname_norm and quality.lower() in fname:
                        # File exists but not in DB yet - check-download will save it!
                        return file
    except Exception as e:
        print(f"Error checking db for existing file: {e}")

    h = active_torrents.get(torrent_hash)
    if h:
        s = h.status()
        if s.has_metadata:
            try:
                ti = h.torrent_file()
                files = ti.files()
                for i in range(files.num_files()):
                    f_path = files.file_path(i)
                    if f_path.lower().endswith(('.mp4', '.mkv', '.avi')):
                        path = os.path.join('./downloads', f_path)
                        if os.path.exists(path): return path
            except: pass
    
    search_path = os.path.join('./downloads', '**', '*.*')
    for file in glob.iglob(search_path, recursive=True):
        if file.lower().endswith(('.mp4', '.mkv', '.avi')):
            if torrent_hash.lower() in file.lower() or torrent_hash.lower() in os.path.dirname(file).lower():
                return file
    return None

def get_resolution(filename):
    if '2160' in filename or '4k' in filename.lower(): return '4K'
    if '1080' in filename: return '1080p'
    if '720' in filename: return '720p'
    return None

def fetch_subtitlecat_url(title, year=None):
    search_query = quote_plus(f"{title} {year}" if year else title)
    search_url = f"https://www.subtitlecat.com/index.php?search={search_query}"
    
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            
        match = re.search(r'href="(subs/[^"]+)"', html)
        if not match:
            return None
            
        detail_url = "https://www.subtitlecat.com/" + match.group(1)
        
        req = urllib.request.Request(detail_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            detail_html = response.read().decode('utf-8')
            
        en_match = re.search(r'id="download_en"[^>]*href="(/subs/[^"]+)"', detail_html)
        if en_match:
            return "https://www.subtitlecat.com" + en_match.group(1)
            
        orig_match = re.search(r'id="download_orig"[^>]*href="(/subs/[^"]+)"', detail_html)
        if orig_match:
            return "https://www.subtitlecat.com" + orig_match.group(1)
            
        return None
    except Exception as e:
        print(f"Subtitle fetch error: {e}")
        return None

@app.route('/api/check-download/<torrent_hash>')
def check_download_status(torrent_hash):
    existing_file = find_existing_file(torrent_hash)
    h = active_torrents.get(torrent_hash)
    progress = 0
    
    if h:
        s = h.status()
        progress = s.progress * 100
    elif existing_file:
        progress = 100
    
    # Auto-update state to downloaded if file exists completely
    if existing_file and progress >= 100:
        db.update_torrent_state(torrent_hash, 'downloaded')
    
    return jsonify({
        'exists': existing_file is not None,
        'progress': progress,
        'resolution': get_resolution(os.path.basename(existing_file)) if existing_file else None
    })

@app.route('/api/torrent-state/<torrent_hash>', methods=['GET'])
def get_torrent_state(torrent_hash):
    state = db.get_torrent_state(torrent_hash)
    
    # If the database thinks it's not downloaded, let's double check the filesystem
    # to catch any externally downloaded or compressed movies using our fuzzy match!
    if state and state.get('download_state') not in ['downloaded', 'streaming']:
        existing_file = find_existing_file(torrent_hash)
        h = active_torrents.get(torrent_hash)
        if existing_file:
            state['download_state'] = 'downloaded'
            db.update_torrent_state(torrent_hash, 'downloaded')
        elif h:
            state['download_state'] = 'streaming'
            
    if state:
        return jsonify(state)
        
    return jsonify({'download_state': 'available'})

@app.route('/api/torrent-state/<torrent_hash>', methods=['POST'])
def set_torrent_state(torrent_hash):
    data = request.json
    state = data.get('state', 'available')
    db.update_torrent_state(torrent_hash, state)
    return jsonify({'success': True})

@app.route('/api/check-movie-downloaded/<int:movie_id>')
def check_movie_downloaded(movie_id):
    quality = request.args.get('quality', '')
    
    # Check database first
    db_result = db.get_downloaded_movie(movie_id, quality)
    if db_result:
        return jsonify({
            'downloaded': True,
            'partial': False,
            'path': db_result['file_path'],
            'resolution': quality,
            'size_mb': db_result['file_size_mb'],
            'subtitle_paths': json.loads(db_result['subtitle_paths']) if db_result.get('subtitle_paths') else []
        })
    
    # Fallback: scan filesystem
    movie_title = request.args.get('title', '')
    if not movie_title:
        return jsonify({'downloaded': False})
    
    search_path = os.path.join('./downloads', '**', '*.*')
    for file in glob.iglob(search_path, recursive=True):
        if file.lower().endswith(('.mp4', '.mkv', '.avi')):
            filename = os.path.basename(file).lower()
            # Normalize both title and filename for comparison
            title_normalized = re.sub(r'[^a-z0-9]+', '', movie_title.lower())
            filename_normalized = re.sub(r'[^a-z0-9]+', '', filename)
            
            title_match = title_normalized in filename_normalized
            quality_match = quality.lower() in filename if quality else True
            
            if title_match and quality_match:
                stat = os.stat(file)
                file_size_mb = stat.st_size / (1024 * 1024)
                is_complete = file_size_mb > 100
                if is_complete:
                    file_path = file.replace('./downloads/', '')
                    dir_path = os.path.dirname(file)
                    
                    # Find subtitles
                    subtitle_paths = []
                    for sub_file in os.listdir(dir_path):
                        if sub_file.lower().endswith(('.srt', '.vtt')):
                            subtitle_paths.append(os.path.join(os.path.dirname(file_path), sub_file))
                    subs_folder = os.path.join(dir_path, 'Subs')
                    if os.path.isdir(subs_folder):
                        for sub_file in os.listdir(subs_folder):
                            if sub_file.lower().endswith(('.srt', '.vtt')):
                                subtitle_paths.append(os.path.join(os.path.dirname(file_path), 'Subs', sub_file))
                    
                    # Save to database
                    db.add_downloaded_movie(movie_id, movie_title, quality, file_path, round(file_size_mb, 2), subtitle_paths)
                    
                return jsonify({
                    'downloaded': is_complete,
                    'partial': not is_complete,
                    'path': file.replace('./downloads/', ''),
                    'resolution': get_resolution(filename),
                    'size_mb': round(file_size_mb, 2),
                    'subtitle_paths': subtitle_paths if is_complete else []
                })
    
    return jsonify({'downloaded': False, 'partial': False})

def fetch_yts(params):
    YTS_API = 'https://movies-api.accel.li/api/v2/list_movies.json'
    try:
        query_string = '&'.join([f"{k}={quote_plus(str(v))}" for k, v in params.items()])
        url = f"{YTS_API}?{query_string}"
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data.get('status') == 'ok':
                return data.get('data', {}).get('movies') or []
    except Exception as e:
        print(f"YTS Fetch Error: {e}")
    return []

@app.route('/api/movies-by-cast')
def movies_by_cast():
    name = request.args.get('name', '').strip()
    if not name:
        return jsonify({'movies': []})
    
    # 1. Get local movies
    movies_dict = {}
    with db.get_connection() as conn:
        local_rows = conn.execute('''
            SELECT DISTINCT m.id, m.title, m.year, m.rating,
                   m.cover_image AS medium_cover_image,
                   m.background_image, m.description, m.yt_trailer_code, m.genres
            FROM cast_members c
            JOIN movies m ON c.movie_id = m.id
            WHERE LOWER(c.name) = LOWER(?)
        ''', (name,)).fetchall()
        
    for r in local_rows:
        d = dict(r)
        d['is_local'] = True
        try: d['genres'] = json.loads(d.get('genres') or '[]')
        except: d['genres'] = []
        movies_dict[d['id']] = d
        
    # 2. Get API movies
    api_movies = fetch_yts({'query_term': name, 'limit': 20})
    for m in api_movies:
        if m['id'] not in movies_dict:
            movies_dict[m['id']] = m
            
    return jsonify({'movies': list(movies_dict.values()), 'cast_name': name})

@app.route('/api/movies-by-genre')
def movies_by_genre():
    genre = request.args.get('genre', '').strip()
    if not genre:
        return jsonify({'movies': []})
        
    # 1. Get local movies
    movies_dict = {}
    with db.get_connection() as conn:
        local_rows = conn.execute('''
            SELECT id, title, year, rating,
                   cover_image AS medium_cover_image,
                   background_image, description, yt_trailer_code, genres
            FROM movies
            WHERE LOWER(genres) LIKE LOWER(?)
            ORDER BY rating DESC
        ''', (f'%{genre}%',)).fetchall()
        
    for r in local_rows:
        d = dict(r)
        d['is_local'] = True
        try: d['genres'] = json.loads(d.get('genres') or '[]')
        except: d['genres'] = []
        movies_dict[d['id']] = d
        
    # 2. Get API movies
    api_movies = fetch_yts({'genre': genre, 'limit': 50, 'sort_by': 'rating'})
    for m in api_movies:
        if m['id'] not in movies_dict:
            movies_dict[m['id']] = m
            
    # Sort merged results by rating
    sorted_movies = sorted(movies_dict.values(), key=lambda x: x.get('rating') or 0, reverse=True)
            
    return jsonify({'movies': sorted_movies, 'genre': genre})

@app.route('/api/movies', methods=['POST'])
def save_movie():
    movie_data = request.json
    db.save_movie(movie_data)
    return jsonify({'success': True})

@app.route('/api/completed-movies', methods=['GET'])
def get_completed_movies():
    session_id = request.args.get('session_id', 'default')
    return jsonify({'completed': db.get_completed_movies(session_id)})

@app.route('/api/watched', methods=['GET'])
def get_watched_movies():
    session_id = request.args.get('session_id', 'default')
    with db.get_connection() as conn:
        rows = conn.execute('''
            SELECT m.id, m.title, m.year, m.rating, m.cover_image,
                   wh.progress_pct, wh.last_watched
            FROM watch_history wh
            JOIN movies m ON m.id = wh.movie_id
            WHERE wh.user_session = ? AND wh.completed = 1
            ORDER BY wh.last_watched DESC
        ''', (session_id,)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/sync-downloads', methods=['POST'])
def sync_downloads():
    """Scan downloads folder, look up any missing movies on YTS API and save to DB."""
    import requests as req
    YTS_API = 'https://movies-api.accel.li/api/v2/list_movies.json'

    synced = []
    failed = []

    # Get all downloads
    search_path = os.path.join('./downloads', '**', '*.*')
    seen_titles = set()
    for file in glob.iglob(search_path, recursive=True):
        if not file.lower().endswith(('.mp4', '.mkv', '.avi')):
            continue
        parent_folder = os.path.basename(os.path.dirname(file))
        source = parent_folder if parent_folder not in ('.', 'downloads') else os.path.basename(file)

        # Extract title + year
        year_match = re.search(r'\b(19|20)\d{2}\b', source)
        year = year_match.group(0) if year_match else None
        if year:
            raw_title = source[:year_match.start()]
        else:
            raw_title = source
        raw_title = re.sub(r'\[.*?\]|\(.*?\)', '', raw_title)
        raw_title = re.sub(r'[._\-]+', ' ', raw_title).strip()
        raw_title = re.sub(r'\s+', ' ', raw_title).strip()
        raw_title = raw_title.rstrip('([-_ ')

        if not raw_title or raw_title in seen_titles:
            continue
        seen_titles.add(raw_title)

        # Skip if already in DB
        existing = db.get_movie_by_title(raw_title, year)
        if existing:
            continue

        # Search YTS API
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        try:
            params = {'query_term': raw_title, 'limit': 3}
            if year:
                params['year'] = int(year)
            resp = req.get(YTS_API, params=params, headers=headers, timeout=8)
            data = resp.json()
            movies = data.get('data', {}).get('movies') or []

            if not movies and year:
                # retry without year constraint
                resp = req.get(YTS_API, params={'query_term': raw_title, 'limit': 3}, headers=headers, timeout=8)
                movies = resp.json().get('data', {}).get('movies') or []

            if movies:
                db.save_movie(movies[0])
                synced.append({'title': movies[0]['title'], 'year': movies[0]['year'], 'id': movies[0]['id']})
            else:
                failed.append(raw_title)
        except Exception as e:
            failed.append(f'{raw_title} (error: {str(e)[:40]})')

    return jsonify({'synced': synced, 'failed': failed, 'synced_count': len(synced), 'failed_count': len(failed)})

@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    return jsonify(db.get_watchlist())

@app.route('/api/watchlist/<int:movie_id>', methods=['POST', 'GET'])
def add_to_watchlist(movie_id):
    db.add_to_watchlist(movie_id)
    return jsonify({'success': True})

@app.route('/api/watchlist/<int:movie_id>', methods=['DELETE'])
def remove_from_watchlist(movie_id):
    db.remove_from_watchlist(movie_id)
    return jsonify({'success': True})

@app.route('/api/stream', methods=['POST'])
def start_stream():
    data = request.json
    magnet = data.get('magnet')
    params = lt.parse_magnet_uri(magnet)
    params.save_path = './downloads'
    
    h = ses.add_torrent(params)
    try:
        h.set_flags(lt.torrent_flags.sequential_download)
    except:
        try:
            h.set_sequential_download(True)
        except: pass
        
    torrent_id = str(h.info_hash())
    active_torrents[torrent_id] = h
    db.update_torrent_state(torrent_id, 'streaming')
    
    return jsonify({'torrent_id': torrent_id, 'status': 'started'})

@app.route('/api/status/<torrent_id>')
def get_status(torrent_id):
    h = active_torrents.get(torrent_id)
    if not h: return jsonify({'error': 'Not found'}), 404
    
    s = h.status()
    existing_file = find_existing_file(torrent_id)
    is_finished = s.is_finished or s.progress >= 1.0 or existing_file is not None
    
    return jsonify({
        'progress': 100 if is_finished else s.progress * 100,
        'download_rate': s.download_rate,
        'num_peers': s.num_peers,
        'is_finished': is_finished,
        'name': s.name if s.has_metadata else 'Loading...'
    })

def send_file_ranged(file_path):
    size = os.path.getsize(file_path)
    mime, _ = mimetypes.guess_type(file_path)
    if not mime: mime = 'video/mp4'

    range_header = request.headers.get('Range', None)
    if not range_header:
        with open(file_path, 'rb') as f:
            data = f.read()
        return Response(data, 200, mimetype=mime, direct_passthrough=True)

    byte1, byte2 = 0, None
    m = re.search('(\d+)-(\d*)', range_header)
    g = m.groups()
    if g[0]: byte1 = int(g[0])
    if g[1]: byte2 = int(g[1])

    length = size - byte1
    if byte2 is not None:
        length = byte2 - byte1 + 1

    with open(file_path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    rv = Response(data, 206, mimetype=mime, direct_passthrough=True)
    rv.headers.add('Content-Range', 'bytes {0}-{1}/{2}'.format(byte1, byte1 + length - 1, size))
    rv.headers.add('Accept-Ranges', 'bytes')
    return rv

@app.route('/api/video/<torrent_id>')
@app.route('/api/video/<torrent_id>.mp4')
def serve_video(torrent_id):
    if torrent_id.endswith('.mp4'):
        torrent_id = torrent_id[:-4]
    
    existing_file = find_existing_file(torrent_id)
    if existing_file:
        return send_file_ranged(existing_file)

    h = active_torrents.get(torrent_id)
    if not h: return jsonify({'error': 'Not found'}), 404

    timeout = 15
    while not h.status().has_metadata and timeout > 0:
        time.sleep(1)
        timeout -= 1
    
    try:
        ti = h.torrent_file()
        files = ti.files()
        video_files = []
        for i in range(files.num_files()):
            f_path = files.file_path(i)
            if f_path.lower().endswith(('.mp4', '.mkv', '.avi', '.mov')):
                video_files.append({'path': f_path, 'size': files.file_size(i)})
        
        if not video_files:
            return jsonify({'error': 'No video file found'}), 404
            
        video_file = max(video_files, key=lambda x: x['size'])
        file_path = os.path.join('./downloads', video_file.path)
        
        return send_file_ranged(file_path)
    except Exception as e:
        print(f"Video stream error: {e}")
        return jsonify({'error': 'Video readying...'}), 503

@app.route('/api/hls/<torrent_id>/master.m3u8')
def hls_master(torrent_id):
    """HLS master playlist -- Apple TV natively reads the subtitle media reference."""
    base = request.host_url.rstrip('/')
    
    # 1. Video variant playlist
    video_playlist_url = f"{base}/api/hls/{torrent_id}/video.m3u8"
    
    # 2. Subtitle variant playlist lookup
    sub_playlist_url = None
    try:
        movie_info = db.get_movie_by_hash(torrent_id)
        has_remote_sub = movie_info and movie_info.get('subtitle_url')
        
        # Check local files too
        local_sub = None
        existing = find_existing_file(torrent_id)
        if existing:
            dir_path = os.path.dirname(existing)
            for f in os.listdir(dir_path):
                if f.lower().endswith(('.srt', '.vtt')):
                    local_sub = f
                    break
            if not local_sub:
                subs_dir = os.path.join(dir_path, 'Subs')
                if os.path.isdir(subs_dir):
                    for f in os.listdir(subs_dir):
                        if f.lower().endswith(('.srt', '.vtt')):
                            local_sub = os.path.join('Subs', f)
                            break
                            
        if has_remote_sub or local_sub:
            sub_playlist_url = f"{base}/api/hls/{torrent_id}/subtitles.m3u8"
    except Exception as e:
        print(f"HLS master sub lookup error: {e}")

    # Build the multi-variant manifest
    # Apple TV likes hints about resolution and codecs
    manifest = "#EXTM3U\n#EXT-X-VERSION:3\n\n"
    if sub_playlist_url:
        manifest += (
            f'#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",'
            f'DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,LANGUAGE="en",'
            f'URI="{sub_playlist_url}"\n\n'
        )
        manifest += f'#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080,CODECS="avc1.640028,mp4a.40.2",SUBTITLES="subs"\n'
    else:
        manifest += f'#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080,CODECS="avc1.640028,mp4a.40.2"\n'
        
    manifest += f"{video_playlist_url}\n"
    
    return Response(manifest, content_type='application/vnd.apple.mpegurl',
                    headers={
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD'
                    })

@app.route('/api/hls/<torrent_id>/video.m3u8')
def hls_video_playlist(torrent_id):
    """HLS Media Playlist for the video stream -- Wraps the raw MP4 in a single segment."""
    base = request.host_url.rstrip('/')
    video_url = f"{base}/api/video/{torrent_id}.mp4"
    
    # We estimate duration if possible, or just use a large number.
    # Apple TV prefers knowing the duration but '99999' is a safe fallback.
    duration = 7200 # default 2 hours
    try:
        movie_info = db.get_movie_by_hash(torrent_id)
        if movie_info and movie_info.get('runtime'):
            duration = int(movie_info['runtime']) * 60
    except: pass

    playlist = (
        "#EXTM3U\n"
        "#EXT-X-VERSION:6\n"
        "#EXT-X-TARGETDURATION:99999\n"
        "#EXT-X-PLAYLIST-TYPE:VOD\n"
        "#EXT-X-MEDIA-SEQUENCE:0\n"
        f"#EXTINF:{duration}.0,\n"
        f"{video_url}\n"
        "#EXT-X-ENDLIST\n"
    )
    return Response(playlist, content_type='application/vnd.apple.mpegurl',
                    headers={
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD'
                    })


@app.route('/api/hls/<torrent_id>/subtitles.m3u8')
def hls_subtitles(torrent_id):
    """HLS subtitle playlist -- points to the single VTT file for the whole duration."""
    base = request.host_url.rstrip('/')

    # Determine the subtitle URL (remote or local)
    try:
        movie_info = db.get_movie_by_hash(torrent_id)
        if movie_info and movie_info.get('subtitle_url'):
            # Serve the whole thing via our proxy
            vtt_url = f"{base}/api/subtitle/{torrent_id}/REMOTE_SUB_MARKER.vtt"
        else:
            # Look for a local srt/vtt
            vtt_url = None
            existing = find_existing_file(torrent_id)
            if existing:
                dir_path = os.path.dirname(existing)
                for f in os.listdir(dir_path):
                    if f.lower().endswith(('.srt', '.vtt')):
                        rel = os.path.relpath(os.path.join(dir_path, f), './downloads')
                        vtt_url = f"{base}/api/subtitle/{torrent_id}/{rel}.vtt"
                        break
                if not vtt_url:
                    subs_dir = os.path.join(dir_path, 'Subs')
                    if os.path.isdir(subs_dir):
                        for f in os.listdir(subs_dir):
                            if f.lower().endswith(('.srt', '.vtt')):
                                rel = os.path.relpath(os.path.join(subs_dir, f), './downloads')
                                vtt_url = f"{base}/api/subtitle/{torrent_id}/{rel}.vtt"
                                break
            if not vtt_url:
                return "No subtitle available", 404
    except Exception as e:
        return f"Error: {e}", 500

    # A single-segment subtitle playlist matching video duration
    duration = 7200 # default 2 hours
    try:
        movie_info = db.get_movie_by_hash(torrent_id)
        if movie_info and movie_info.get('runtime'):
            duration = int(movie_info['runtime']) * 60
    except: pass

    playlist = (
        "#EXTM3U\n"
        "#EXT-X-VERSION:6\n"
        "#EXT-X-TARGETDURATION:99999\n"
        "#EXT-X-MEDIA-SEQUENCE:0\n"
        f"#EXTINF:{duration}.0,\n"
        f"{vtt_url}\n"
        "#EXT-X-ENDLIST\n"
    )
    return Response(playlist, content_type='application/vnd.apple.mpegurl',
                    headers={
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD'
                    })

@app.route('/api/watch-history', methods=['GET'])
def get_watch_history():
    session_id = request.args.get('session_id', 'default')
    history = db.get_watch_history(session_id)
    return jsonify(history)

@app.route('/api/watch-progress/<int:movie_id>', methods=['GET'])
def get_watch_progress(movie_id):
    return jsonify(db.get_watch_progress(movie_id, 'default') or {})

@app.route('/api/watch-progress/<int:movie_id>', methods=['POST'])
def save_watch_progress(movie_id):
    data = request.json or {}
    current_time = data.get('current_time') or 0
    duration = data.get('duration') or 0
    db.update_watch_progress(movie_id, 'default', current_time, duration)
    return jsonify({'success': True})

@app.route('/api/subtitles/<torrent_id>')
def get_subtitles(torrent_id):
    h = active_torrents.get(torrent_id)
    subs = []
    
    # 1. Check local files
    if h and h.status().has_metadata:
        try:
            ti = h.torrent_file()
            files = ti.files()
            for i in range(files.num_files()):
                f_path = files.file_path(i)
                if f_path.lower().endswith(('.srt', '.vtt')):
                    full_path = os.path.join('./downloads', f_path)
                    if os.path.exists(full_path):
                        subs.append({'name': os.path.basename(f_path), 'path': f_path})
        except: pass
        
    # 2. Check Database / SubtitleCat
    try:
        movie_info = db.get_movie_by_hash(torrent_id)
        if movie_info:
            sub_url = movie_info.get('subtitle_url')
            if not sub_url:
                print(f"Fetching subtitle from SubtitleCat for: {movie_info['title']} {movie_info['year']}")
                sub_url = fetch_subtitlecat_url(movie_info['title'], movie_info['year'])
                if sub_url:
                    db.update_subtitle_url(torrent_id, sub_url)
            
            if sub_url:
                # Add it to the subs list. Path is just a marker we understand in serve_subtitle.
                subs.append({'name': 'English (SubtitleCat)', 'path': 'REMOTE_SUB_MARKER'})
    except Exception as e:
        print(f"Database subtitle error: {e}")
        
    return jsonify({'subtitles': subs})

@app.route('/api/subtitles-local')
def get_local_subtitles():
    dir_path = request.args.get('path', '')
    full_path = os.path.join('./downloads', dir_path)
    subs = []
    if os.path.isdir(full_path):
        for file in os.listdir(full_path):
            if file.lower().endswith(('.srt', '.vtt')):
                subs.append({'name': file, 'path': os.path.join(dir_path, file)})
        # Also check Subs subfolder
        subs_folder = os.path.join(full_path, 'Subs')
        if os.path.isdir(subs_folder):
            for file in os.listdir(subs_folder):
                if file.lower().endswith(('.srt', '.vtt')):
                    subs.append({'name': file, 'path': os.path.join(dir_path, 'Subs', file)})
    return jsonify({'subtitles': subs})

@app.route('/api/subtitle-file')
def serve_subtitle_file():
    file_path = request.args.get('path', '')
    full_path = os.path.join('./downloads', file_path)
    if not os.path.exists(full_path):
        return "Not found", 404
    
    if full_path.lower().endswith('.srt'):
        try:
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            vtt_content = "WEBVTT\n\n" + re.sub(r'(\d{2}:\d{2}:\d{2}),(\d{3})', r'\1.\2', content)
            return Response(vtt_content, content_type='text/vtt; charset=utf-8', headers={'Access-Control-Allow-Origin': '*'})
        except: pass
    return send_file(full_path, mimetype='text/vtt' if file_path.endswith('.vtt') else 'text/plain')

@app.route('/api/subtitle/<torrent_id>/<path:path>')
def serve_subtitle(torrent_id, path):
    serve_raw = False
    if path.endswith('.vtt'):
        path = path[:-4]
    elif request.args.get('format') == 'srt':
        serve_raw = True
    
    if path.endswith('REMOTE_SUB_MARKER'):
        movie_info = db.get_movie_by_hash(torrent_id)
        if movie_info and movie_info.get('subtitle_url'):
            url = movie_info['subtitle_url']
            
            from urllib.parse import urlparse, quote
            parsed_url = urlparse(url)
            encoded_path = quote(parsed_url.path)
            safe_url = f"{parsed_url.scheme}://{parsed_url.netloc}{encoded_path}"
            
            try:
                req = urllib.request.Request(safe_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=10) as response:
                    content = response.read().decode('utf-8', errors='ignore')
                if serve_raw:
                    return Response(content, content_type='text/plain; charset=utf-8',
                                    headers={'Access-Control-Allow-Origin': '*'})
                vtt_content = "WEBVTT\n\n" + re.sub(r'(\d{2}:\d{2}:\d{2}),(\d{3})', r'\1.\2', content)
                return Response(vtt_content, content_type='text/vtt; charset=utf-8', headers={'Access-Control-Allow-Origin': '*'})
            except Exception as e:
                print(f"Error proxying subtitle: {e}")
                return "Sub error", 500

    file_path = os.path.join('./downloads', path)
    if not os.path.exists(file_path):
        # Try searching for subtitle file in downloads folder
        search_path = os.path.join('./downloads', '**', os.path.basename(path))
        for found_file in glob.iglob(search_path, recursive=True):
            if found_file.lower().endswith(('.srt', '.vtt')):
                file_path = found_file
                break
        else:
            return "Not found", 404
    
    if file_path.lower().endswith('.srt'):
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            if serve_raw:
                return Response(content, content_type='text/plain; charset=utf-8',
                                headers={'Access-Control-Allow-Origin': '*'})
            vtt_content = "WEBVTT\n\n" + re.sub(r'(\d{2}:\d{2}:\d{2}),(\d{3})', r'\1.\2', content)
            return Response(vtt_content, content_type='text/vtt; charset=utf-8', headers={'Access-Control-Allow-Origin': '*'})
        except: pass
    return send_file(file_path, mimetype='text/vtt' if path.endswith('.vtt') else 'text/plain')

@app.route('/api/recommendations/save/<int:movie_id>', methods=['POST'])
def save_recommendations(movie_id):
    data = request.json
    recs = data.get('recommendations', [])
    db.save_recommendations(movie_id, recs)
    return jsonify({'success': True})

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    return jsonify(db.get_all_recommendations())


@app.route('/api/downloads', methods=['GET'])
def get_downloads():
    downloads = []
    search_path = os.path.join('./downloads', '**', '*.*')
    for file in glob.iglob(search_path, recursive=True):
        if not file.lower().endswith(('.mp4', '.mkv', '.avi')):
            continue
        stat = os.stat(file)
        filename = os.path.basename(file)
        rel_path = file.replace('./downloads/', '')
        parent_folder = os.path.basename(os.path.dirname(file))

        # Extract title + year from parent folder or filename
        source = parent_folder if parent_folder not in ('.', 'downloads') else filename
        year_match = re.search(r'\b(19|20)\d{2}\b', source)
        year = year_match.group(0) if year_match else None
        # Strip everything from year onwards, then clean brackets and dashes
        if year:
            raw_title = source[:year_match.start()]
        else:
            raw_title = source
        raw_title = re.sub(r'\[.*?\]|\(.*?\)', '', raw_title)  # remove [..] and (..)
        raw_title = re.sub(r'[._\-]+', ' ', raw_title).strip()
        raw_title = re.sub(r'\s+', ' ', raw_title).strip()
        raw_title = raw_title.rstrip('([-_ ')  # remove any trailing stray punctuation

        # Try DB title+year lookup first (covers YTS and manually added movies)
        db_movie = db.get_movie_by_title(raw_title, year) if raw_title else None

        if db_movie:
            downloads.append({
                'name': filename,
                'title': db_movie.get('title', raw_title),
                'year': db_movie.get('year', year or ''),
                'rating': db_movie.get('rating', 0),
                'medium_cover_image': db_movie.get('medium_cover_image', ''),
                'movie_id': db_movie.get('id'),
                'path': rel_path,
                'size': stat.st_size,
                'size_mb': round(stat.st_size / (1024 * 1024), 2)
            })
        else:
            downloads.append({
                'name': filename,
                'title': raw_title or filename,
                'year': year or '',
                'rating': 0,
                'medium_cover_image': '',
                'movie_id': None,
                'path': rel_path,
                'size': stat.st_size,
                'size_mb': round(stat.st_size / (1024 * 1024), 2)
            })
    return jsonify(downloads)

@app.route('/api/play-local/<path:filepath>')
def play_local_file(filepath):
    file_path = os.path.join('./downloads', filepath)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path, mimetype='video/mp4', conditional=True)

if __name__ == '__main__':
    os.makedirs('./downloads', exist_ok=True)
    app.run(host='0.0.0.0', port=5001, debug=True)
