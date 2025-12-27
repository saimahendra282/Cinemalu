// VidLink client - STREAMING ONLY
// This client must never be used for metadata

import type { StreamingSource } from '@/types';

const VIDLINK_BASE_URL = process.env.NEXT_PUBLIC_VIDLINK_BASE_URL || 'https://vidlink.pro';

class VidLinkClient {
  // Get movie stream URL with customization
  getMovieStreamUrl(tmdbId: string | number): StreamingSource {
    const url = `${VIDLINK_BASE_URL}/movie/${tmdbId}`;
    const embedUrl = `${url}?primaryColor=DC2626&secondaryColor=374151&iconColor=FFFFFF&title=true&poster=true&autoplay=false&nextbutton=false&player=default`;
    
    return {
      url,
      embedUrl,
      provider: 'vidlink',
    };
  }

  // Get TV episode stream URL with customization
  getTVStreamUrl(
    tmdbId: string | number,
    season: number,
    episode: number
  ): StreamingSource {
    const url = `${VIDLINK_BASE_URL}/tv/${tmdbId}/${season}/${episode}`;
    const embedUrl = `${url}?primaryColor=DC2626&secondaryColor=374151&iconColor=FFFFFF&title=true&poster=true&autoplay=false&nextbutton=true&player=default`;
    
    return {
      url,
      embedUrl,
      provider: 'vidlink',
    };
  }

  // Get anime stream URL (VidLink also supports anime)
  getAnimeStreamUrl(
    malId: string | number,
    episode: number,
    subOrDub: 'sub' | 'dub' = 'sub'
  ): StreamingSource {
    const url = `${VIDLINK_BASE_URL}/anime/${malId}/${episode}/${subOrDub}`;
    const embedUrl = `${url}?primaryColor=DC2626&secondaryColor=374151&iconColor=FFFFFF&title=true&poster=true&autoplay=false&fallback=true&player=default`;
    
    return {
      url,
      embedUrl,
      provider: 'vidlink',
    };
  }

  // Validate stream URL (basic check)
  isValidStreamUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.includes('vidlink.pro');
    } catch {
      return false;
    }
  }
}

export const vidlinkClient = new VidLinkClient();