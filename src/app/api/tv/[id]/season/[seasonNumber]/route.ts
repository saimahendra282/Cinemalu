// API Route: /api/tv/[id]/season/[seasonNumber]
// Purpose: Get season details with episodes (METADATA ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { applyRateLimit } from '@/lib/rate-limit';

interface RouteParams {
  id: string;
  seasonNumber: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    await applyRateLimit(request, 'metadata');
    
    const { id, seasonNumber } = await context.params;
    const tvId = parseInt(id, 10);
    const seasonNum = parseInt(seasonNumber, 10);

    if (isNaN(tvId) || isNaN(seasonNum)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID or season number' },
        { status: 400 }
      );
    }

    const seasonDetails = await tmdbClient.getSeasonDetails(tvId, seasonNum);

    return NextResponse.json(seasonDetails, {
      headers: {
        'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400', // 2 hours cache
      },
    });
  } catch (error: any) {
    console.error('Error fetching season details:', error);
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }

    if (error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch season details' },
      { status: 500 }
    );
  }
}