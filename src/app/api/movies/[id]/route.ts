// API Route: /api/movies/[id]
// Purpose: Get movie details with credits (METADATA ONLY)

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
    const movieId = parseInt(id, 10);

    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    // Fetch movie details and credits in parallel
    const [movieDetails, credits] = await Promise.all([
      tmdbClient.getMovieDetails(movieId),
      tmdbClient.getMovieCredits(movieId),
    ]);

    // Combine the data
    const response = {
      ...movieDetails,
      cast: credits.cast.slice(0, 20), // Limit cast to top 20
      crew: credits.crew.filter(member => 
        ['Director', 'Producer', 'Executive Producer', 'Writer'].includes(member.job)
      ),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400', // 2 hours cache
      },
    });
  } catch (error: any) {
    console.error('Error fetching movie details:', error);
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: error.retryAfter },
        { status: 429, headers: { 'Retry-After': error.retryAfter.toString() } }
      );
    }

    if (error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
}