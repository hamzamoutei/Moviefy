'use client';

import { useState, useEffect } from 'react';
import { Movie, MovieStatus } from '@/lib/supabase';
import { moviesService } from '@/lib/movies-service';
import { KanbanColumn } from './kanban-column';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  userId: string;
  movies: Movie[];
  onMoviesChange: () => void;
  onMovieClick: (movie: Movie) => void;
}

const COLUMNS: { title: string; status: MovieStatus }[] = [
  { title: 'To Watch', status: 'to_watch' },
  { title: 'Watching', status: 'watching' },
  { title: 'Waiting for Next Season', status: 'waiting' },
  { title: 'Watched', status: 'watched' },
];

export function KanbanBoard({
  userId,
  movies,
  onMoviesChange,
  onMovieClick,
}: KanbanBoardProps) {
  const [draggedMovie, setDraggedMovie] = useState<Movie | null>(null);
  const { toast } = useToast();

  const getMoviesByStatus = (status: MovieStatus): Movie[] => {
    return movies
      .filter((movie) => movie.status === status)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragStart = (movie: Movie) => {
    setDraggedMovie(movie);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: MovieStatus) => {
    if (!draggedMovie) return;

    if (draggedMovie.status === newStatus) {
      setDraggedMovie(null);
      return;
    }

    try {
      const moviesInNewStatus = getMoviesByStatus(newStatus);
      const newPosition = moviesInNewStatus.length;

      await moviesService.updateMovieStatus(
        draggedMovie.id,
        newStatus,
        newPosition
      );

      onMoviesChange();

      toast({
        title: 'Movie moved',
        description: `"${draggedMovie.title}" moved to ${COLUMNS.find((c) => c.status === newStatus)?.title}`,
      });
    } catch (error) {
      console.error('Error moving movie:', error);
      toast({
        title: 'Error',
        description: 'Failed to move movie',
        variant: 'destructive',
      });
    } finally {
      setDraggedMovie(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          movies={getMoviesByStatus(column.status)}
          onMovieClick={onMovieClick}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
