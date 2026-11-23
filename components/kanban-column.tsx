'use client';

import { Movie, MovieStatus } from '@/lib/supabase';
import { MovieCard } from './movie-card';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumnProps {
  title: string;
  status: MovieStatus;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  onDragStart: (movie: Movie) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (status: MovieStatus) => void;
}

export function KanbanColumn({
  title,
  status,
  movies,
  onMovieClick,
  onDragStart,
  onDragOver,
  onDrop,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="font-semibold text-lg flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {movies.length}
          </span>
        </h2>
      </div>
      <Card
        className="flex-1 p-4 bg-muted/20"
        onDragOver={onDragOver}
        onDrop={() => onDrop(status)}
      >
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-3 pr-4">
            {movies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No movies yet
              </div>
            ) : (
              movies.map((movie) => (
                <div
                  key={movie.id}
                  draggable
                  onDragStart={() => onDragStart(movie)}
                  className="cursor-move"
                >
                  <MovieCard movie={movie} onClick={() => onMovieClick(movie)} />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
