'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Movie } from '@/lib/supabase';
import { tmdbService } from '@/lib/tmdb';
import { moviesService } from '@/lib/movies-service';
import { Calendar, Clock, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MovieDetailsDialogProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMovieDeleted: () => void;
}

export function MovieDetailsDialog({
  movie,
  open,
  onOpenChange,
  onMovieDeleted,
}: MovieDetailsDialogProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  if (!movie) return null;

  const backdropUrl = tmdbService.getBackdropUrl(movie.backdrop_path);
  const posterUrl = tmdbService.getPosterUrl(movie.poster_path, 'w500');
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'N/A';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await moviesService.deleteMovie(movie.id);
      toast({
        title: 'Movie deleted',
        description: `"${movie.title}" has been removed from your collection.`,
      });
      setShowDeleteAlert(false);
      onOpenChange(false);
      onMovieDeleted();
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete movie. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative w-full h-64 bg-muted">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="px-6 pb-6 -mt-20 relative">
            <div className="flex gap-6">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-32 h-48 object-cover rounded-lg shadow-lg border-4 border-background"
              />

              <div className="flex-1 pt-16">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{movie.title}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{releaseYear}</span>
                  </div>
                  {movie.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{movie.runtime} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <ScrollArea className="h-32 mt-6">
              <div className="pr-4">
                <h3 className="font-semibold mb-2">Overview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {movie.overview || 'No overview available.'}
                </p>
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Movie</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{movie.title}" from your
              collection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
