'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, PlayIcon, StarIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { getTMDBImageUrl, formatDate, formatVoteAverage } from '@/lib/utils';
import type { TVDetailsResponse } from '@/types';

export default function TVShowDetailsPage() {
  const params = useParams();
  const [tvShow, setTVShow] = useState<TVDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/tv/${params.id}`)
        .then(res => {
          if (!res.ok) throw new Error('TV show not found');
          return res.json();
        })
        .then(setTVShow)
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

  if (error || !tvShow) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="space-y-4">
            <ArrowLeftIcon className="w-16 h-16 text-blue-500 mx-auto" />
            <h1 className="text-2xl font-bold text-white">TV Show Not Found</h1>
            <p className="text-gray-400">{error || 'The TV show you are looking for does not exist.'}</p>
            <Link href="/tv">
              <Button variant="default">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to TV Shows
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const watchHref = `/tv/${tvShow.id}/watch?season=1&episode=1`;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Hero Section */}
      <div className="relative h-96 md:h-[600px] overflow-hidden">
        {tvShow.backdrop_path && (
          <Image
            src={getTMDBImageUrl(tvShow.backdrop_path, 'original')}
            alt={tvShow.name}
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
                <Link href="/tv">
                  <Button variant="ghost" size="sm">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {tvShow.name}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-300 mb-4">
                {tvShow.vote_average > 0 && (
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span>{formatVoteAverage(tvShow.vote_average)}</span>
                  </div>
                )}
                
                {tvShow.first_air_date && (
                  <div className="flex items-center space-x-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>{formatDate(tvShow.first_air_date)}</span>
                  </div>
                )}
                
                {tvShow.number_of_seasons && (
                  <span>{tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? 's' : ''}</span>
                )}
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {tvShow.overview}
              </p>
              
              <div className="flex space-x-4">
                <Link 
                  href={watchHref}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-medium transition-colors px-8 h-10 bg-white text-black hover:bg-gray-200"
                >
                  {/* <PlayIcon className="w-5 h-5 mr-2" /> */}
                  Watch S1E1
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
                {tvShow.genres && tvShow.genres.length > 0 && (
                  <div>
                    <span className="text-gray-400">Genres: </span>
                    <span>{tvShow.genres.map(g => g.name).join(', ')}</span>
                  </div>
                )}
                
                {tvShow.created_by && tvShow.created_by.length > 0 && (
                  <div>
                    <span className="text-gray-400">Created by: </span>
                    <span>{tvShow.created_by.map(c => c.name).join(', ')}</span>
                  </div>
                )}
                
                {tvShow.networks && tvShow.networks.length > 0 && (
                  <div>
                    <span className="text-gray-400">Network: </span>
                    <span>{tvShow.networks.map(n => n.name).join(', ')}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-400">Status: </span>
                  <span>{tvShow.status}</span>
                </div>
                
                {tvShow.episode_run_time && tvShow.episode_run_time.length > 0 && (
                  <div>
                    <span className="text-gray-400">Episode Runtime: </span>
                    <span>{tvShow.episode_run_time[0]} minutes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          {/* <div>
            {tvShow.poster_path && (
              <div className="w-full max-w-sm mx-auto">
                <Image
                  src={getTMDBImageUrl(tvShow.poster_path, 'w500')}
                  alt={tvShow.name}
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