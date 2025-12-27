'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PlayIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/solid';

import { Button } from '@/components/ui/button';
import {
  cn,
  getTMDBImageUrl,
  formatDate,
  formatVoteAverage,
  getWatchProgress,
} from '@/lib/utils';

import type { Movie, TVShow } from '@/types';

interface ContentCardProps {
  content: Movie | TVShow;
  contentType: 'movie' | 'tv';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export function ContentCard({
  content,
  contentType,
  className,
  size = 'md',
  showProgress = false,
}: ContentCardProps) {
  const [imageError, setImageError] = useState(false);

  const title =
    contentType === 'movie'
      ? (content as Movie).title
      : (content as TVShow).name;

  const releaseDate =
    contentType === 'movie'
      ? (content as Movie).release_date
      : (content as TVShow).first_air_date;

  const detailsHref = `/${contentType}/${content.id}`;
  const watchHref = `/${contentType}/${content.id}/watch`;

  const progress = showProgress
    ? getWatchProgress(content.id.toString())
    : 0;

  const sizeClasses = {
    sm: 'w-full',
    md: 'w-full', 
    lg: 'w-full max-w-80',
  };

  return (
    <div
      className={cn(
        'group relative',
        sizeClasses[size],
        className
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800 min-h-[320px]">
        {!imageError && content.poster_path ? (
          <Image
            src={getTMDBImageUrl(
              content.poster_path,
              size === 'lg' ? 'w780' : 'w500'
            )}
            alt={title}
            fill
            sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            <div className="text-center">
              <PlayIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p className="text-xs">No Image</p>
            </div>
          </div>
        )}

        {showProgress && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900/50">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-bold mb-2 line-clamp-2">{title}</h3>
            
            {content.vote_average > 0 && (
              <div className="flex items-center mb-2">
                <span className="text-green-400 font-semibold">
                  {Math.round(content.vote_average * 10)}% Match
                </span>
                <span className="text-gray-300 ml-2">{formatDate(releaseDate)}</span>
              </div>
            )}
            
            {content.overview && (
              <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                {content.overview}
              </p>
            )}
            
            <Link 
              href={detailsHref}
              className="w-full bg-white text-black hover:bg-gray-200 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-8 px-3"
            >
              {/* <PlayIcon className="mr-2 h-4 w-4" /> */}
              Open Now
            </Link>
          </div>
        </div>

        {content.vote_average > 0 && (
          <div className="absolute left-2 top-2 flex items-center space-x-1 rounded bg-black/90 px-2 py-1 text-sm">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="font-medium text-white">{formatVoteAverage(content.vote_average)}</span>
          </div>
        )}

        {showProgress && progress > 0 && (
          <div className="absolute left-2 top-2 flex items-center space-x-1 rounded bg-blue-600 px-1.5 py-0.5 text-xs">
            <ClockIcon className="h-3 w-3" />
            <span>Continue</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <Link
          href={detailsHref}
          className="block transition-colors group-hover:text-blue-400"
        >
          <h3 className="line-clamp-2 text-base font-semibold leading-tight">
            {title}
          </h3>
        </Link>

        {releaseDate && (
          <p className="text-sm text-gray-400">
            {formatDate(releaseDate)}
          </p>
        )}
      </div>
    </div>
  );
}
