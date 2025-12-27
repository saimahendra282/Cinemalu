// API Route: /api/tv/airing_today
// Purpose: Get TV shows airing today (METADATA ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { applyRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    await applyRateLimit(request, 'metadata');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const data = await tmdbClient.getAiringTodayTVShows(page);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    });
  } catch (error: any) {
    console.error('Error fetching airing today TV shows:', error);
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch airing today TV shows' },
      { status: 500 }
    );
  }
}