const movieGrid = document.querySelector('#movie-grid');
const searchInput = document.querySelector('#search');
const genreSelect = document.querySelector('#genre');
const yearSelect = document.querySelector('#year');
const modal = document.querySelector('#modal');
const modalContent = document.querySelector('#modal-content');
const closeBtn = document.querySelector('#close-modal');
const loadMoreBtn = document.querySelector('#load-more');
const API_BASE = 'https://movies-api.accel.li/api/v2';

// Dynamic Backend URL
const BACKEND_URL = (window.location.protocol === 'http:' || window.location.protocol === 'https:') 
    ? `${window.location.protocol}//${window.location.host}` 
    : 'http://localhost:5001';

let searchQuery = '';
let selectedGenre = '';
let selectedYear = '2026';
let currentPage = 1;
let allMovies = [];
let downloadedHashes = new Set();

// Header Scroll Effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (header) {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
  }
});

async function fetchMovies(query = '', genre = '', year = '', page = 1) {
  let url = `${API_BASE}/list_movies.json?limit=50&page=${page}`;
  if (query) url += `&query_term=${query}`;
  if (genre) url += `&genre=${genre}`;
  
  const res = await fetch(url);
  const data = await res.json();
  let movies = data.data?.movies || [];
  
  if (year) {
    movies = movies.filter(m => m.year.toString() === year);
    if (movies.length < 20 && page < 5) {
      const nextPage = await fetchMovies(query, genre, year, page + 1);
      movies = [...movies, ...nextPage.movies];
    }
  }
  return { movies, hasMore: movies.length >= 50 || page < 5 };
}

async function fetchMovieDetails(id) {
  const res = await fetch(`${API_BASE}/movie_details.json?movie_id=${id}&with_cast=true&with_images=true`);
  const data = await res.json();
  return data.data.movie;
}

async function fetchSuggestions(id) {
  const res = await fetch(`${API_BASE}/movie_suggestions.json?movie_id=${id}`);
  const data = await res.json();
  return data.data?.movies || [];
}

function calculateSimilarity(movie, suggestions) {
  if (!suggestions) return [];
  return suggestions.map(s => {
    let score = 0;
    const sharedGenres = movie.genres.filter(g => s.genres.includes(g)).length;
    score += sharedGenres * 20;
    score += Math.max(0, 10 - Math.abs(movie.rating - s.rating)) * 5;
    score += Math.max(0, 10 - Math.abs(movie.year - s.year) / 2);
    return { ...s, similarityScore: Math.round(score) };
  }).sort((a, b) => b.similarityScore - a.similarityScore);
}

function generateMagnetLink(torrent, movieTitle) {
  const trackers = [
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://tracker.torrent.eu.org:451/announce',
    'udp://open.stealth.si:80/announce',
    'udp://open.demonii.com:1337/announce'
  ];
  const encodedTitle = encodeURIComponent(movieTitle);
  const trackerParams = trackers.map(t => `&tr=${encodeURIComponent(t)}`).join('');
  return `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodedTitle}${trackerParams}`;
}

// Autocomplete Logic
let debounceTimer;
const autocompleteContainer = document.getElementById('autocomplete-results');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);
        
        if (query.length < 2) {
            if(autocompleteContainer) autocompleteContainer.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`${API_BASE}/list_movies.json?query_term=${encodeURIComponent(query)}&limit=5`);
                const data = await res.json();
                const movies = data.data?.movies || [];

                if (movies.length > 0 && autocompleteContainer) {
                    autocompleteContainer.innerHTML = movies.map(movie => `
                        <div class="autocomplete-item" onclick="window.location.href='movie.html?id=${movie.id}'">
                            <img src="${movie.small_cover_image}" class="autocomplete-avatar" alt="${movie.title}">
                            <div class="autocomplete-info">
                                <h5>${movie.title}</h5>
                                <span>${movie.year} • ⭐ ${movie.rating}</span>
                            </div>
                        </div>
                    `).join('');
                    autocompleteContainer.style.display = 'block';
                } else if(autocompleteContainer) {
                    autocompleteContainer.style.display = 'none';
                }
            } catch (err) {
                console.error('Search error:', err);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (autocompleteContainer && !searchInput.contains(e.target) && !autocompleteContainer.contains(e.target)) {
            autocompleteContainer.style.display = 'none';
        }
    });
}

async function directPlay(movieId, startTime) {
    try {
        const movie = await fetchMovieDetails(movieId);
        if (movie && movie.torrents && movie.torrents.length > 0) {
            showStreamPlayer(movie, movie.torrents[0], startTime);
        }
    } catch (e) {
        console.error("Direct play failed:", e);
    }
}

async function renderMovieDetailPage(id) {
    const container = document.getElementById('movie-detail-view');
    if (!container) return;
    
    container.innerHTML = '<div class="loader-container"><div class="circular-loader"></div></div>';
    
    try {
        const movie = await fetchMovieDetails(id);
        const suggestions = await fetchSuggestions(id);
        const rankedSuggestions = calculateSimilarity(movie, suggestions);
        
        const statusPromises = movie.torrents.map(t => 
            fetch(`${BACKEND_URL}/api/check-download/${t.hash.toLowerCase()}`).then(r => r.json())
        );
        const statuses = await Promise.all(statusPromises);

        // Fetch persisted DB state for each torrent
        const dbStates = await Promise.all(movie.torrents.map(t =>
            fetch(`${BACKEND_URL}/api/torrent-state/${t.hash.toLowerCase()}`)
                .then(r => r.json()).catch(() => ({ download_state: 'available' }))
        ));
        statuses.forEach((s, i) => { s.db_state = dbStates[i].download_state; });
        
        document.title = `${movie.title} - Ninja Movie Vault`;
        
        const heroBgImg = movie.yt_trailer_code 
            ? `https://img.youtube.com/vi/${movie.yt_trailer_code}/maxresdefault.jpg`
            : (movie.background_image_original || movie.background_image);
            
        container.innerHTML = `
          <section class="hero-banner">
              <div id="trailer-background" class="absolute inset-0 z-0 opacity-0 transition-opacity duration-1000 overflow-hidden">
                  ${movie.yt_trailer_code ? `
                  <div class="video-background-container">
                      <iframe 
                          id="hero-trailer-iframe"
                          src="https://www.youtube-nocookie.com/embed/${movie.yt_trailer_code}?autoplay=0&controls=0&mute=0&loop=1&playlist=${movie.yt_trailer_code}&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=1&modestbranding=1" 
                          frameborder="0" 
                          allow="autoplay; encrypted-media">
                      </iframe>
                  </div>
                  ` : ''}
              </div>

              <div id="hero-image" class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000" style="background-image: url('${heroBgImg}')"></div>
              
              <div class="hero-overlay"></div>
              
              <div class="hero-content">
                  <h2 class="drop-shadow-2xl">${movie.title}</h2>
                  
                  <div class="meta-row">
                      <span class="match-pct">${Math.round(movie.rating * 10)}% Match</span>
                      <span class="year-text">${movie.year}</span>
                      <span class="age-badge">${movie.runtime ? movie.runtime + 'm' : 'HD'}</span>
                  </div>

                  <p class="synopsis line-clamp-3 md:line-clamp-4">${movie.description_full || 'No description available.'}</p>

                  <div class="hero-btns pt-2">
                      <button class="btn-play" id="play-main-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l15 8-15 8V4z"/></svg>
                        Play Now
                      </button>
                      ${movie.yt_trailer_code ? `
                      <button class="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-gray-500/50 hover:bg-gray-500/70 text-white rounded-md font-bold text-base md:text-xl transition-all backdrop-blur-md" id="trailer-btn-trigger">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        Trailer
                      </button>` : ''}
                      <button class="btn-list ml-2" id="watchlist-btn" data-movie-id="${movie.id}">
                        <span class="text-2xl">+</span>
                      </button>
                  </div>
              </div>
          </section>

          <div class="detail-container max-w-[1600px] mx-auto px-4 md:px-12 w-full">
              <div class="detail-main">
                  <div class="info-side w-full mb-8">
                      <!-- Modern Genres UI -->
                      <div class="flex flex-wrap gap-2 mb-6">
                          ${movie.genres.map(g => `<span class="px-4 py-1.5 bg-white/10 text-white/90 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border border-white/10 shadow-lg">${g}</span>`).join('')}
                      </div>
                      
                      <!-- Modern Cast UI -->
                      ${movie.cast ? `
                      <div class="mb-6">
                          <h4 class="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Top Cast</h4>
                          <div class="flex flex-wrap gap-3">
                              ${movie.cast.slice(0, 5).map(c => `
                                  <div class="flex items-center gap-3 bg-white/5 pr-4 rounded-full hover:bg-white/10 transition-all duration-300 border border-white/5 cursor-pointer hover:border-white/20 hover:-translate-y-1">
                                      ${c.url_small_image 
                                          ? `<img src="${c.url_small_image}" class="w-10 h-10 rounded-full object-cover border-2 border-transparent shadow-md">` 
                                          : `<div class="w-10 h-10 rounded-full bg-netflix-red/20 flex items-center justify-center text-netflix-red text-sm border-2 border-transparent shadow-md"><i class="fa fa-user"></i></div>`}
                                      <div class="flex flex-col py-1">
                                          <span class="text-[13px] font-bold text-white/90 leading-tight">${c.name}</span>
                                          ${c.character_name ? `<span class="text-[10px] font-medium text-white/50 leading-tight">${c.character_name}</span>` : ''}
                                      </div>
                                  </div>
                              `).join('')}
                          </div>
                      </div>` : ''}
                      
                      <!-- Modern Language UI -->
                      <div class="mb-2">
                          <h4 class="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Language</h4>
                          <span class="px-2.5 py-1 bg-netflix-red/20 text-netflix-red rounded text-[10px] font-black uppercase tracking-widest border border-netflix-red/30">${movie.language}</span>
                      </div>
                  </div>
                  
                  <div style="margin-top: 2rem;">
                      <h4 class="row-title">Select Quality to Start</h4>
                      <div class="overflow-x-auto">
                          <table class="quality-table">
                              <thead>
                                  <tr>
                                      <th>Quality</th>
                                      <th>Type</th>
                                      <th>Size</th>
                                      <th>Peers</th>
                                      <th>Status</th>
                                      <th>Action</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${movie.torrents.map((t, idx) => {
                                      const status = statuses[idx];
                                      const dbState = status.db_state || 'available';
                                       const isFullyDownloaded = (status.exists && status.progress >= 100) || dbState === 'downloaded';
                                       const isStreaming = dbState === 'streaming' && !isFullyDownloaded;
                                       const isPartial = status.progress > 0 && status.progress < 100 && !isFullyDownloaded;
                                       let btnText, btnStyle, statusLabel;
                                       if (isFullyDownloaded) {
                                           btnText = '\u25b6 Play ' + (status.resolution || t.quality);
                                           btnStyle = 'background: #46d369; color: #000; font-weight: 800;';
                                           statusLabel = '<span style="color: #46d369;">\u2705 Ready Offline</span>';
                                       } else if (isPartial) {
                                           btnText = '\u23e9 Resume';
                                           btnStyle = 'background: #e5a00d; color: #000; font-weight: 800;';
                                           statusLabel = '<span style="color: #e5a00d;">' + (100 - status.progress).toFixed(1) + '% left</span>';
                                       } else if (isStreaming) {
                                           btnText = '\ud83d\udce1 Streaming';
                                           btnStyle = 'background: #2196F3; color: #fff; font-weight: 800;';
                                           statusLabel = '<span style="color: #2196F3;">\ud83d\udd34 Live</span>';
                                       } else {
                                           btnText = '\u25b6 Stream';
                                           btnStyle = '';
                                           statusLabel = '<span style="color: var(--text-muted);">Available</span>';
                                       }
                                       return `
                                       <tr>
                                           <td><span class="quality-tag">${t.quality}</span></td>
                                           <td style="color: var(--text-muted);">${t.type}</td>
                                           <td style="color: var(--text-muted);">${t.size}</td>
                                           <td><span style="color: #46d369;">${t.seeds} seeds</span></td>
                                           <td>${statusLabel}</td>
                                           <td>
                                               <button class="btn-table-play stream-torrent-btn" data-idx="${idx}" style="${btnStyle}">
                                                   ${btnText}
                                               </button>
                                           </td>
                                       </tr>`;
                                   }).join('')}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>

          <div class="row" style="padding: 0 4% 5rem;">
              <h3 class="row-title">Recommended For You</h3>
              <div class="movie-row">
                  ${rankedSuggestions.slice(0, 15).map(s => `
                      <div class="card" onclick="window.location.href='movie.html?id=${s.id}'">
                          <img src="${s.medium_cover_image}" alt="${s.title}">
                          <div class="card-info">
                              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                  <span class="match-pct">${s.rating * 10}% Match</span>
                                  <span style="color: #bcbcbc; font-size: 0.9rem;">${s.year}</span>
                              </div>
                              <h4>${s.title}</h4>
                          </div>
                      </div>
                  `).join('')}
              </div>
          </div>
        `;

        // Watchlist logic
        const watchBtn = document.getElementById('watchlist-btn');
        if (watchBtn) {
            // First check if movie exists in DB
            await fetch(`${BACKEND_URL}/api/movies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movie)
            }).catch(() => {});

            // Check current status
            const res = await fetch(`${BACKEND_URL}/api/watchlist`);
            const data = await res.json();
            const watchlist = Array.isArray(data) ? data : data.watchlist || [];
            if (watchlist.some(item => parseInt(item.movie_id || item.id) === parseInt(movie.id))) {
                watchBtn.classList.add('active');
                watchBtn.innerHTML = '<span class="text-2xl">✓</span>';
            }

            watchBtn.onclick = async () => {
                const isActive = watchBtn.classList.contains('active');
                const method = isActive ? 'DELETE' : 'POST';
                const res = await fetch(`${BACKEND_URL}/api/watchlist/${movie.id}`, { method });
                
                if (res.ok) {
                    watchBtn.classList.toggle('active');
                    watchBtn.innerHTML = isActive ? '<span class="text-2xl">+</span>' : '<span class="text-2xl">✓</span>';
                }
            };
        }

        // Trailer logic
        const trailerBtn = document.getElementById('trailer-btn-trigger');
        if (trailerBtn) {
            trailerBtn.onclick = () => {
                const trailerBg = document.getElementById('trailer-background');
                const heroImg = document.getElementById('hero-image');
                const trailerIframe = document.getElementById('hero-trailer-iframe');
                if (trailerBg && heroImg && trailerIframe) {
                    heroImg.style.opacity = '0';
                    trailerBg.style.opacity = '1';
                    const currentSrc = trailerIframe.src;
                    trailerIframe.src = currentSrc.replace('autoplay=0', 'autoplay=1').replace('mute=1', 'mute=0');
                    trailerBtn.style.display = 'none';
                }
            };
        }

        document.getElementById('play-main-btn').onclick = () => showStreamPlayer(movie, movie.torrents[0]);
        document.querySelectorAll('.stream-torrent-btn').forEach(btn => {
            btn.onclick = () => showStreamPlayer(movie, movie.torrents[btn.dataset.idx]);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div style="padding: 100px; text-align: center;"><h2>Error loading movie.</h2><a href="index.html" style="color: var(--netflix-red);">Return to browsing</a></div>';
    }
}

function showStreamPlayer(movie, torrent, startTime = 0) {
  const magnetLink = generateMagnetLink(torrent, movie.title);
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  
  modal.style.display = 'block';
  modalContent.innerHTML = `
    <div style="background: #000; height: 100vh; position: relative;">
      <button id="close-player" style="position: absolute; top: 40px; left: 40px; background: none; border: none; color: #fff; font-size: 5rem; cursor: pointer; z-index: 10000; line-height:1; text-shadow: 0 0 20px #000;">←</button>
      <button id="fetch-subs-btn" style="position: absolute; top: 40px; right: 40px; background: rgba(0,0,0,0.6); border: 2px solid rgba(255,255,255,0.3); color: #fff; font-size: 1.2rem; cursor: pointer; z-index: 10000; padding: 10px 24px; border-radius: 6px; transition: all 0.3s ease; font-weight: bold; backdrop-filter: blur(5px);">
        <span style="margin-right: 8px;">💬</span> Fetch Subtitles (.srt)
      </button>
      <div id="resolution-badge">Detecting...</div>
      <video id="video-player" controls autoplay style="width: 100%; height: 100%;" crossorigin="anonymous" webkit-playsinline playsinline x-webkit-airplay="allow">
      </video>
      <div id="player-status" style="position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); padding: 30px 50px; border-radius: 12px; color: #fff; z-index: 10001; text-align: center; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px);">
          <div class="stream-loader"></div>
          <p id="player-status-text" style="font-size: 1.5rem; font-weight: 900; margin-bottom: 20px;">Connecting to Peers...</p>
          <div style="width: 400px; height: 8px; background: #333; margin: 15px auto; border-radius: 4px; overflow: hidden;">
              <div id="player-progress-bar" style="width: 0%; height: 100%; background: var(--netflix-red); transition: width 0.3s shadow: 0 0 15px var(--netflix-red);"></div>
          </div>
          <p style="font-size: 1.1rem; color: #aaa; margin-top: 15px;">Experience Cinema Quality Stream</p>
      </div>
    </div>
  `;

  const videoPlayer = document.getElementById('video-player');
  const statusText = document.getElementById('player-status-text');
  const progressBar = document.getElementById('player-progress-bar');
  const statusDiv = document.getElementById('player-status');
  const resBadge = document.getElementById('resolution-badge');

  document.getElementById('close-player').onclick = () => {
    modal.style.display = 'none';
    modalContent.innerHTML = '';
  };

  fetch(`${BACKEND_URL}/api/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ magnet: magnetLink })
  }).then(res => res.json()).then(data => {
    const torrentId = data.torrent_id;
    
    fetch(`${BACKEND_URL}/api/check-download/${torrentId}`).then(r => r.json()).then(st => {
        if (st.resolution) resBadge.textContent = st.resolution;
        else resBadge.textContent = torrent.quality;
    });

    // --- SRT Parser ---
    function parseSRT(srtText) {
        const cues = [];
        const blocks = srtText.trim().replace(/\r\n/g, '\n').split(/\n\n+/);
        const timeRe = /(\d{2}):(\d{2}):(\d{2})[,\.](\d{3}) --> (\d{2}):(\d{2}):(\d{2})[,\.](\d{3})/;
        for (const block of blocks) {
            const lines = block.split('\n');
            const match = lines[1]?.match(timeRe) || lines[0]?.match(timeRe);
            if (!match) continue;
            const toSec = (h, m, s, ms) => +h*3600 + +m*60 + +s + +ms/1000;
            cues.push({
                start: toSec(match[1], match[2], match[3], match[4]),
                end:   toSec(match[5], match[6], match[7], match[8]),
                text:  lines.slice(lines[0].match(/^\d+$/) ? 2 : 1).join('\n')
            });
        }
        return cues;
    }

    // --- JS Subtitle Overlay (Safari bypass) ---
    let _subtitleCues = [];
    let _subtitleOverlay = null;
    let _subtitleListener = null;

    function startJsSubtitleRenderer(srtText) {
        _subtitleCues = parseSRT(srtText);

        // Remove previous overlay if it exists
        if (_subtitleOverlay) _subtitleOverlay.remove();
        if (_subtitleListener) videoPlayer.removeEventListener('timeupdate', _subtitleListener);

        // Create styled overlay div
        _subtitleOverlay = document.createElement('div');
        _subtitleOverlay.id = 'js-subtitle-overlay';
        Object.assign(_subtitleOverlay.style, {
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            color: '#fff',
            fontSize: '1.8rem',
            fontWeight: '700',
            fontFamily: 'Arial, sans-serif',
            textShadow: '0 0 6px #000, 0 2px 4px rgba(0,0,0,0.9)',
            background: 'rgba(0,0,0,0.55)',
            padding: '6px 18px',
            borderRadius: '6px',
            maxWidth: '80%',
            lineHeight: '1.4',
            zIndex: '9999',
            pointerEvents: 'none',
            display: 'none',
            whiteSpace: 'pre-line'
        });
        videoPlayer.parentElement.appendChild(_subtitleOverlay);

        _subtitleListener = () => {
            const t = videoPlayer.currentTime;
            const cue = _subtitleCues.find(c => t >= c.start && t <= c.end);
            if (cue) {
                _subtitleOverlay.textContent = cue.text;
                _subtitleOverlay.style.display = 'block';
            } else {
                _subtitleOverlay.style.display = 'none';
            }
        };
        videoPlayer.addEventListener('timeupdate', _subtitleListener);
    }

    // --- Helper to attach subtitle tracks (JS renderer for all browsers) ---
    function attachSubtitleTracks(subtitles) {
        const sub = subtitles[0];
        if (!sub) return;
        const subUrl = `${BACKEND_URL}/api/subtitle/${torrentId}/${sub.path}?format=srt`;
        // Use JS overlay for ALL browsers — works on Chrome, Safari, and Smart TVs
        fetch(subUrl)
            .then(r => r.text())
            .then(srtText => startJsSubtitleRenderer(srtText))
            .catch(err => console.error('Subtitle fetch failed:', err));
    }

    // Fetch subs manual trigger
    const fetchBtn = document.getElementById('fetch-subs-btn');
    fetchBtn.onclick = () => {
        const originalText = fetchBtn.innerHTML;
        fetchBtn.innerHTML = '<span class="stream-loader" style="width: 20px; height: 20px; border-width: 2px; margin: 0; display: inline-block; vertical-align: middle;"></span> Fetching...';

        fetch(`${BACKEND_URL}/api/subtitles/${torrentId}`).then(r => r.json()).then(subData => {
            if (subData.subtitles && subData.subtitles.length > 0) {
                attachSubtitleTracks(subData.subtitles);
                fetchBtn.innerHTML = '✅ Subtitles Loaded';
                fetchBtn.style.borderColor = '#4CAF50';
                if (!videoPlayer.paused) {
                    videoPlayer.pause();
                    setTimeout(() => videoPlayer.play(), 100);
                }
            } else {
                fetchBtn.innerHTML = '❌ No Subs Found';
                fetchBtn.style.borderColor = '#F44336';
            }
            setTimeout(() => {
                fetchBtn.innerHTML = originalText;
                fetchBtn.style.borderColor = 'rgba(255,255,255,0.3)';
            }, 5000);
        }).catch(() => {
            fetchBtn.innerHTML = '❌ Error';
            setTimeout(() => { fetchBtn.innerHTML = originalText; }, 3000);
        });
    };

    // Load CC initially (transparently in background)
    fetch(`${BACKEND_URL}/api/subtitles/${torrentId}`).then(r => r.json()).then(subData => {
        if (subData.subtitles && subData.subtitles.length > 0) {
            attachSubtitleTracks(subData.subtitles);
            fetchBtn.innerHTML = '✅ Auto Subs Loaded';
            fetchBtn.style.borderColor = '#4CAF50';
            setTimeout(() => {
                fetchBtn.innerHTML = '<span style="margin-right: 8px;">💬</span> Fetch Subtitles (.srt)';
                fetchBtn.style.borderColor = 'rgba(255,255,255,0.3)';
            }, 5000);
        }
    }).catch(() => {});

    // Resume logic with localstorage priority
    const localProgress = localStorage.getItem(`watch_progress_${movie.id}`);
    if (localProgress) {
        startTime = parseFloat(localProgress);
    }

    const checkStatus = setInterval(async () => {
        try {
            const sRes = await fetch(`${BACKEND_URL}/api/status/${torrentId}`);
            const status = await sRes.json();
            progressBar.style.width = status.progress + '%';
            statusText.textContent = status.is_finished ? 'Ready' : `Buffering: ${status.progress.toFixed(1)}%`;

            if (status.progress > 1.5 || status.is_finished) {
                clearInterval(checkStatus);
                statusDiv.style.display = 'none';
                videoPlayer.src = `${BACKEND_URL}/api/video/${torrentId}`;
                videoPlayer.load();
                videoPlayer.onloadedmetadata = () => {
                    // Only resume if we aren't at the very end of the movie (>95%)
                    if (startTime > 0 && startTime < videoPlayer.duration * 0.95) {
                        videoPlayer.currentTime = startTime;
                    }
                    videoPlayer.play().catch(e => console.warn('Autoplay prevented:', e));
                };
                
                setInterval(() => {
                    if (!videoPlayer.paused) {
                        const currentTime = videoPlayer.currentTime;
                        // Avoid saving progress if we're at the very end
                        if (currentTime < videoPlayer.duration * 0.95) {
                            localStorage.setItem(`watch_progress_${movie.id}`, currentTime);
                        } else {
                            localStorage.removeItem(`watch_progress_${movie.id}`);
                        }
                        fetch(`${BACKEND_URL}/api/watch-progress/${movie.id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ current_time: currentTime, duration: videoPlayer.duration })
                        }).catch(() => {});
                    }
                }, 5000);
            }
        } catch (e) {}
    }, 1000);
  });
}

function renderMovies(movies, append = false, watchHistory = [], recommendations = []) {
  if (!append) {
    allMovies = movies;
    movieGrid.innerHTML = '';
  } else {
    allMovies = [...allMovies, ...movies];
  }

  // Row Logic
  const createRow = (title, rowMovies, isSpecial = false) => {
      if (!rowMovies || rowMovies.length === 0) return '';
      const isContinueWatching = title === 'Continue Watching';
      return `
        <div class="row">
            <h2 class="row-title">${title}</h2>
            <div class="movie-row">
                ${rowMovies.map(m => {
                    // use movie_id (watch history) with fallback to id (regular movie objects)
                    const movieId = m.movie_id || m.id;
                    const progressBar = isContinueWatching && m.progress_pct
                        ? `<div style="width:100%; height:3px; background:#333; border-radius:2px; margin-top:6px;">
                               <div style="width:${Math.min(m.progress_pct, 100).toFixed(1)}%; height:100%; background:var(--netflix-red); border-radius:2px;"></div>
                           </div>
                           <span style="font-size:0.75rem; color:#aaa;">${Math.round(m.progress_pct)}% watched</span>`
                        : '';
                    return `
                    <div class="card" onclick="window.location.href='movie.html?id=${movieId}'">
                        <img src="${m.medium_cover_image}">
                        <div class="card-info">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span class="match-pct">${m.rating * 10}% Match</span>
                                <span style="color: #bcbcbc; font-size: 0.9rem;">${m.year}</span>
                            </div>
                            <h4>${m.title}</h4>
                            ${progressBar}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>
      `;
  };

  // Combine categories into Netflix rows
  movieGrid.innerHTML = 
    createRow('Continue Watching', watchHistory) +
    createRow('Recommended For You', recommendations) +
    createRow('New Releases', allMovies.filter(m => m.year >= 2025).slice(0, 15)) +
    createRow('Top Rated', allMovies.filter(m => m.rating >= 8.5).slice(0, 15)) +
    createRow('Trending Now', allMovies.slice(0, 30));
}

async function updateMovies(append = false) {
  const { movies, hasMore } = await fetchMovies(searchQuery, selectedGenre, selectedYear, currentPage);
  
  // Fetch watch history and recommendations for index rows
  let watchHistory = [];
  let recommendations = [];
  try {
      const hRes = await fetch(`${BACKEND_URL}/api/watch-history?session_id=default`);
      watchHistory = await hRes.json();
      
      const rRes = await fetch(`${BACKEND_URL}/api/recommendations`);
      recommendations = await rRes.json();
  } catch (e) { console.log("History or recommendations failed"); }

  renderMovies(movies, append, watchHistory, recommendations);
}

// Global scope
window.renderMovieDetailPage = renderMovieDetailPage;

if (window.location.pathname.endsWith('movie.html')) {
    // Handled by inline script
} else if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '') {
    updateMovies();
}
