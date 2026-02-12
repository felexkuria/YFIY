const movieGrid = document.querySelector('#movie-grid');
const searchInput = document.querySelector('#search');
const genreSelect = document.querySelector('#genre');
const yearInput = document.querySelector('#year');
const modal = document.querySelector('#modal');
const modalContent = document.querySelector('#modal-content');
const closeBtn = document.querySelector('#close-modal');
const API_BASE = 'https://movies-api.accel.li/api/v2';

let searchQuery = '';
let selectedGenre = '';
let selectedYear = '';
let allMovies = [];

async function fetchMovies(query = '', genre = '', year = '') {
  let url = `${API_BASE}/list_movies.json?limit=50`;
  if (query) url += `&query_term=${query}`;
  if (genre) url += `&genre=${genre}`;
  
  const res = await fetch(url);
  const data = await res.json();
  let movies = data.data?.movies || [];
  
  if (year) {
    movies = movies.filter(m => m.year.toString() === year);
  }
  
  return movies;
}

async function fetchMovieDetails(id) {
  const res = await fetch(`${API_BASE}/movie_details.json?movie_id=${id}&with_cast=true`);
  const data = await res.json();
  return data.data.movie;
}

function getStats(movies) {
  const avgRating = (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1);
  const topRated = movies.filter(m => m.rating >= 8).length;
  const years = movies.map(m => m.year);
  const avgYear = Math.round(years.reduce((a, b) => a + b, 0) / years.length);
  return { avgRating, topRated, avgYear, total: movies.length };
}

function renderMovies(movies) {
  allMovies = movies;
  
  if (!movies.length) {
    movieGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 3rem;">No movies found</p>';
    return;
  }
  
  const stats = getStats(movies);
  const statsHTML = `
    <div class="stats">
      <div><span>${stats.total}</span> Movies</div>
      <div><span>${stats.avgRating}</span> Avg Rating</div>
      <div><span>${stats.topRated}</span> Top Rated (8+)</div>
      <div><span>${stats.avgYear}</span> Avg Year</div>
    </div>
  `;
  
  movieGrid.innerHTML = statsHTML + movies.map(movie => `
    <div class="card" data-id="${movie.id}">
      <img src="${movie.medium_cover_image}" alt="${movie.title}">
      <div class="info">
        <h3>${movie.title}</h3>
        <p class="rating">⭐ ${movie.rating}</p>
        <div class="genres">
          ${movie.genres.map(g => `<span>${g}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => showMovieDetails(card.dataset.id));
  });
}

async function showMovieDetails(id) {
  modal.style.display = 'flex';
  modalContent.innerHTML = '<p style="text-align: center; color: #666;">Loading...</p>';
  
  const movie = await fetchMovieDetails(id);
  
  modalContent.innerHTML = `
    <img src="${movie.large_cover_image}" alt="${movie.title}">
    <div class="details">
      <h2>${movie.title} (${movie.year})</h2>
      <div class="meta">
        <span class="rating-big">⭐ ${movie.rating}/10</span>
        <span>${movie.runtime} min</span>
        <span>${movie.language.toUpperCase()}</span>
      </div>
      <div class="genres">
        ${movie.genres.map(g => `<span>${g}</span>`).join('')}
      </div>
      <p class="synopsis">${movie.description_full || 'No description available.'}</p>
      ${movie.cast ? `
        <div class="cast">
          <h4>Cast</h4>
          ${movie.cast.slice(0, 5).map(c => `<span>${c.name}</span>`).join('')}
        </div>
      ` : ''}
      <div class="torrents">
        <h4>Downloads</h4>
        ${movie.torrents.map(t => `
          <div class="torrent">
            <span>${t.quality} ${t.type}</span>
            <span>${t.size}</span>
            <span>Seeds: ${t.seeds}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

closeBtn.addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

async function updateMovies() {
  const movies = await fetchMovies(searchQuery, selectedGenre, selectedYear);
  renderMovies(movies);
}

let debounceTimer;
searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  searchQuery = e.target.value.trim();
  debounceTimer = setTimeout(updateMovies, 500);
});

genreSelect.addEventListener('change', (e) => {
  selectedGenre = e.target.value;
  updateMovies();
});

yearInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  selectedYear = e.target.value.trim();
  debounceTimer = setTimeout(updateMovies, 500);
});

updateMovies();
