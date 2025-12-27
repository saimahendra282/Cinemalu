// TypeScript interfaces for TMDB data structures

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
  status?: string;
  tagline?: string;
  production_companies?: ProductionCompany[];
  cast?: CastMember[];
  crew?: CrewMember[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  status?: string;
  tagline?: string;
  seasons?: Season[];
  episode_run_time?: number[];
  production_companies?: ProductionCompany[];
  cast?: CastMember[];
  crew?: CrewMember[];
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  runtime?: number;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
}

export interface CastMember extends Person {
  character: string;
  credit_id: string;
  order: number;
}

export interface CrewMember extends Person {
  job: string;
  department: string;
  credit_id: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// API Response types
export interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface MovieDetailsResponse extends Movie {
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
  budget: number;
  revenue: number;
  imdb_id?: string;
  homepage?: string;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
}

export interface TVDetailsResponse extends TVShow {
  created_by: Person[];
  in_production: boolean;
  networks: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  origin_country: string[];
  original_language: string;
  original_name: string;
}

export interface CreditsResponse {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface SearchResponse {
  results: (Movie | TVShow)[];
  page: number;
  total_pages: number;
  total_results: number;
}

// Watch Progress types
export interface WatchProgress {
  contentId: string;
  contentType: 'movie' | 'tv';
  progress: number; // Percentage (0-100)
  season?: number;
  episode?: number;
  lastWatched: number; // Timestamp
}

export interface ContinueWatchingItem extends WatchProgress {
  title?: string;
  poster_path?: string;
  backdrop_path?: string;
}

// Streaming provider types (VidLink-specific)
export interface StreamingSource {
  url: string;
  embedUrl: string;
  provider: 'vidlink';
  quality?: string;
}