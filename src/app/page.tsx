'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Section } from '@/components/section';
import { ContinueWatching } from '@/components/continue-watching';
import { ContentCard } from '@/components/content-card';
import { getContinueWatchingList } from '@/lib/utils';
import type { Movie, TVShow, ContinueWatchingItem } from '@/types';

export default function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);
  const [airingTodayTVShows, setAiringTodayTVShows] = useState<TVShow[]>([]);
  const [onTheAirTVShows, setOnTheAirTVShows] = useState<TVShow[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load continue watching from localStorage
    setContinueWatching(getContinueWatchingList());

    // Fetch trending content and new TV show categories
    Promise.all([
      fetch('/api/movies/trending').then(res => res.json()),
      fetch('/api/tv/trending').then(res => res.json()),
      fetch('/api/tv/airing_today').then(res => res.json()),
      fetch('/api/tv/on_the_air').then(res => res.json()),
    ])
    .then(([trendingMoviesData, trendingTVData, airingTodayData, onTheAirData]) => {
      setTrendingMovies(trendingMoviesData.results?.slice(0, 12) || []);
      setTrendingTVShows(trendingTVData.results?.slice(0, 12) || []);
      setAiringTodayTVShows(airingTodayData.results?.slice(0, 12) || []);
      setOnTheAirTVShows(onTheAirData.results?.slice(0, 12) || []);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3, 4].map((i) => (
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
      
      <main className="space-y-12 pb-8">
        {/* Continue Watching */}
        <div className="container mx-auto px-4 pt-8">
          <ContinueWatching />
        </div>

        {/* Trending Movies */}
        <div className="container mx-auto px-4">
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
        </div>

        {/* Trending TV Shows */}
        <div className="container mx-auto px-4">
          {trendingTVShows.length > 0 && (
            <Section title="Trending TV Shows">
              {trendingTVShows.map((tvShow) => (
                <ContentCard
                  key={tvShow.id}
                  content={tvShow}
                  contentType="tv"
                />
              ))}
            </Section>
          )}
        </div>

        {/* Airing Today TV Shows */}
        <div className="container mx-auto px-4">
          {airingTodayTVShows.length > 0 && (
            <Section title="Airing Today">
              {airingTodayTVShows.map((tvShow) => (
                <ContentCard
                  key={tvShow.id}
                  content={tvShow}
                  contentType="tv"
                />
              ))}
            </Section>
          )}
        </div>

        {/* On The Air TV Shows */}
        <div className="container mx-auto px-4">
          {onTheAirTVShows.length > 0 && (
            <Section title="On The Air">
              {onTheAirTVShows.map((tvShow) => (
                <ContentCard
                  key={tvShow.id}
                  content={tvShow}
                  contentType="tv"
                />
              ))}
            </Section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">
            Cinemalu - Watch movies and TV shows instantly
          </p>
          <p className="text-sm">
            Metadata provided by{' '}
            <a 
              href="https://www.themoviedb.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              TMDB
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
