'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Section } from '@/components/section';
import { ContentCard } from '@/components/content-card';
import type { Movie, Genre } from '@/types';

export default function MoviesPage() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/movies/trending').then(res => res.json()),
      fetch('/api/movies/popular').then(res => res.json()),
      fetch('/api/genres').then(res => res.json()),
    ])
    .then(([trendingData, popularData, genresData]) => {
      setTrendingMovies(trendingData.results?.slice(0, 12) || []);
      setPopularMovies(popularData.results?.slice(0, 12) || []);
      setGenres(genresData.movie || []);
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));
  }, []);

  const handleGenreSelect = async (genreId: number | null) => {
    if (genreId === selectedGenre) return;
    
    setSelectedGenre(genreId);
    setIsLoadingGenre(true);
    
    try {
      if (genreId) {
        const response = await fetch(`/api/movies/popular?with_genres=${genreId}`);
        const data = await response.json();
        setGenreMovies(data.results || []);
      } else {
        setGenreMovies([]);
      }
    } catch (error) {
      console.error('Error fetching genre movies:', error);
      setGenreMovies([]);
    } finally {
      setIsLoadingGenre(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 bg-gray-800 rounded w-48"></div>
                <div className="flex space-x-4">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="w-48 aspect-[2/3] bg-gray-800 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Genre Filter Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Browse Movies by Genre</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleGenreSelect(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Movies
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreSelect(genre.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === genre.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </section>

        {/* Genre Movies */}
        {selectedGenre && (
          <section className="space-y-6">
            {isLoadingGenre ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-800 rounded w-48"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[2/3] bg-gray-800 rounded"></div>
                  ))}
                </div>
              </div>
            ) : genreMovies.length > 0 ? (
              <Section title={`${genres.find(g => g.id === selectedGenre)?.name} Movies`}>
                {genreMovies.map((movie) => (
                  <ContentCard
                    key={movie.id}
                    content={movie}
                    contentType="movie"
                  />
                ))}
              </Section>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No movies found for this genre.</p>
              </div>
            )}
          </section>
        )}

        {/* Default Content when no genre selected */}
        {!selectedGenre && (
          <>
            {/* Trending Movies */}
            {trendingMovies.length > 0 && (
              <Section title="Trending Movies">
                {trendingMovies.map((movie) => (
                  <ContentCard
                    key={movie.id}
                    content={movie}
                    contentType="movie"
                  />
                ))}
              </Section>
            )}

            {/* Popular Movies */}
            {popularMovies.length > 0 && (
              <Section title="Popular Movies">
                {popularMovies.map((movie) => (
                  <ContentCard
                    key={movie.id}
                    content={movie}
                    contentType="movie"
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </main>
    </div>
  );
}