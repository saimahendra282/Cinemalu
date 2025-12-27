'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlayIcon } from '@heroicons/react/24/solid';

interface ContinueWatchingData {
  [key: string]: {
    id: number;
    type: 'movie' | 'tv';
    title: string;
    poster_path: string;
    backdrop_path?: string;
    progress: {
      watched: number;
      duration: number;
    };
    last_season_watched?: string;
    last_episode_watched?: string;
    last_updated?: number;
  };
}

export function ContinueWatching() {
  const [watchData, setWatchData] = useState<ContinueWatchingData>({});

  useEffect(() => {
    // Load VidLink progress data
    const loadProgressData = () => {
      try {
        const stored = localStorage.getItem('vidLinkProgress');
        if (stored) {
          const data = JSON.parse(stored);
          // Filter out items that are completed (>95% watched)
          const filtered: ContinueWatchingData = {};
          Object.entries(data).forEach(([key, item]: [string, any]) => {
            const progressPercent = (item.progress.watched / item.progress.duration) * 100;
            if (progressPercent > 5 && progressPercent < 95) {
              filtered[key] = item;
            }
          });
          setWatchData(filtered);
        }
      } catch (error) {
        console.error('Error loading progress data:', error);
      }
    };

    loadProgressData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vidLinkProgress') {
        loadProgressData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const watchItems = Object.values(watchData)
    .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0))
    .slice(0, 10); // Limit to 10 items

  if (watchItems.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-bold text-white">Continue Watching</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {watchItems.map((item) => {
          const progressPercent = Math.round(
            (item.progress.watched / item.progress.duration) * 100
          );

          const href = item.type === 'movie' 
            ? `/movie/${item.id}/watch`
            : `/tv/${item.id}/watch?season=${item.last_season_watched}&episode=${item.last_episode_watched}`;

          return (
            <Link
              key={item.id}
              href={href}
              className="group relative flex-shrink-0"
            >
              <div className="relative h-40 w-64 overflow-hidden rounded-lg bg-gray-800">
                {item.backdrop_path && (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <PlayIcon className="ml-1 h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                  <div 
                    className="h-full bg-blue-600"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Title and episode info */}
              <div className="mt-2 max-w-64">
                <h3 className="text-sm font-medium text-white truncate">
                  {item.title}
                </h3>
                {item.type === 'tv' && (
                  <p className="text-xs text-gray-400">
                    S{item.last_season_watched}E{item.last_episode_watched}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {progressPercent}% watched
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}