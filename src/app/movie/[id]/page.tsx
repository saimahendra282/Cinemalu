'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, PlayIcon, StarIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { getTMDBImageUrl, formatRuntime, formatDate, formatVoteAverage } from '@/lib/utils';
import type { MovieDetailsResponse } from '@/types';

export default function MovieDetailsPage() {
  const params = useParams();
  const [movie, setMovie] = useState<MovieDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/movies/${params.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Movie not found');
          return res.json();
        })
        .then(setMovie)
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="animate-pulse">
          <div className="h-96 bg-gray-800"></div>
          <div className="container mx-auto px-4 py-8 space-y-4">
            <div className="h-8 bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-800 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie Not Found</h1>
          <p className="text-gray-400 mb-8">The movie you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 bg-blue-600 text-white shadow hover:bg-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Hero Section */}
      <div className="relative h-96 md:h-[600px] overflow-hidden">
        {movie.backdrop_path && (
          <Image
            src={getTMDBImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/30" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {movie.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-300 mb-4">
                {movie.vote_average > 0 && (
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span>{formatVoteAverage(movie.vote_average)}</span>
                  </div>
                )}
                
                {movie.release_date && (
                  <div className="flex items-center space-x-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>
                )}
                
                {movie.runtime && (
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {movie.overview}
              </p>
              
              <div className="flex space-x-4">
                <Link 
                  href={`/movie/${movie.id}/watch`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-medium transition-colors px-8 h-10 bg-white text-black hover:bg-gray-200"
                >
                  {/* <PlayIcon className="w-5 h-5 mr-2" /> */}
                  Watch Now
                </Link>
                
                <Button variant="outline" size="lg">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  My List
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <div className="space-y-4 text-gray-300">
                {movie.genres && movie.genres.length > 0 && (
                  <div>
                    <span className="text-gray-400">Genres: </span>
                    <span>{movie.genres.map(g => g.name).join(', ')}</span>
                  </div>
                )}
                
                {movie.tagline && (
                  <div>
                    <span className="text-gray-400">Tagline: </span>
                    <span className="italic">"{movie.tagline}"</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span>{movie.status || 'Released'}</span>
                </div>
                
                {movie.runtime && (
                  <div>
                    <span className="text-gray-400">Runtime: </span>
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          {/* <div>
            {movie.poster_path && (
              <div className="w-full max-w-sm mx-auto">
                <Image
                  src={getTMDBImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  width={500}
                  height={750}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}