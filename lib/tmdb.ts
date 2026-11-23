const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
}

export interface TMDBSearchResponse {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
}

export const tmdbService = {
  searchMovies: async (query: string, page = 1): Promise<TMDBSearchResponse> => {
    if (!TMDB_API_KEY) throw new Error('Missing NEXT_PUBLIC_TMDB_API_KEY in .env.local.');
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`
    );

    if (!response.ok) {
      throw new Error('Failed to search movies');
    }

    return response.json();
  },

  getMovieDetails: async (movieId: number): Promise<TMDBMovieDetails> => {
    if (!TMDB_API_KEY) throw new Error('Missing NEXT_PUBLIC_TMDB_API_KEY in .env.local.');
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }

    return response.json();
  },

  getPosterUrl: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string => {
    if (!path) return '/placeholder-movie.svg';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },

  getBackdropUrl: (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string => {
    if (!path) return '/placeholder-backdrop.svg';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },
};
