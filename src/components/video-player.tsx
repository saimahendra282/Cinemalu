'use client';

import { useEffect, useRef, useState } from 'react';

import { saveWatchProgress } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  title: string;
  contentId: string;
  contentType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  className?: string;
  onProgressUpdate?: (progress: number) => void;
}

interface VidLinkProgressData {
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
    show_progress?: {
      [episodeKey: string]: {
        season: string;
        episode: string;
        progress: {
          watched: number;
          duration: number;
        };
      };
    };
    last_updated?: number;
  };
}

export function VideoPlayer({
  src,
  title,
  contentId,
  contentType,
  season,
  episode,
  className,
  onProgressUpdate,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from VidLink
      if (event.origin !== 'https://vidlink.pro') return;

      try {
        if (event.data?.type === 'MEDIA_DATA') {
          // Handle VidLink progress tracking data
          const mediaData = event.data.data;
          const existingProgress = localStorage.getItem('vidLinkProgress');
          let progressData: VidLinkProgressData = {};
          
          if (existingProgress) {
            progressData = JSON.parse(existingProgress);
          }
          
          // Update progress data for this media
          progressData[mediaData.id] = {
            ...mediaData,
            last_updated: Date.now(),
          };
          
          localStorage.setItem('vidLinkProgress', JSON.stringify(progressData));
          
          // Calculate progress percentage
          const progressPercentage = Math.round(
            (mediaData.progress.watched / mediaData.progress.duration) * 100
          );

          // Save to our system too
          saveWatchProgress(
            contentId,
            contentType,
            progressPercentage,
            season,
            episode
          );

          onProgressUpdate?.(progressPercentage);
        }

        if (event.data?.type === 'PLAYER_EVENT') {
          // Handle player events for analytics
          const { event: eventType, currentTime, duration } = event.data.data;
          
          switch (eventType) {
            case 'play':
              console.log('Video started playing');
              break;
            case 'pause':
              console.log('Video paused');
              break;
            case 'ended':
              console.log('Video ended');
              // Mark as completed
              saveWatchProgress(contentId, contentType, 100, season, episode);
              onProgressUpdate?.(100);
              break;
            case 'seeked':
              console.log('Video seeked');
              break;
          }
        }

        // Legacy support for old format
        const data =
          typeof event.data === 'string'
            ? JSON.parse(event.data)
            : event.data;

        if (
          data?.type === 'progress' &&
          typeof data.progress === 'number'
        ) {
          const progress = Math.round(data.progress);

          saveWatchProgress(
            contentId,
            contentType,
            progress,
            season,
            episode
          );

          onProgressUpdate?.(progress);
        }
      } catch (error) {
        console.error('Error handling VidLink message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () =>
      window.removeEventListener('message', handleMessage);
  }, [
    contentId,
    contentType,
    season,
    episode,
    onProgressUpdate,
  ]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load video player. Please try again.');
  };

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg bg-black',
        className
      )}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg z-10">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400">Loading player...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg z-10">
          <div className="text-center">
            <div className="text-blue-400 mb-2">⚠️ Error</div>
            <div className="text-gray-400 text-sm">{error}</div>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={src}
        title={`Watch ${title}`}
        className="h-full w-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
}
