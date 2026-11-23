'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { moviesService } from '@/lib/movies-service';
import type { Movie } from '@/lib/supabase';
import { KanbanBoard } from '@/components/kanban-board';
import { AddMovieSheet } from '@/components/add-movie-sheet';
import { MovieDetailsDialog } from '@/components/movie-details-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { Film, Plus, LogIn, LogOut, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [addMovieOpen, setAddMovieOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { toast } = useToast();

  const loadMovies = useCallback(async (userId: string) => {
    try {
      const data = await moviesService.getMovies(userId);
      setMovies(data);
    } catch (error) {
      console.error('Error loading movies:', error);
      toast({
        title: 'Could not load movies',
        description: error instanceof Error ? error.message : 'Please check your Supabase table and permissions.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;
        const currentUser = data.session?.user ?? null;
        setUser(currentUser);
        if (currentUser) await loadMovies(currentUser.id);
      } catch (error) {
        console.error('Session initialization failed:', error);
        toast({
          title: 'Authentication error',
          description: error instanceof Error ? error.message : 'Could not read your session.',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (nextUser) {
          // Defer the database request so it does not run inside Supabase's auth callback.
          setTimeout(() => {
            if (mounted) void loadMovies(nextUser.id);
          }, 0);
        } else {
          setMovies([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadMovies, toast]);

  const handleAuth = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      toast({
        title: 'Missing information',
        description: 'Please enter your email and password.',
        variant: 'destructive',
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Your password must contain at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        toast({ title: 'Welcome back', description: 'You are now signed in.' });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) throw error;

        if (data.session) {
          toast({ title: 'Account created', description: 'Your account is ready.' });
        } else {
          toast({
            title: 'Check your email',
            description: 'Supabase sent you a confirmation link before you can sign in.',
          });
          setAuthMode('signin');
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      toast({
        title: authMode === 'signin' ? 'Sign in failed' : 'Sign up failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Sign out failed', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Moviefy...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
        <div className="max-w-md w-full p-8 space-y-6 bg-card rounded-lg shadow-lg border">
          <div className="text-center space-y-2">
            <Film className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Moviefy</h1>
            <p className="text-muted-foreground">Organize your movies with a Kanban board</p>
          </div>

          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void handleAuth();
            }}
          >
            <Input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password (at least 6 characters)"
              autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
            <Button className="w-full" type="submit" disabled={authLoading}>
              {authLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                authMode === 'signin' ? <LogIn className="w-4 h-4 mr-2" /> :
                <UserPlus className="w-4 h-4 mr-2" />}
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm">
            {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              className="font-medium text-primary underline underline-offset-4"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            >
              {authMode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Moviefy</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setAddMovieOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Movie
            </Button>
            <Button variant="outline" size="icon" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <KanbanBoard
          userId={user.id}
          movies={movies}
          onMoviesChange={() => void loadMovies(user.id)}
          onMovieClick={setSelectedMovie}
        />
      </main>

      <AddMovieSheet
        open={addMovieOpen}
        onOpenChange={setAddMovieOpen}
        userId={user.id}
        onMovieAdded={() => void loadMovies(user.id)}
      />

      <MovieDetailsDialog
        movie={selectedMovie}
        open={!!selectedMovie}
        onOpenChange={(open) => !open && setSelectedMovie(null)}
        onMovieDeleted={() => void loadMovies(user.id)}
      />
      <Toaster />
    </div>
  );
}
