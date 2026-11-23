'use client';

import { Movie } from '@/lib/supabase';
import { tmdbService } from '@/lib/tmdb';
import { Calendar, Star, Clock } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';
  const posterUrl = tmdbService.getPosterUrl(movie.poster_path, 'w342');

  return (
    <div
      className="relative h-64 bg-muted rounded-lg overflow-hidden cursor-pointer group transition-all hover:shadow-lg hover:scale-105"
      style={{
        backgroundImage: `url(${posterUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-semibold text-sm text-white line-clamp-2 mb-2 leading-tight">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-200">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{releaseYear}</span>
          </div>
          {movie.runtime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{movie.runtime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
