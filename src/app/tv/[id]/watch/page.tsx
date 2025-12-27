'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, InformationCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/video-player';
import type { TVDetailsResponse, StreamingSource, Season } from '@/types';

export default function TVShowWatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tvShow, setTVShow] = useState<TVDetailsResponse | null>(null);
  const [streamSource, setStreamSource] = useState<StreamingSource | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState(false);

  // Get season and episode from URL parameters or default to S1E1
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  useEffect(() => {
    if (params.id) {
      // Fetch TV show metadata and stream URL in parallel
      Promise.all([
        fetch(`/api/tv/${params.id}`).then(res => {
          if (!res.ok) throw new Error('TV show not found');
          return res.json();
        }),
        fetch(`/api/stream/tv/${params.id}/${season}/${episode}`).then(res => {
          if (!res.ok) throw new Error('Stream not available');
          return res.json();
        })
      ])
      .then(([tvShowData, streamData]) => {
        setTVShow(tvShowData);
        setStreamSource(streamData);
        if (tvShowData.seasons) {
          setSeasons(tvShowData.seasons.filter((s: Season) => s.season_number > 0));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
    }
  }, [params.id, season, episode]);

  // Fetch episodes for current season
  useEffect(() => {
    if (params.id && season) {
      fetch(`/api/tv/${params.id}/season/${season}`)
        .then(res => {
          if (!res.ok) throw new Error('Season not found');
          return res.json();
        })
        .then(data => {
          setEpisodes(data.episodes || []);
        })
        .catch(err => console.error('Error fetching episodes:', err));
    }
  }, [params.id, season]);

  const changeSeasonEpisode = (newSeason: string, newEpisode: string) => {
    const newUrl = `/tv/${params.id}/watch?season=${newSeason}&episode=${newEpisode}`;
    router.push(newUrl);
  };

  const currentEpisode = episodes.find(ep => ep.episode_number.toString() === episode);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (error || !tvShow || !streamSource) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <InformationCircleIcon className="w-16 h-16 text-blue-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Episode Not Available</h1>
          <p className="text-gray-400">
            {error || 'The episode you are looking for is not available for streaming.'}
          </p>
          <div className="space-x-4">
            <Link 
              href={`/tv/${params.id}`}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 bg-blue-600 text-white shadow hover:bg-blue-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Show
            </Link>
            <Link 
              href="/tv"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 bg-gray-800 text-white shadow-sm hover:bg-gray-700"
            >
              Browse TV Shows
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="relative z-10 bg-gray-950/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/tv/${tvShow.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {tvShow.name}
              </h1>
              <p className="text-sm text-gray-400">
                Season {season}, Episode {episode}
              </p>
            </div>
          </div>
          
          <Link href={`/tv/${tvShow.id}`}>
            <Button variant="ghost" size="sm">
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative">
        <VideoPlayer
          src={streamSource.embedUrl}
          title={`${tvShow.name} - S${season}E${episode}`}
          contentId={tvShow.id.toString()}
          contentType="tv"
          season={parseInt(season)}
          episode={parseInt(episode)}
          className="aspect-video"
        />
      </div>

      {/* Episode Info and Controls */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Episode Title and Description */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentEpisode?.name || `Episode ${episode}`}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {currentEpisode?.overview || tvShow.overview}
            </p>
          </div>

          {/* Season and Episode Selection */}
          <div className="flex items-center space-x-6 pt-6 border-t border-gray-800">
            {/* Season Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSeasonDropdown(!showSeasonDropdown);
                  setShowEpisodeDropdown(false);
                }}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span>Season {season}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              {showSeasonDropdown && (
                <div className="absolute top-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20 min-w-[150px]">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => {
                        changeSeasonEpisode(s.season_number.toString(), '1');
                        setShowSeasonDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      Season {s.season_number}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episode Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowEpisodeDropdown(!showEpisodeDropdown);
                  setShowSeasonDropdown(false);
                }}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span>Episode {episode}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              {showEpisodeDropdown && (
                <div className="absolute top-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20 min-w-[200px] max-h-64 overflow-y-auto">
                  {episodes.map((ep) => (
                    <button
                      key={ep.episode_number}
                      onClick={() => {
                        changeSeasonEpisode(season, ep.episode_number.toString());
                        setShowEpisodeDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium">
                        {ep.episode_number}. {ep.name}
                      </div>
                      {ep.runtime && (
                        <div className="text-sm text-gray-400">
                          {ep.runtime}m
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Navigation */}
            <div className="flex items-center space-x-2 ml-auto">
              {parseInt(episode) > 1 && (
                <Button 
                  onClick={() => changeSeasonEpisode(season, (parseInt(episode) - 1).toString())}
                  variant="secondary" 
                  size="sm"
                >
                  ← Previous
                </Button>
              )}

              {parseInt(episode) < episodes.length && (
                <Button 
                  onClick={() => changeSeasonEpisode(season, (parseInt(episode) + 1).toString())}
                  variant="secondary" 
                  size="sm"
                >
                  Next →
                </Button>
              )}
            </div>
          </div>

          {/* Episode Details */}
          {currentEpisode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Episode Info</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><span className="text-white">Air Date:</span> {currentEpisode.air_date}</p>
                  {currentEpisode.runtime && (
                    <p><span className="text-white">Runtime:</span> {currentEpisode.runtime} minutes</p>
                  )}
                  <p><span className="text-white">Rating:</span> {currentEpisode.vote_average.toFixed(1)}/10</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showSeasonDropdown || showEpisodeDropdown) && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowSeasonDropdown(false);
            setShowEpisodeDropdown(false);
          }}
        />
      )}
    </div>
  );
}