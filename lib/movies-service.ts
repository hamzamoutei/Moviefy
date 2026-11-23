import { supabase, Movie, CreateMovieInput, MovieStatus } from './supabase';

export const moviesService = {
  async getMovies(userId: string): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addMovie(userId: string, movie: CreateMovieInput): Promise<Movie> {
    const maxPosition = await this.getMaxPosition(userId, movie.status);

    const { data, error } = await supabase
      .from('movies')
      .insert({
        ...movie,
        user_id: userId,
        position: maxPosition + 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMovieStatus(
    movieId: string,
    newStatus: MovieStatus,
    newPosition: number
  ): Promise<Movie> {
    const { data, error } = await supabase
      .from('movies')
      .update({
        status: newStatus,
        position: newPosition,
        updated_at: new Date().toISOString(),
      })
      .eq('id', movieId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async reorderMovies(
    userId: string,
    status: MovieStatus,
    movieIds: string[]
  ): Promise<void> {
    const updates = movieIds.map((id, index) => ({
      id,
      position: index,
      updated_at: new Date().toISOString(),
    }));

    for (const update of updates) {
      await supabase
        .from('movies')
        .update({ position: update.position, updated_at: update.updated_at })
        .eq('id', update.id)
        .eq('user_id', userId);
    }
  },

  async deleteMovie(movieId: string): Promise<void> {
    const { error } = await supabase.from('movies').delete().eq('id', movieId);

    if (error) throw error;
  },

  async getMaxPosition(userId: string, status: MovieStatus): Promise<number> {
    const { data, error } = await supabase
      .from('movies')
      .select('position')
      .eq('user_id', userId)
      .eq('status', status)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.position ?? -1;
  },

  async checkMovieExists(userId: string, tmdbId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('movies')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};
