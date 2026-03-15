"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var movieGrid = document.querySelector('#movie-grid');
var searchInput = document.querySelector('#search');
var genreSelect = document.querySelector('#genre');
var yearSelect = document.querySelector('#year');
var modal = document.querySelector('#modal');
var modalContent = document.querySelector('#modal-content');
var closeBtn = document.querySelector('#close-modal');
var loadMoreBtn = document.querySelector('#load-more');
var API_BASE = 'https://movies-api.accel.li/api/v2';

// Dynamic Backend URL
var BACKEND_URL = window.location.protocol === 'http:' || window.location.protocol === 'https:' ? "".concat(window.location.protocol, "//").concat(window.location.host) : 'http://localhost:5001';
var searchQuery = '';
var selectedGenre = '';
var selectedYear = '2026';
var currentPage = 1;
var allMovies = [];
var downloadedHashes = new Set();

// Header Scroll Effect
window.addEventListener('scroll', function () {
  var header = document.querySelector('header');
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});
function fetchMovies() {
  return _fetchMovies.apply(this, arguments);
}
function _fetchMovies() {
  _fetchMovies = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var query,
      genre,
      year,
      page,
      url,
      res,
      data,
      movies,
      nextPage,
      _args3 = arguments;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          query = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : '';
          genre = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : '';
          year = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : '';
          page = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : 1;
          url = "".concat(API_BASE, "/list_movies.json?limit=50&page=").concat(page);
          if (query) url += "&query_term=".concat(query);
          if (genre) url += "&genre=".concat(genre);
          _context3.n = 1;
          return fetch(url);
        case 1:
          res = _context3.v;
          _context3.n = 2;
          return res.json();
        case 2:
          data = _context3.v;
          movies = data.data && data.data.movies ? data.data.movies : [];
          if (!year) {
            _context3.n = 4;
            break;
          }
          movies = movies.filter(function (m) {
            return m.year.toString() === year;
          });
          if (!(movies.length < 20 && page < 5)) {
            _context3.n = 4;
            break;
          }
          _context3.n = 3;
          return fetchMovies(query, genre, year, page + 1);
        case 3:
          nextPage = _context3.v;
          movies = [].concat(_toConsumableArray(movies), _toConsumableArray(nextPage.movies));
        case 4:
          return _context3.a(2, {
            movies: movies,
            hasMore: movies.length >= 50 || page < 5
          });
      }
    }, _callee3);
  }));
  return _fetchMovies.apply(this, arguments);
}
function fetchMovieDetails(_x) {
  return _fetchMovieDetails.apply(this, arguments);
}
function _fetchMovieDetails() {
  _fetchMovieDetails = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(id) {
    var res, data;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.n = 1;
          return fetch("".concat(API_BASE, "/movie_details.json?movie_id=").concat(id, "&with_cast=true&with_images=true"));
        case 1:
          res = _context4.v;
          _context4.n = 2;
          return res.json();
        case 2:
          data = _context4.v;
          return _context4.a(2, data.data.movie);
      }
    }, _callee4);
  }));
  return _fetchMovieDetails.apply(this, arguments);
}
function fetchSuggestions(_x2) {
  return _fetchSuggestions.apply(this, arguments);
}
function _fetchSuggestions() {
  _fetchSuggestions = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(id) {
    var res, data;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          _context5.n = 1;
          return fetch("".concat(API_BASE, "/movie_suggestions.json?movie_id=").concat(id));
        case 1:
          res = _context5.v;
          _context5.n = 2;
          return res.json();
        case 2:
          data = _context5.v;
          return _context5.a(2, data.data && data.data.movies ? data.data.movies : []);
      }
    }, _callee5);
  }));
  return _fetchSuggestions.apply(this, arguments);
}
function calculateSimilarity(movie, suggestions) {
  if (!suggestions) return [];
  return suggestions.map(function (s) {
    var score = 0;
    var sharedGenres = movie.genres.filter(function (g) {
      return s.genres.includes(g);
    }).length;
    score += sharedGenres * 20;
    score += Math.max(0, 10 - Math.abs(movie.rating - s.rating)) * 5;
    score += Math.max(0, 10 - Math.abs(movie.year - s.year) / 2);
    return _objectSpread(_objectSpread({}, s), {}, {
      similarityScore: Math.round(score)
    });
  }).sort(function (a, b) {
    return b.similarityScore - a.similarityScore;
  });
}
function generateMagnetLink(torrent, movieTitle) {
  var trackers = ['udp://tracker.opentrackr.org:1337/announce', 'udp://tracker.torrent.eu.org:451/announce', 'udp://open.stealth.si:80/announce', 'udp://open.demonii.com:1337/announce'];
  var encodedTitle = encodeURIComponent(movieTitle);
  var trackerParams = trackers.map(function (t) {
    return "&tr=".concat(encodeURIComponent(t));
  }).join('');
  return "magnet:?xt=urn:btih:".concat(torrent.hash, "&dn=").concat(encodedTitle).concat(trackerParams);
}

// Autocomplete Logic
var debounceTimer;
var autocompleteContainer = document.getElementById('search-results-container');
if (searchInput) {
  searchInput.addEventListener('input', function (e) {
    var query = e.target.value.trim();
    clearTimeout(debounceTimer);
    if (query.length < 2) {
      if (autocompleteContainer) autocompleteContainer.style.opacity = '0';
      return;
    }
    debounceTimer = setTimeout(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var res, data, movies, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            _context.p = 0;
            _context.n = 1;
            return fetch("".concat(API_BASE, "/list_movies.json?query_term=").concat(encodeURIComponent(query), "&limit=5"));
          case 1:
            res = _context.v;
            _context.n = 2;
            return res.json();
          case 2:
            data = _context.v;
            movies = data.data && data.data.movies ? data.data.movies : [];
            var autocompleteContainer = document.getElementById('search-results-container');
            if (movies.length > 0 && autocompleteContainer) {
              var topMatch = movies[0];
              var otherResults = movies.slice(1);
              var html = "\n                        <div class=\"search-top-match\">\n                            <div class=\"flex-1\">\n                                <span class=\"search-section-title\">Top Match</span>\n                                <div class=\"top-match-card\" onclick=\"window.location.href='movie.html?id=".concat(topMatch.id, "'\">\n                                    <img src=\"").concat(topMatch.background_image || topMatch.large_cover_image, "\" alt=\"").concat(topMatch.title, "\">\n                                    <span class=\"badge\">98% Match</span>\n                                    <div class=\"info\">\n                                        <h3 class=\"text-xl md:text-2xl font-black text-white mb-2\">").concat(topMatch.title, "</h3>\n                                        <div class=\"flex items-center gap-4 text-sm font-bold text-white/60\">\n                                            <span>").concat(topMatch.year, "</span>\n                                            <span class=\"px-1.5 py-0.5 border border-white/20 rounded text-[10px] uppercase\">HD</span>\n                                            <span class=\"text-green-500\">").concat(topMatch.rating, " Rating</span>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                        \n                        <span class=\"search-section-title\">Titles related to \"").concat(query, "\"</span>\n                        <div class=\"search-grid\">\n                            ").concat(otherResults.map(function (movie) {
                return "\n                                <div class=\"search-card group\" onclick=\"window.location.href='movie.html?id=".concat(movie.id, "'\">\n                                    <div class=\"search-card-poster\">\n                                        <img src=\"").concat(movie.medium_cover_image, "\" alt=\"").concat(movie.title, "\">\n                                    </div>\n                                    <div class=\"search-card-info\">\n                                        <h4>").concat(movie.title, "</h4>\n                                        <span>").concat(movie.year, " \u2022 \u2605 ").concat(movie.rating, "</span>\n                                    </div>\n                                </div>\n                            ");
              }).join(''), "\n                        </div>\n                    ");
              autocompleteContainer.innerHTML = html;
              autocompleteContainer.style.display = 'block';
              autocompleteContainer.style.opacity = '1';
            } else if (autocompleteContainer) {
              autocompleteContainer.style.opacity = '0';
            }
            _context.n = 4;
            break;
          case 3:
            _context.p = 3;
            _t = _context.v;
            console.error('Search error:', _t);
          case 4:
            return _context.a(2);
        }
      }, _callee, null, [[0, 3]]);
    })), 300);
  });
  document.addEventListener('click', function (e) {
    if (autocompleteContainer && !searchInput.contains(e.target) && !autocompleteContainer.contains(e.target)) {
      autocompleteContainer.style.display = 'none';
    }
  });
}
function directPlay(_x3, _x4) {
  return _directPlay.apply(this, arguments);
}
function _directPlay() {
  _directPlay = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(movieId, startTime) {
    var movie, _t3;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          _context6.p = 0;
          _context6.n = 1;
          return fetchMovieDetails(movieId);
        case 1:
          movie = _context6.v;
          if (movie && movie.torrents && movie.torrents.length > 0) {
            showStreamPlayer(movie, movie.torrents[0], startTime);
          }
          _context6.n = 3;
          break;
        case 2:
          _context6.p = 2;
          _t3 = _context6.v;
          console.error("Direct play failed:", _t3);
        case 3:
          return _context6.a(2);
      }
    }, _callee6, null, [[0, 2]]);
  }));
  return _directPlay.apply(this, arguments);
}
function renderMovieDetailPage(_x5) {
  return _renderMovieDetailPage.apply(this, arguments);
}
function _renderMovieDetailPage() {
  _renderMovieDetailPage = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(id) {
    var container, movie, suggestions, rankedSuggestions, statusPromises, statuses, dbStates, heroBgImg, watchBtn, res, data, watchlist, trailerBtn, _t4;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.p = _context8.n) {
        case 0:
          container = document.getElementById('movie-detail-view');
          if (container) {
            _context8.n = 1;
            break;
          }
          return _context8.a(2);
        case 1:
          container.innerHTML = '<div class="loader-container"><div class="circular-loader"></div></div>';
          _context8.p = 2;
          _context8.n = 3;
          return fetchMovieDetails(id);
        case 3:
          movie = _context8.v;
          _context8.n = 4;
          return fetchSuggestions(id);
        case 4:
          suggestions = _context8.v;
          rankedSuggestions = calculateSimilarity(movie, suggestions);
          statusPromises = movie.torrents.map(function (t) {
            return fetch("".concat(BACKEND_URL, "/api/check-download/").concat(t.hash.toLowerCase())).then(function (r) {
              return r.json();
            });
          });
          _context8.n = 5;
          return Promise.all(statusPromises);
        case 5:
          statuses = _context8.v;
          _context8.n = 6;
          return Promise.all(movie.torrents.map(function (t) {
            return fetch("".concat(BACKEND_URL, "/api/torrent-state/").concat(t.hash.toLowerCase())).then(function (r) {
              return r.json();
            })["catch"](function () {
              return {
                download_state: 'available'
              };
            });
          }));
        case 6:
          dbStates = _context8.v;
          statuses.forEach(function (s, i) {
            s.db_state = dbStates[i].download_state;
          });
          document.title = "".concat(movie.title, " - Ninja Movie Vault");
          heroBgImg = movie.yt_trailer_code ? "https://img.youtube.com/vi/".concat(movie.yt_trailer_code, "/hqdefault.jpg") : movie.background_image_original || movie.background_image;
          container.innerHTML = "\n          <section class=\"hero-banner\">\n              <div id=\"trailer-background\" class=\"absolute inset-0 z-0 opacity-0 transition-opacity duration-1000 overflow-hidden\">\n                  ".concat(movie.yt_trailer_code ? "\n                  <div class=\"video-background-container\">\n                      <iframe \n                          id=\"hero-trailer-iframe\"\n                          src=\"\" \n                          frameborder=\"0\" \n                          allow=\"autoplay; encrypted-media\">\n                      </iframe>\n                  </div>\n                  " : '', "\n              </div>\n\n              <div id=\"hero-image\" class=\"absolute inset-0 bg-cover bg-center transition-opacity duration-1000\" style=\"background-image: url('").concat(heroBgImg, "')\"></div>\n              \n              <div class=\"hero-overlay\"></div>\n              \n              <div class=\"hero-content\">\n                  <h2 class=\"drop-shadow-2xl\">").concat(movie.title, "</h2>\n                  \n                  <div class=\"meta-row\">\n                      <span class=\"match-pct\">").concat(Math.round(movie.rating * 10), "% Match</span>\n                      <span class=\"year-text\">").concat(movie.year, "</span>\n                      <span class=\"age-badge\">").concat(movie.runtime ? movie.runtime + 'm' : 'HD', "</span>\n                  </div>\n\n                  <p class=\"synopsis line-clamp-3 md:line-clamp-4\">").concat(movie.description_full || 'No description available.', "</p>\n\n                  <div class=\"hero-btns pt-2\">\n                      <button class=\"btn-play\" id=\"play-main-btn\">\n                        <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M6 4l15 8-15 8V4z\"/></svg>\n                        Play Now\n                      </button>\n                      ").concat(movie.yt_trailer_code ? "\n                      <button class=\"flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-gray-500/50 hover:bg-gray-500/70 text-white rounded-md font-bold text-base md:text-xl transition-all backdrop-blur-md\" id=\"trailer-btn-trigger\">\n                        <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"5 3 19 12 5 21 5 3\"></polygon></svg>\n                        Trailer\n                      </button>" : '', "\n                      <button class=\"btn-list ml-2\" id=\"watchlist-btn\" data-movie-id=\"").concat(movie.id, "\">\n                        <span class=\"text-2xl\">+</span>\n                      </button>\n                  </div>\n              </div>\n          </section>\n\n          <div class=\"detail-container max-w-[1600px] mx-auto px-4 md:px-12 w-full\">\n              <div class=\"detail-main\">\n                  <div class=\"info-side w-full mb-8\">\n                      <!-- Modern Genres UI -->\n                      <div class=\"flex flex-wrap gap-2 mb-6\">\n                          ").concat(movie.genres.map(function (g) {
            return "<span onclick=\"window.location.href='index.html?genre=".concat(encodeURIComponent(g), "'\" class=\"px-4 py-1.5 bg-white/10 text-white/90 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border border-white/10 shadow-lg cursor-pointer hover:bg-white/20 hover:border-white/30 transition-all duration-200\">".concat(g, "</span>"));
          }).join(''), "\n                      </div>\n                      \n                      <!-- Modern Cast UI -->\n                      ").concat(movie.cast ? "\n                      <div class=\"mb-6\">\n                          <h4 class=\"text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3\">Top Cast</h4>\n                          <div class=\"flex flex-wrap gap-3\">\n                              ".concat(movie.cast.slice(0, 5).map(function (c) {
            var castHref = 'index.html?cast=' + encodeURIComponent(c.name);
            return "\n                                  <div onclick=\"window.location.href='".concat(castHref, "'\" class=\"flex items-center gap-3 bg-white/5 pr-4 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/5 cursor-pointer hover:border-netflix-red/50 hover:-translate-y-1 hover:shadow-lg\">\n                                      ").concat(c.url_small_image ? "<img src=\"".concat(c.url_small_image, "\" class=\"w-10 h-10 rounded-full object-cover border-2 border-transparent shadow-md\">") : "<div class=\"w-10 h-10 rounded-full bg-netflix-red/20 flex items-center justify-center text-netflix-red text-sm border-2 border-transparent shadow-md\"><i class=\"fa fa-user\"></i></div>", "\n                                      <div class=\"flex flex-col py-1\">\n                                          <span class=\"text-[13px] font-bold text-white/90 leading-tight\">").concat(c.name, "</span>\n                                          ").concat(c.character_name ? "<span class=\"text-[10px] font-medium text-white/50 leading-tight\">".concat(c.character_name, "</span>") : '', "\n                                      </div>\n                                  </div>\n                              ");
          }).join(''), "\n                          </div>\n                      </div>") : '', "\n                      \n                      <!-- Modern Language UI -->\n                      <div class=\"mb-2\">\n                          <h4 class=\"text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2\">Language</h4>\n                          <span class=\"px-2.5 py-1 bg-netflix-red/20 text-netflix-red rounded text-[10px] font-black uppercase tracking-widest border border-netflix-red/30\">").concat(movie.language, "</span>\n                      </div>\n                  </div>\n                  \n                  <div style=\"margin-top: 2rem;\">\n                      <h4 class=\"row-title\">Select Quality to Start</h4>\n                      <div class=\"overflow-x-auto\">\n                          <table class=\"quality-table\">\n                              <thead>\n                                  <tr>\n                                      <th>Quality</th>\n                                      <th>Type</th>\n                                      <th>Size</th>\n                                      <th>Peers</th>\n                                      <th>Status</th>\n                                      <th>Action</th>\n                                  </tr>\n                              </thead>\n                              <tbody>\n                                  ").concat(movie.torrents.map(function (t, idx) {
            var status = statuses[idx];
            var dbState = status.db_state || 'available';
            var isFullyDownloaded = status.exists && status.progress >= 100 || dbState === 'downloaded';
            var isStreaming = dbState === 'streaming' && !isFullyDownloaded;
            var isPartial = status.progress > 0 && status.progress < 100 && !isFullyDownloaded;
            var btnText, btnStyle, statusLabel;
            if (isFullyDownloaded) {
              btnText = "\u25B6 Play " + (status.resolution || t.quality);
              btnStyle = 'background: #46d369; color: #000; font-weight: 800;';
              statusLabel = "<span style=\"color: #46d369;\">\u2705 Ready Offline</span>";
            } else if (isPartial) {
              btnText = "\u23E9 Resume";
              btnStyle = 'background: #e5a00d; color: #000; font-weight: 800;';
              statusLabel = '<span style="color: #e5a00d;">' + (100 - status.progress).toFixed(1) + '% left</span>';
            } else if (isStreaming) {
              btnText = "\uD83D\uDCE1 Streaming";
              btnStyle = 'background: #2196F3; color: #fff; font-weight: 800;';
              statusLabel = "<span style=\"color: #2196F3;\">\uD83D\uDD34 Live</span>";
            } else {
              btnText = "\u25B6 Stream";
              btnStyle = '';
              statusLabel = '<span style="color: var(--text-muted);">Available</span>';
            }
            return "\n                                       <tr>\n                                           <td><span class=\"quality-tag\">".concat(t.quality, "</span></td>\n                                           <td style=\"color: var(--text-muted);\">").concat(t.type, "</td>\n                                           <td style=\"color: var(--text-muted);\">").concat(t.size, "</td>\n                                           <td><span style=\"color: #46d369;\">").concat(t.seeds, " seeds</span></td>\n                                           <td>").concat(statusLabel, "</td>\n                                           <td>\n                                               <button class=\"btn-table-play stream-torrent-btn\" data-idx=\"").concat(idx, "\" style=\"").concat(btnStyle, "\">\n                                                   ").concat(btnText, "\n                                               </button>\n                                           </td>\n                                       </tr>");
          }).join(''), "\n                              </tbody>\n                          </table>\n                      </div>\n                  </div>\n              </div>\n          </div>\n\n          <div class=\"row\" style=\"padding: 0 4% 5rem;\">\n              <h3 class=\"row-title\">Recommended For You</h3>\n              <div class=\"movie-row\">\n                  ").concat(rankedSuggestions.slice(0, 15).map(function (s) {
            return "\n                      <div class=\"card\" onclick=\"window.location.href='movie.html?id=".concat(s.id, "'\">\n                          <img src=\"").concat(s.medium_cover_image, "\" alt=\"").concat(s.title, "\">\n                          <div class=\"card-info\">\n                              <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;\">\n                                  <span class=\"match-pct\">").concat(s.rating * 10, "% Match</span>\n                                  <span style=\"color: #bcbcbc; font-size: 0.9rem;\">").concat(s.year, "</span>\n                              </div>\n                              <h4>").concat(s.title, "</h4>\n                          </div>\n                      </div>\n                  ");
          }).join(''), "\n              </div>\n          </div>\n        ");

          // Watchlist logic
          watchBtn = document.getElementById('watchlist-btn');
          if (!watchBtn) {
            _context8.n = 10;
            break;
          }
          _context8.n = 7;
          return fetch("".concat(BACKEND_URL, "/api/movies"), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(movie)
          })["catch"](function () {});
        case 7:
          _context8.n = 8;
          return fetch("".concat(BACKEND_URL, "/api/watchlist"));
        case 8:
          res = _context8.v;
          _context8.n = 9;
          return res.json();
        case 9:
          data = _context8.v;
          watchlist = Array.isArray(data) ? data : data.watchlist || [];
          if (watchlist.some(function (item) {
            return parseInt(item.movie_id || item.id) === parseInt(movie.id);
          })) {
            watchBtn.classList.add('active');
            watchBtn.innerHTML = '<span class="text-2xl">✓</span>';
          }
          watchBtn.onclick = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
            var isActive, method, res;
            return _regenerator().w(function (_context7) {
              while (1) switch (_context7.n) {
                case 0:
                  isActive = watchBtn.classList.contains('active');
                  method = isActive ? 'DELETE' : 'POST';
                  _context7.n = 1;
                  return fetch("".concat(BACKEND_URL, "/api/watchlist/").concat(movie.id), {
                    method: method
                  });
                case 1:
                  res = _context7.v;
                  if (res.ok) {
                    watchBtn.classList.toggle('active');
                    watchBtn.innerHTML = isActive ? '<span class="text-2xl">+</span>' : '<span class="text-2xl">✓</span>';
                  }
                case 2:
                  return _context7.a(2);
              }
            }, _callee7);
          }));
        case 10:
          // Trailer logic
          trailerBtn = document.getElementById('trailer-btn-trigger');
          if (trailerBtn) {
            trailerBtn.onclick = function () {
              var trailerBg = document.getElementById('trailer-background');
              var heroImg = document.getElementById('hero-image');
              var trailerIframe = document.getElementById('hero-trailer-iframe');
              if (trailerBg && heroImg && trailerIframe) {
                heroImg.style.opacity = '0';
                trailerBg.style.opacity = '1';
                trailerIframe.src = "https://www.youtube-nocookie.com/embed/".concat(movie.yt_trailer_code, "?autoplay=1&controls=0&mute=0&loop=1&playlist=").concat(movie.yt_trailer_code, "&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=1");
                trailerBtn.style.display = 'none';
              }
            };
          }
          document.getElementById('play-main-btn').onclick = function () {
            return showStreamPlayer(movie, movie.torrents[0]);
          };
          document.querySelectorAll('.stream-torrent-btn').forEach(function (btn) {
            btn.onclick = function () {
              return showStreamPlayer(movie, movie.torrents[btn.dataset.idx]);
            };
          });
          _context8.n = 12;
          break;
        case 11:
          _context8.p = 11;
          _t4 = _context8.v;
          console.error(_t4);
          container.innerHTML = '<div style="padding: 100px; text-align: center;"><h2>Error loading movie.</h2><a href="index.html" style="color: var(--color-netflix-red);">Return to browsing</a></div>';
        case 12:
          return _context8.a(2);
      }
    }, _callee8, null, [[2, 11]]);
  }));
  return _renderMovieDetailPage.apply(this, arguments);
}
function showStreamPlayer(movie, torrent) {
  var startTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var magnetLink = generateMagnetLink(torrent, movie.title);
  var modal = document.getElementById('modal');
  var modalContent = document.getElementById('modal-content');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modalContent.innerHTML = "\n    <div style=\"background: #000; height: 100vh; position: relative;\">\n      <button id=\"close-player\" style=\"position: absolute; top: 40px; left: 40px; background: none; border: none; color: #fff; font-size: 5rem; cursor: pointer; z-index: 10000; line-height:1; text-shadow: 0 0 20px #000;\">\u2190</button>\n      <button id=\"fetch-subs-btn\" style=\"position: absolute; top: 40px; right: 40px; background: rgba(0,0,0,0.6); border: 2px solid rgba(255,255,255,0.3); color: #fff; font-size: 1.2rem; cursor: pointer; z-index: 10000; padding: 10px 24px; border-radius: 6px; transition: all 0.3s ease; font-weight: bold;\">\n        <span style=\"margin-right: 8px;\">\uD83D\uDCAC</span> Fetch Subtitles (.srt)\n      </button>\n      <div id=\"resolution-badge\">Detecting...</div>\n      <video id=\"video-player\" controls autoplay style=\"width: 100%; height: 100%;\" crossorigin=\"anonymous\" webkit-playsinline playsinline x-webkit-airplay=\"allow\">\n      </video>\n      <div id=\"player-status\" style=\"position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.9); padding: 30px 50px; border-radius: 12px; color: #fff; z-index: 10001; text-align: center; border: 1px solid rgba(255,255,255,0.1);\">\n          <div class=\"stream-loader\"></div>\n          <p id=\"player-status-text\" style=\"font-size: 1.5rem; font-weight: 900; margin-bottom: 20px;\">Connecting to Peers...</p>\n          <div style=\"width: 400px; height: 8px; background: #333; margin: 15px auto; border-radius: 4px; overflow: hidden;\">\n              <div id=\"player-progress-bar\" style=\"width: 0%; height: 100%; background: var(--netflix-red); transition: width 0.3s shadow: 0 0 15px var(--netflix-red);\"></div>\n          </div>\n          <p style=\"font-size: 1.1rem; color: #aaa; margin-top: 15px;\">Experience Cinema Quality Stream</p>\n      </div>\n    </div>\n  ";
  var videoPlayer = document.getElementById('video-player');
  var statusText = document.getElementById('player-status-text');
  var progressBar = document.getElementById('player-progress-bar');
  var statusDiv = document.getElementById('player-status');
  var resBadge = document.getElementById('resolution-badge');
  document.getElementById('close-player').onclick = function () {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modalContent.innerHTML = '';
  };
  fetch("".concat(BACKEND_URL, "/api/stream"), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      magnet: magnetLink
    })
  }).then(function (res) {
    return res.json();
  }).then(function (data) {
    var torrentId = data.torrent_id;
    fetch("".concat(BACKEND_URL, "/api/check-download/").concat(torrentId)).then(function (r) {
      return r.json();
    }).then(function (st) {
      if (st.resolution) resBadge.textContent = st.resolution;else resBadge.textContent = torrent.quality;
    });

    // --- Helper to attach subtitle tracks (Native for Fullscreen Support) ---
    function attachSubtitleTracks(subtitles) {
      var sub = subtitles[0];
      if (!sub) return;

      // Use VTT format for native HTML5 track support
      var subUrl = "".concat(BACKEND_URL, "/api/subtitle/").concat(torrentId, "/").concat(sub.path, ".vtt");

      // Remove existing tracks to prevent duplicates
      Array.from(videoPlayer.getElementsByTagName('track')).forEach(function (t) {
        return t.remove();
      });
      var track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = sub.language || 'English';
      track.srclang = 'en';
      track.src = subUrl;
      track["default"] = true;
      videoPlayer.appendChild(track);

      // Force the text track to show (required for Safari/WebOS sometimes)
      setTimeout(function () {
        if (videoPlayer.textTracks && videoPlayer.textTracks.length > 0) {
          videoPlayer.textTracks[0].mode = 'showing';
        }
      }, 500);
    }

    // --- AirPlay: set HLS as primary source so Apple TV gets embedded subtitle tracks ---
    // Safari natively plays .m3u8; Chrome/Firefox fall back to direct MP4.
    var hlsUrl = ''.concat(BACKEND_URL, '/api/hls/').concat(torrentId, '/master.m3u8');
    var directUrl = ''.concat(BACKEND_URL, '/api/video/').concat(torrentId);
    var preferHls = videoPlayer.canPlayType('application/vnd.apple.mpegurl') !== '';
    var primarySrc = preferHls ? hlsUrl : directUrl;

    // Fetch subs manual trigger
    var fetchBtn = document.getElementById('fetch-subs-btn');
    fetchBtn.onclick = function () {
      var originalText = fetchBtn.innerHTML;
      fetchBtn.innerHTML = '<span class="stream-loader" style="width: 20px; height: 20px; border-width: 2px; margin: 0; display: inline-block; vertical-align: middle;"></span> Fetching...';
      fetch("".concat(BACKEND_URL, "/api/subtitles/").concat(torrentId)).then(function (r) {
        return r.json();
      }).then(function (subData) {
        if (subData.subtitles && subData.subtitles.length > 0) {
          attachSubtitleTracks(subData.subtitles);
          fetchBtn.innerHTML = '✅ Subtitles Loaded';
          fetchBtn.style.borderColor = '#4CAF50';
          if (!videoPlayer.paused) {
            videoPlayer.pause();
            setTimeout(function () {
              return videoPlayer.play();
            }, 100);
          }
        } else {
          fetchBtn.innerHTML = '❌ No Subs Found';
          fetchBtn.style.borderColor = '#F44336';
        }
        setTimeout(function () {
          fetchBtn.innerHTML = originalText;
          fetchBtn.style.borderColor = 'rgba(255,255,255,0.3)';
        }, 5000);
      })["catch"](function () {
        fetchBtn.innerHTML = '❌ Error';
        setTimeout(function () {
          fetchBtn.innerHTML = originalText;
        }, 3000);
      });
    };

    // Load CC initially (transparently in background)
    fetch("".concat(BACKEND_URL, "/api/subtitles/").concat(torrentId)).then(function (r) {
      return r.json();
    }).then(function (subData) {
      if (subData.subtitles && subData.subtitles.length > 0) {
        attachSubtitleTracks(subData.subtitles);
        fetchBtn.innerHTML = '✅ Auto Subs Loaded';
        fetchBtn.style.borderColor = '#4CAF50';
        setTimeout(function () {
          fetchBtn.innerHTML = '<span style="margin-right: 8px;">💬</span> Fetch Subtitles (.srt)';
          fetchBtn.style.borderColor = 'rgba(255,255,255,0.3)';
        }, 5000);
      }
    })["catch"](function () {});

    // Resume logic with localstorage priority
    var localProgress = localStorage.getItem("watch_progress_".concat(movie.id));
    if (localProgress) {
      startTime = parseFloat(localProgress);
    }
    var checkStatus = setInterval(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var sRes, status, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            _context2.p = 0;
            _context2.n = 1;
            return fetch("".concat(BACKEND_URL, "/api/status/").concat(torrentId));
          case 1:
            sRes = _context2.v;
            _context2.n = 2;
            return sRes.json();
          case 2:
            status = _context2.v;
            progressBar.style.width = status.progress + '%';
            statusText.textContent = status.is_finished ? 'Ready' : "Buffering: ".concat(status.progress.toFixed(1), "%");
            if (status.progress > 1.5 || status.is_finished) {
              clearInterval(checkStatus);
              statusDiv.style.display = 'none';
              videoPlayer.src = primarySrc;
              videoPlayer.load();
              videoPlayer.onloadedmetadata = function () {
                // Only resume if we aren't at the very end of the movie (>95%)
                if (startTime > 0 && startTime < videoPlayer.duration * 0.95) {
                  videoPlayer.currentTime = startTime;
                }
                videoPlayer.play()["catch"](function (e) {
                  return console.warn('Autoplay prevented:', e);
                });
              };
              setInterval(function () {
                if (!videoPlayer.paused) {
                  var currentTime = videoPlayer.currentTime;
                  // Avoid saving progress if we're at the very end
                  if (currentTime < videoPlayer.duration * 0.95) {
                    localStorage.setItem("watch_progress_".concat(movie.id), currentTime);
                  } else {
                    localStorage.removeItem("watch_progress_".concat(movie.id));
                  }
                  fetch("".concat(BACKEND_URL, "/api/watch-progress/").concat(movie.id), {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      current_time: currentTime,
                      duration: videoPlayer.duration
                    })
                  })["catch"](function () {});
                }
              }, 5000);
            }
            _context2.n = 4;
            break;
          case 3:
            _context2.p = 3;
            _t2 = _context2.v;
          case 4:
            return _context2.a(2);
        }
      }, _callee2, null, [[0, 3]]);
    })), 1000);
  });
}
function renderMovies(movies) {
  var append = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var watchHistory = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var recommendations = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  if (!append) {
    allMovies = movies;
    movieGrid.innerHTML = '';
  } else {
    allMovies = [].concat(_toConsumableArray(allMovies), _toConsumableArray(movies));
  }

  // Row Logic
  var createRow = function createRow(title, rowMovies) {
    var isSpecial = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (!rowMovies || rowMovies.length === 0) return '';
    var isContinueWatching = title === 'Continue Watching';
    return "\n        <div class=\"row\">\n            <h2 class=\"row-title\">".concat(title, "</h2>\n            <div class=\"movie-row\">\n                ").concat(rowMovies.map(function (m) {
      // use movie_id (watch history) with fallback to id (regular movie objects)
      var movieId = m.movie_id || m.id;
      var progressBar = isContinueWatching && m.progress_pct ? "<div style=\"width:100%; height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:10px; overflow:hidden;\">\n                               <div style=\"width:".concat(Math.min(m.progress_pct, 100).toFixed(1), "%; height:100%; background:var(--color-netflix-red); box-shadow: 0 0 10px var(--color-netflix-red);\"></div>\n                           </div>\n                           <div style=\"display:flex; justify-content:space-between; margin-top:4px;\">\n                               <span style=\"font-size:0.7rem; font-weight:700; color:rgba(255,255,255,0.5);\">").concat(Math.round(m.progress_pct), "% watched</span>\n                           </div>") : '';
      return "\n                    <div class=\"card\" onclick=\"window.location.href='movie.html?id=".concat(movieId, "'\">\n                        <img src=\"").concat(m.medium_cover_image, "\">\n                        <div class=\"card-info\">\n                            <div style=\"display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;\">\n                                <span class=\"match-pct\">").concat(m.rating * 10, "% Match</span>\n                                <span style=\"color: #bcbcbc; font-size: 0.9rem;\">").concat(m.year, "</span>\n                            </div>\n                            <h4>").concat(m.title, "</h4>\n                            ").concat(progressBar, "\n                        </div>\n                    </div>");
    }).join(''), "\n            </div>\n        </div>\n      ");
  };

  // Combine categories into Netflix rows
  movieGrid.innerHTML = createRow('Continue Watching', watchHistory) + createRow('Recommended For You', recommendations) + createRow('New Releases', allMovies.filter(function (m) {
    return m.year >= 2025;
  }).slice(0, 15)) + createRow('Top Rated', allMovies.filter(function (m) {
    return m.rating >= 8.5;
  }).slice(0, 15)) + createRow('Trending Now', allMovies.slice(0, 30));
}
function updateMovies() {
  return _updateMovies.apply(this, arguments);
} // Global scope
function _updateMovies() {
  _updateMovies = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
    var append,
      _yield$fetchMovies,
      movies,
      hasMore,
      watchHistory,
      recommendations,
      hRes,
      rRes,
      _args9 = arguments,
      _t5;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.p = _context9.n) {
        case 0:
          append = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : false;
          _context9.n = 1;
          return fetchMovies(searchQuery, selectedGenre, selectedYear, currentPage);
        case 1:
          _yield$fetchMovies = _context9.v;
          movies = _yield$fetchMovies.movies;
          hasMore = _yield$fetchMovies.hasMore;
          // Fetch watch history and recommendations for index rows
          watchHistory = [];
          recommendations = [];
          _context9.p = 2;
          _context9.n = 3;
          return fetch("".concat(BACKEND_URL, "/api/watch-history?session_id=default"));
        case 3:
          hRes = _context9.v;
          _context9.n = 4;
          return hRes.json();
        case 4:
          watchHistory = _context9.v;
          _context9.n = 5;
          return fetch("".concat(BACKEND_URL, "/api/recommendations"));
        case 5:
          rRes = _context9.v;
          _context9.n = 6;
          return rRes.json();
        case 6:
          recommendations = _context9.v;
          _context9.n = 8;
          break;
        case 7:
          _context9.p = 7;
          _t5 = _context9.v;
          console.log("History or recommendations failed");
        case 8:
          renderMovies(movies, append, watchHistory, recommendations);
        case 9:
          return _context9.a(2);
      }
    }, _callee9, null, [[2, 7]]);
  }));
  return _updateMovies.apply(this, arguments);
}
window.renderMovieDetailPage = renderMovieDetailPage;
if (window.location.pathname.endsWith('movie.html')) {
  // Handled by inline script
} else if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '') {
  var urlParams = new URLSearchParams(window.location.search);
  var browseGenre = urlParams.get('genre');
  var browseCast = urlParams.get('cast');

  if (browseGenre) {
    if (movieGrid) {
      movieGrid.innerHTML = '<div style="padding: 100px 4% 40px; width:100%;">' +
        '<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;" onclick="window.location.href=\'index.html\'">← Back to Home</p>' +
        '<h2 style="font-size:2.5rem;font-weight:900;margin-bottom:8px;">All <span style="color:var(--color-netflix-red);">' + browseGenre + '</span> Movies</h2>' +
        '</div><div style="padding:0 4%;width:100%;display:flex;flex-wrap:wrap;gap:16px;" id="browse-grid"></div>';
    }
    fetch(''.concat(BACKEND_URL, '/api/movies-by-genre?genre=').concat(encodeURIComponent(browseGenre)))
      .then(function(r) { return r.json(); }).then(function(data) {
        var grid = document.getElementById('browse-grid');
        if (!grid) return;
        var movies = data.movies || [];
        if (movies.length === 0) { grid.innerHTML = '<p style="color:var(--text-muted);padding:40px;">No movies found for \"' + browseGenre + '\".</p>'; return; }
        grid.innerHTML = movies.map(function(m) {
          var badge = m.is_local ? '<span style="position:absolute;top:10px;right:10px;background:var(--color-netflix-red);color:white;font-size:0.65rem;padding:2px 6px;border-radius:4px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.5);">IN VAULT</span>' : '';
          return '<div class="card" onclick="window.location.href=\'movie.html?id=' + m.id + '\'">' +
            '<img src="' + m.medium_cover_image + '" alt="' + m.title + '">' +
            '<div class="card-info"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">' +
            '<span class="match-pct">' + (m.rating*10).toFixed(0) + '% Match</span>' +
            '<span style="color:#bcbcbc;font-size:0.9rem;">' + m.year + '</span></div>' +
            '<h4>' + m.title + '</h4>' + badge + '</div></div>';
        }).join('');
      }).catch(function() { var g = document.getElementById('browse-grid'); if (g) g.innerHTML = '<p style="color:var(--text-muted);padding:40px;">Server offline.</p>'; });

  } else if (browseCast) {
    if (movieGrid) {
      movieGrid.innerHTML = '<div style="padding: 100px 4% 40px; width:100%;">' +
        '<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;" onclick="window.location.href=\'index.html\'">← Back to Home</p>' +
        '<h2 style="font-size:2.5rem;font-weight:900;margin-bottom:8px;">Movies with <span style="color:var(--color-netflix-red);">' + browseCast + '</span></h2>' +
        '</div><div style="padding:0 4%;width:100%;display:flex;flex-wrap:wrap;gap:16px;" id="browse-grid"></div>';
    }
    fetch(''.concat(BACKEND_URL, '/api/movies-by-cast?name=').concat(encodeURIComponent(browseCast)))
      .then(function(r) { return r.json(); }).then(function(data) {
        var grid = document.getElementById('browse-grid');
        if (!grid) return;
        var movies = data.movies || [];
        if (movies.length === 0) { grid.innerHTML = '<p style="color:var(--text-muted);padding:40px;">No movies found for \"' + browseCast + '\".</p>'; return; }
        grid.innerHTML = movies.map(function(m) {
          var badge = m.is_local ? '<span style="position:absolute;top:10px;right:10px;background:var(--color-netflix-red);color:white;font-size:0.65rem;padding:2px 6px;border-radius:4px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.5);">IN VAULT</span>' : '';
          return '<div class="card" onclick="window.location.href=\'movie.html?id=' + m.id + '\'">' +
            '<img src="' + m.medium_cover_image + '" alt="' + m.title + '">' +
            '<div class="card-info"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">' +
            '<span class="match-pct">' + (m.rating*10).toFixed(0) + '% Match</span>' +
            '<span style="color:#bcbcbc;font-size:0.9rem;">' + m.year + '</span></div>' +
            '<h4>' + m.title + '</h4>' + badge + '</div></div>';
        }).join('');
      }).catch(function() { var g = document.getElementById('browse-grid'); if (g) g.innerHTML = '<p style="color:var(--text-muted);padding:40px;">Server offline.</p>'; });

  } else {
    updateMovies();
  }
}
