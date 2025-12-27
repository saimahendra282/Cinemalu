'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import type { MovieDetailsResponse, StreamingSource } from '@/types';

export default function MovieWatchPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetailsResponse | null>(null);
  const [streamSource, setStreamSource] = useState<StreamingSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      // Fetch movie metadata and stream URL in parallel
      Promise.all([
        fetch(`/api/movies/${params.id}`).then(res => {
          if (!res.ok) throw new Error('Movie not found');
          return res.json();
        }),
        fetch(`/api/stream/movie/${params.id}`).then(res => {
          if (!res.ok) throw new Error('Stream not available');
          return res.json();
        })
      ])
      .then(([movieData, streamData]) => {
        setMovie(movieData);
        setStreamSource(streamData);
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300">Loading movie...</p>
        </div>
      </div>
    );
  }

  if (error || !movie || !streamSource) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <InformationCircleIcon className="w-16 h-16 text-blue-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Stream Not Available</h1>
          <p className="text-gray-400">
            {error || 'This movie is not available for streaming right now.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`/movie/${params.id}`}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 bg-blue-600 text-white shadow hover:bg-blue-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Movie Details
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 border border-gray-700 bg-transparent shadow-sm hover:bg-gray-800 hover:text-white"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/movie/${params.id}`}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white h-9 w-9"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white truncate">
                {movie.title}
              </h1>
              <p className="text-sm text-gray-400">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown Year'}
              </p>
            </div>
          </div>
          
          <Link 
            href={`/movie/${movie.id}`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-8 px-3 border border-gray-700 bg-transparent shadow-sm hover:bg-gray-800 hover:text-white"
          >
            <InformationCircleIcon className="w-4 h-4 mr-2" />
            Details
          </Link>
        </div>
      </div>
      
      {/* Video Player */}
      <div className="container mx-auto p-4">
        <VideoPlayer
          src={streamSource.embedUrl}
          title={movie.title}
          contentId={movie.id.toString()}
          contentType="movie"
          className="w-full max-w-6xl mx-auto"
        />
      </div>
      
      {/* Movie Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {movie.overview && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
              <p className="text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Production</h3>
                <div className="space-y-1">
                  {movie.production_companies.slice(0, 3).map((company) => (
                    <p key={company.id} className="text-gray-300 text-sm">
                      {company.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}