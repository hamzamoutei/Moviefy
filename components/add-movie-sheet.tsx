'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { tmdbService, TMDBMovie } from '@/lib/tmdb';
import { moviesService } from '@/lib/movies-service';
import { Search, Loader2, Calendar, Star, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddMovieSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onMovieAdded: () => void;
}

export function AddMovieSheet({
  open,
  onOpenChange,
  userId,
  onMovieAdded,
}: AddMovieSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingMovieId, setAddingMovieId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await tmdbService.searchMovies(searchQuery);
      setSearchResults(response.results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Could not search for movies. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMovie = async (tmdbMovie: TMDBMovie) => {
    setAddingMovieId(tmdbMovie.id);

    try {
      const exists = await moviesService.checkMovieExists(userId, tmdbMovie.id);
      if (exists) {
        toast({
          title: 'Movie already added',
          description: 'This movie is already in your collection.',
          variant: 'destructive',
        });
        setAddingMovieId(null);
        return;
      }

      const details = await tmdbService.getMovieDetails(tmdbMovie.id);

      await moviesService.addMovie(userId, {
        tmdb_id: details.id,
        title: details.title,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        release_date: details.release_date || '',
        overview: details.overview || '',
        vote_average: details.vote_average || 0,
        genres: details.genres || [],
        runtime: details.runtime || null,
        status: 'to_watch',
      });

      toast({
        title: 'Movie added',
        description: `"${details.title}" has been added to your board.`,
      });

      onMovieAdded();
      setSearchQuery('');
      setSearchResults([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding movie:', error);
      toast({
        title: 'Error',
        description: 'Failed to add movie. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingMovieId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Add Movie</SheetTitle>
          <SheetDescription>
            Search for a movie to add to your collection
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-3 pr-4">
              {searchResults.map((movie) => {
                const releaseYear = movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : 'N/A';
                const posterUrl = tmdbService.getPosterUrl(
                  movie.poster_path,
                  'w185'
                );

                return (
                  <div
                    key={movie.id}
                    className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{releaseYear}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {movie.overview}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddMovie(movie)}
                      disabled={addingMovieId === movie.id}
                    >
                      {addingMovieId === movie.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
