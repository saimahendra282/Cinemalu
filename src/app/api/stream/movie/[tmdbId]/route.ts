// API Route: /api/stream/movie/[tmdbId]
// Purpose: Get movie stream URL from VidLink (STREAMING ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { vidlinkClient } from '@/lib/vidlink';
import { applyRateLimit } from '@/lib/rate-limit';

interface RouteParams {
  tmdbId: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    await applyRateLimit(request, 'streaming');
    
    const { tmdbId } = await context.params;

    if (!tmdbId) {
      return NextResponse.json(
        { error: 'TMDB ID is required' },
        { status: 400 }
      );
    }

    // Get stream URL from VidLink
    const streamSource = vidlinkClient.getMovieStreamUrl(tmdbId);

    return NextResponse.json(streamSource, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate', // No caching for streams
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error getting movie stream:', error);
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get movie stream' },
      { status: 500 }
    );
  }
}