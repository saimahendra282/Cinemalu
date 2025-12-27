// API Route: /api/tv/popular
// Purpose: Get popular TV shows (METADATA ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { applyRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    await applyRateLimit(request, 'metadata');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const genreId = searchParams.get('with_genres');

    let data;
    if (genreId) {
      data = await tmdbClient.discoverTVByGenre(parseInt(genreId, 10), page);
    } else {
      data = await tmdbClient.getPopularTVShows(page);
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    });
  } catch (error: any) {
    console.error('Error fetching popular TV shows:', error);
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch popular TV shows' },
      { status: 500 }
    );
  }
}