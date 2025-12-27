// API Route: /api/tv/[id]
// Purpose: Get TV show details with credits (METADATA ONLY)

import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';
import { applyRateLimit } from '@/lib/rate-limit';

interface RouteParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    await applyRateLimit(request, 'metadata');
    
    const { id } = await context.params;
    const tvId = parseInt(id, 10);

    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: 'Invalid TV show ID' },
        { status: 400 }
      );
    }

    // Fetch TV details and credits in parallel
    const [tvDetails, credits] = await Promise.all([
      tmdbClient.getTVShowDetails(tvId),
      tmdbClient.getTVCredits(tvId),
    ]);

    // Combine the data
    const response = {
      ...tvDetails,
      cast: credits.cast.slice(0, 20), // Limit cast to top 20
      crew: credits.crew.filter(member => 
        ['Creator', 'Executive Producer', 'Producer', 'Director', 'Writer'].includes(member.job)
      ),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400', // 2 hours cache
      },
    });
  } catch (error: any) {
    console.error('Error fetching TV show details:', error);
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }

    if (error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'TV show not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch TV show details' },
      { status: 500 }
    );
  }
}