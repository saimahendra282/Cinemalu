// TMDB API client - METADATA ONLY
// This client must never be used for streaming URLs

import { getCached, setCached, CACHE_DURATION } from './cache';
import type {
  Movie,
  TVShow,
  MovieDetailsResponse,
  TVDetailsResponse,
  TMDBResponse,
  Genre,
  CreditsResponse,
  Season,
} from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error('TMDB API key is required');
}

class TMDBClient {
  private async fetchFromTMDB(endpoint: string, retries: number = 3): Promise<any> {
    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      } catch (error: any) {
        console.warn(`TMDB API attempt ${attempt} failed:`, error.message);
        
        // If it's the last attempt or not a network error, throw the error
        if (attempt === retries || !error.message.includes('fetch failed')) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  private async fetchWithCache<T>(
    endpoint: string,
    cacheKey: string,
    cacheDuration: number
  ): Promise<T> {
    // Check cache first
    const cached = getCached<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from TMDB
    const data = await this.fetchFromTMDB(endpoint);
    
    // Cache the result
    setCached(cacheKey, data, cacheDuration);
    
    return data;
  }

  // Get trending movies
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<Movie>> {
    return this.fetchWithCache(
      `/trending/movie/${timeWindow}`,
      `trending_movies_${timeWindow}`,
      CACHE_DURATION.TRENDING
    );
  }

  // Get trending TV shows
  async getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TVShow>> {
    return this.fetchWithCache(
      `/trending/tv/${timeWindow}`,
      `trending_tv_${timeWindow}`,
      CACHE_DURATION.TRENDING
    );
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchWithCache(
      `/movie/popular?page=${page}`,
      `popular_movies_${page}`,
      CACHE_DURATION.POPULAR
    );
  }

  // Get popular TV shows
  async getPopularTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.fetchWithCache(
      `/tv/popular?page=${page}`,
      `popular_tv_${page}`,
      CACHE_DURATION.POPULAR
    );
  }

  // Get airing today TV shows
  async getAiringTodayTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.fetchWithCache(
      `/tv/airing_today?page=${page}`,
      `airing_today_tv_${page}`,
      CACHE_DURATION.TRENDING
    );
  }

  // Get on the air TV shows
  async getOnTheAirTVShows(page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.fetchWithCache(
      `/tv/on_the_air?page=${page}`,
      `on_the_air_tv_${page}`,
      CACHE_DURATION.TRENDING
    );
  }

  // Get movie details
  async getMovieDetails(movieId: number): Promise<MovieDetailsResponse> {
    return this.fetchWithCache(
      `/movie/${movieId}`,
      `movie_details_${movieId}`,
      CACHE_DURATION.MOVIE_DETAILS
    );
  }

  // Get TV show details
  async getTVShowDetails(tvId: number): Promise<TVDetailsResponse> {
    return this.fetchWithCache(
      `/tv/${tvId}`,
      `tv_details_${tvId}`,
      CACHE_DURATION.TV_DETAILS
    );
  }

  // Get movie credits
  async getMovieCredits(movieId: number): Promise<CreditsResponse> {
    return this.fetchWithCache(
      `/movie/${movieId}/credits`,
      `movie_credits_${movieId}`,
      CACHE_DURATION.MOVIE_DETAILS
    );
  }

  // Get TV credits
  async getTVCredits(tvId: number): Promise<CreditsResponse> {
    return this.fetchWithCache(
      `/tv/${tvId}/credits`,
      `tv_credits_${tvId}`,
      CACHE_DURATION.TV_DETAILS
    );
  }

  // Get TV season details
  async getSeasonDetails(tvId: number, seasonNumber: number): Promise<Season> {
    return this.fetchWithCache(
      `/tv/${tvId}/season/${seasonNumber}`,
      `season_details_${tvId}_${seasonNumber}`,
      CACHE_DURATION.TV_DETAILS
    );
  }

  // Get genres for movies
  async getMovieGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchWithCache(
      '/genre/movie/list',
      'movie_genres',
      CACHE_DURATION.GENRES
    );
  }

  // Get genres for TV shows
  async getTVGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchWithCache(
      '/genre/tv/list',
      'tv_genres',
      CACHE_DURATION.GENRES
    );
  }

  // Search movies
  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchWithCache(
      `/search/movie?query=${encodedQuery}&page=${page}`,
      `search_movies_${query}_${page}`,
      CACHE_DURATION.SEARCH
    );
  }

  // Search TV shows
  async searchTVShows(query: string, page: number = 1): Promise<TMDBResponse<TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchWithCache(
      `/search/tv?query=${encodedQuery}&page=${page}`,
      `search_tv_${query}_${page}`,
      CACHE_DURATION.SEARCH
    );
  }

  // Multi search (movies + TV)
  async multiSearch(query: string, page: number = 1): Promise<TMDBResponse<Movie | TVShow>> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchWithCache(
      `/search/multi?query=${encodedQuery}&page=${page}`,
      `search_multi_${query}_${page}`,
      CACHE_DURATION.SEARCH
    );
  }

  // Discover movies by genre
  async discoverMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchWithCache(
      `/discover/movie?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
      `discover_movies_genre_${genreId}_${page}`,
      CACHE_DURATION.POPULAR
    );
  }

  // Discover TV shows by genre
  async discoverTVByGenre(genreId: number, page: number = 1): Promise<TMDBResponse<TVShow>> {
    return this.fetchWithCache(
      `/discover/tv?with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
      `discover_tv_genre_${genreId}_${page}`,
      CACHE_DURATION.POPULAR
    );
  }
}

export const tmdbClient = new TMDBClient();