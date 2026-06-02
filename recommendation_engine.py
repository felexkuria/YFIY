"""
Netflix-Style Recommendation Engine for Ninja Movie Vault

Implements a hybrid content-based + collaborative scoring system inspired by
Netflix's recommendation approach. Signals used:

1. Genre Affinity - Weighted genre preferences from watch history & watchlist
2. Rating Profile - Matches movies to user's preferred rating range
3. Temporal Decay - Recent activity weighs more than old activity
4. Completion Signal - Fully watched movies = stronger preference signal
5. Popularity Boost - High-seed torrents indicate community popularity
6. Diversity Injection - Avoids genre monotony by mixing in exploration picks
7. Similar Movie Graph - Leverages YTS suggestions as a content similarity graph
"""

import json
import math
import random
import urllib.request
import time
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from urllib.parse import quote_plus


class RecommendationEngine:
    """Generates personalized recommendations using user behavior signals."""

    # How much each signal contributes to final score (tunable weights)
    WEIGHTS = {
        'genre_match': 35,       # Genre affinity is the strongest signal
        'rating_fit': 20,        # How well the rating matches user preference
        'recency': 10,           # Newer movies get a slight boost
        'popularity': 10,        # Community popularity (seeds/peers)
        'similarity_graph': 15,  # YTS content-based similarity
        'diversity_bonus': 10,   # Bonus for underrepresented genres
    }

    YTS_API = 'https://movies-api.accel.li/api/v2'

    def __init__(self, db):
        self.db = db

    def generate_recommendations(self, session_id='default', limit=60):
        """
        Main entry point. Builds a user profile from their activity,
        scores candidate movies, and returns ranked recommendations.
        """
        profile = self._build_user_profile(session_id)

        if not profile['genre_weights']:
            # No activity yet — return trending/top-rated as cold-start
            return self._cold_start_recommendations(limit)

        # Gather candidate movies from multiple sources
        candidates = self._gather_candidates(profile, session_id)

        # Score and rank
        scored = self._score_candidates(candidates, profile)

        # Diversity pass — ensure genre variety
        final = self._diversify(scored, limit)

        return final

    def _build_user_profile(self, session_id):
        """
        Analyze user's watchlist and watch history to build a preference profile.
        Returns genre weights, preferred rating range, favorite decades, etc.
        """
        genre_counter = Counter()
        ratings = []
        years = []
        watched_ids = set()
        watchlist_ids = set()

        with self.db.get_connection() as conn:
            # Watchlist movies (explicit interest signal)
            watchlist_rows = conn.execute('''
                SELECT m.id, m.genres, m.rating, m.year
                FROM watchlist w JOIN movies m ON w.movie_id = m.id
                WHERE w.user_session = ?
            ''', (session_id,)).fetchall()

            for row in watchlist_rows:
                watchlist_ids.add(row['id'])
                genres = json.loads(row['genres'] or '[]')
                # Watchlist = moderate signal (1.0x weight per genre)
                for g in genres:
                    genre_counter[g] += 1.0
                if row['rating']:
                    ratings.append(row['rating'])
                if row['year']:
                    years.append(row['year'])

            # Watch history (behavioral signal — stronger than watchlist)
            history_rows = conn.execute('''
                SELECT m.id, m.genres, m.rating, m.year,
                       wh.progress_pct, wh.completed, wh.last_watched
                FROM watch_history wh JOIN movies m ON wh.movie_id = m.id
                WHERE wh.user_session = ?
                ORDER BY wh.last_watched DESC
            ''', (session_id,)).fetchall()

            for row in history_rows:
                watched_ids.add(row['id'])
                genres = json.loads(row['genres'] or '[]')
                progress = row['progress_pct'] or 0

                # Weight by engagement: completed = 2.5x, >50% = 1.5x, started = 0.5x
                if row['completed']:
                    weight = 2.5
                elif progress > 50:
                    weight = 1.5
                elif progress > 10:
                    weight = 0.8
                else:
                    weight = 0.3

                # Temporal decay: recent watches matter more
                try:
                    last_watched = datetime.fromisoformat(row['last_watched'])
                    days_ago = (datetime.now() - last_watched).days
                    decay = max(0.3, 1.0 - (days_ago / 90))  # Decays over 90 days
                except:
                    decay = 0.5

                for g in genres:
                    genre_counter[g] += weight * decay

                if row['rating']:
                    ratings.append(row['rating'])
                if row['year']:
                    years.append(row['year'])

        # Normalize genre weights to percentages
        total_genre_weight = sum(genre_counter.values()) or 1
        genre_weights = {g: w / total_genre_weight for g, w in genre_counter.most_common(15)}

        # Rating preference (mean ± std)
        avg_rating = sum(ratings) / len(ratings) if ratings else 7.0
        rating_std = (sum((r - avg_rating) ** 2 for r in ratings) / len(ratings)) ** 0.5 if len(ratings) > 1 else 1.5

        # Year preference
        avg_year = sum(years) / len(years) if years else 2020

        return {
            'genre_weights': genre_weights,
            'avg_rating': avg_rating,
            'rating_std': max(rating_std, 0.5),
            'avg_year': avg_year,
            'watched_ids': watched_ids,
            'watchlist_ids': watchlist_ids,
            'exclude_ids': watched_ids | watchlist_ids,
            'top_genres': [g for g, _ in genre_counter.most_common(5)],
        }

    def _gather_candidates(self, profile, session_id):
        """
        Collect candidate movies from multiple sources:
        1. YTS suggestions for watchlist/history movies (content graph)
        2. YTS API search by top genres
        3. Local DB movies not yet interacted with
        """
        candidates = {}  # id -> movie_data
        exclude = profile['exclude_ids']

        # Source 1: YTS suggestions for user's movies (similarity graph)
        source_ids = list(profile['watchlist_ids'] | profile['watched_ids'])
        # Limit API calls — sample up to 8 source movies
        sample_sources = random.sample(source_ids, min(8, len(source_ids)))

        for movie_id in sample_sources:
            suggestions = self._fetch_yts_suggestions(movie_id)
            for movie in suggestions:
                if movie['id'] not in exclude and movie['id'] not in candidates:
                    movie['_source'] = 'similarity'
                    candidates[movie['id']] = movie

        # Source 2: YTS search by top genres (discovery)
        for genre in profile['top_genres'][:3]:
            genre_movies = self._fetch_yts_by_genre(genre, limit=20)
            for movie in genre_movies:
                if movie['id'] not in exclude and movie['id'] not in candidates:
                    movie['_source'] = 'genre_search'
                    candidates[movie['id']] = movie

        # Source 3: Local DB movies not interacted with
        with self.db.get_connection() as conn:
            local_rows = conn.execute('''
                SELECT id, title, year, rating, cover_image as medium_cover_image,
                       background_image, description, yt_trailer_code, genres, local_poster_path
                FROM movies
                WHERE id NOT IN (SELECT movie_id FROM watchlist WHERE user_session = ?)
                AND id NOT IN (SELECT movie_id FROM watch_history WHERE user_session = ?)
                ORDER BY rating DESC
                LIMIT 100
            ''', (session_id, session_id)).fetchall()

            for row in local_rows:
                d = dict(row)
                if d['id'] not in candidates:
                    try:
                        d['genres'] = json.loads(d.get('genres') or '[]')
                    except:
                        d['genres'] = []
                    d['_source'] = 'local_db'
                    candidates[d['id']] = d

        return candidates

    def _score_candidates(self, candidates, profile):
        """Score each candidate movie against the user profile."""
        scored = []
        genre_weights = profile['genre_weights']
        avg_rating = profile['avg_rating']
        rating_std = profile['rating_std']
        avg_year = profile['avg_year']

        for movie_id, movie in candidates.items():
            score = 0.0
            genres = movie.get('genres', [])
            rating = movie.get('rating', 0) or 0
            year = movie.get('year', 2020) or 2020

            # 1. Genre Match Score (0-35)
            genre_score = 0
            if genres and genre_weights:
                matched_weight = sum(genre_weights.get(g, 0) for g in genres)
                # Normalize by number of genres to not penalize single-genre movies
                genre_score = min(matched_weight / (len(genres) * 0.15 + 0.01), 1.0)
            score += genre_score * self.WEIGHTS['genre_match']

            # 2. Rating Fit Score (0-20) — Gaussian distance from user's preferred rating
            if rating > 0:
                distance = abs(rating - avg_rating)
                # Bell curve: closer = higher score
                rating_score = math.exp(-(distance ** 2) / (2 * rating_std ** 2))
                # Bonus for high-rated movies (everyone likes quality)
                if rating >= 8.0:
                    rating_score = min(rating_score + 0.2, 1.0)
            else:
                rating_score = 0.3
            score += rating_score * self.WEIGHTS['rating_fit']

            # 3. Recency Score (0-10) — Newer movies get a boost
            current_year = datetime.now().year
            years_old = max(0, current_year - year)
            recency_score = max(0, 1.0 - (years_old / 30))  # Linear decay over 30 years
            score += recency_score * self.WEIGHTS['recency']

            # 4. Popularity Score (0-10)
            seeds = 0
            if 'torrents' in movie:
                seeds = max((t.get('seeds', 0) for t in movie['torrents']), default=0)
            popularity_score = min(seeds / 100, 1.0) if seeds > 0 else 0.3
            score += popularity_score * self.WEIGHTS['popularity']

            # 5. Similarity Graph Bonus (0-15)
            if movie.get('_source') == 'similarity':
                score += 0.8 * self.WEIGHTS['similarity_graph']
            elif movie.get('_source') == 'local_db':
                score += 0.4 * self.WEIGHTS['similarity_graph']
            else:
                score += 0.2 * self.WEIGHTS['similarity_graph']

            # 6. Diversity bonus computed in next pass

            movie['_score'] = round(score, 2)
            movie['_match_pct'] = min(98, max(55, int(score)))
            scored.append(movie)

        # Sort by score descending
        scored.sort(key=lambda m: m['_score'], reverse=True)
        return scored

    def _diversify(self, scored_movies, limit):
        """
        Netflix-style diversity: don't show 20 Action movies in a row.
        Ensures each genre appears proportionally with some exploration.
        """
        if not scored_movies:
            return []

        result = []
        genre_count = Counter()
        max_per_genre = max(3, limit // 5)  # No genre > 20% of results

        for movie in scored_movies:
            genres = movie.get('genres', [])
            dominant_genre = genres[0] if genres else 'Unknown'

            # Allow if genre isn't overrepresented
            if genre_count[dominant_genre] < max_per_genre:
                result.append(movie)
                genre_count[dominant_genre] += 1

                if len(result) >= limit:
                    break

        # If we didn't fill the limit, add remaining regardless of diversity
        if len(result) < limit:
            remaining = [m for m in scored_movies if m not in result]
            result.extend(remaining[:limit - len(result)])

        # Add diversity bonus to underrepresented genres
        all_genres_in_result = Counter()
        for m in result:
            for g in m.get('genres', []):
                all_genres_in_result[g] += 1

        if all_genres_in_result:
            avg_count = sum(all_genres_in_result.values()) / len(all_genres_in_result)
            for m in result:
                genres = m.get('genres', [])
                for g in genres:
                    if all_genres_in_result[g] < avg_count * 0.5:
                        m['_score'] += self.WEIGHTS['diversity_bonus'] * 0.5
                        m['_match_pct'] = min(98, m['_match_pct'] + 3)

        # Final sort by adjusted score
        result.sort(key=lambda m: m['_score'], reverse=True)
        return result[:limit]

    def _cold_start_recommendations(self, limit):
        """For new users with no activity — return trending high-rated movies."""
        movies = self._fetch_yts_by_genre('', limit=limit)
        # Sort by rating
        movies.sort(key=lambda m: m.get('rating', 0), reverse=True)
        for m in movies:
            m['_match_pct'] = max(60, int((m.get('rating', 5) / 10) * 100))
            m['_score'] = m.get('rating', 5) * 10
        return movies[:limit]

    def _fetch_yts_suggestions(self, movie_id):
        """Fetch similar movies from YTS content graph."""
        cache_key = f'yts_suggestions_{movie_id}'
        cached = self.db.get_cache(cache_key)
        if cached:
            return cached

        try:
            url = f'{self.YTS_API}/movie_suggestions.json?movie_id={movie_id}'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as response:
                data = json.loads(response.read().decode())
                movies = data.get('data', {}).get('movies') or []
                self.db.set_cache(cache_key, movies, ttl_hours=48)
                return movies
        except Exception as e:
            print(f'[!] YTS suggestions fetch error for {movie_id}: {e}')
            return []

    def _fetch_yts_by_genre(self, genre, limit=20):
        """Fetch movies by genre from YTS API."""
        cache_key = f'yts_genre_{genre}_{limit}'
        cached = self.db.get_cache(cache_key)
        if cached:
            return cached

        try:
            params = f'limit={limit}&sort_by=rating&order_by=desc&minimum_rating=5'
            if genre:
                params += f'&genre={quote_plus(genre)}'
            url = f'{self.YTS_API}/list_movies.json?{params}'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as response:
                data = json.loads(response.read().decode())
                movies = data.get('data', {}).get('movies') or []
                self.db.set_cache(cache_key, movies, ttl_hours=12)
                return movies
        except Exception as e:
            print(f'[!] YTS genre fetch error for {genre}: {e}')
            return []

    def refresh_recommendations(self, session_id='default'):
        """
        Regenerate recommendations and persist them to the database.
        Called whenever user activity changes (watchlist add, watch progress).
        """
        print(f'[*] Regenerating recommendations for session: {session_id}')
        start = time.time()

        recommendations = self.generate_recommendations(session_id, limit=60)

        # Clear old recommendations for this session
        with self.db.get_connection() as conn:
            conn.execute('DELETE FROM recommendations WHERE user_session = ?', (session_id,))

        # Save new recommendations
        for movie in recommendations:
            # Save movie to DB if not already there
            self.db._process_movie_db_entry(movie)

            # Use a synthetic source_movie_id of 0 for algorithm-generated recs
            with self.db.get_connection() as conn:
                conn.execute('''
                    INSERT OR IGNORE INTO recommendations 
                    (source_movie_id, recommended_movie_id, user_session)
                    VALUES (?, ?, ?)
                ''', (0, movie['id'], session_id))

        elapsed = time.time() - start
        print(f'[✓] Generated {len(recommendations)} recommendations in {elapsed:.1f}s')
        return recommendations
