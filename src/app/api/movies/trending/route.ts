// API Route: /api/movies/trending
// Purpose: Get trending movies (METADATA ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { applyRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    await applyRateLimit(request, 'metadata');

    const { searchParams } = new URL(request.url);
    const timeWindow = searchParams.get('timeWindow') as 'day' | 'week' || 'week';

    const data = await tmdbClient.getTrendingMovies(timeWindow);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min cache
      },
    });
  } catch (error: any) {
    console.error('Error fetching trending movies:', error);
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch trending movies' },
      { status: 500 }
    );
  }
}