// API Route: /api/stream/tv/[tmdbId]/[season]/[episode]
// Purpose: Get TV episode stream URL from VidLink (STREAMING ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { vidlinkClient } from '@/lib/vidlink';
import { applyRateLimit } from '@/lib/rate-limit';

interface RouteParams {
  tmdbId: string;
  season: string;
  episode: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    await applyRateLimit(request, 'streaming');
    
    const { tmdbId, season, episode } = await context.params;
    const seasonNumber = parseInt(season, 10);
    const episodeNumber = parseInt(episode, 10);

    if (!tmdbId || isNaN(seasonNumber) || isNaN(episodeNumber)) {
      return NextResponse.json(
        { error: 'Valid TMDB ID, season, and episode numbers are required' },
        { status: 400 }
      );
    }

    // Get stream URL from VidLink
    const streamSource = vidlinkClient.getTVStreamUrl(tmdbId, seasonNumber, episodeNumber);

    return NextResponse.json(streamSource, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate', // No caching for streams
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error getting TV episode stream:', error);
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get TV episode stream' },
      { status: 500 }
    );
  }
}