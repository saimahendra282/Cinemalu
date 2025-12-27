import type { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SimpleRateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private points: number;
  private duration: number;

  constructor(points: number, duration: number) {
    this.points = points;
    this.duration = duration;
  }

  async consume(key: string): Promise<void> {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.storage.set(key, {
        count: 1,
        resetTime: now + (this.duration * 1000),
      });
      return;
    }

    if (entry.count >= this.points) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      const error = new Error('Rate limit exceeded') as any;
      error.status = 429;
      error.retryAfter = retryAfter;
      throw error;
    }

    entry.count++;
    this.storage.set(key, entry);
  }
}

// Rate limiters for different endpoint types
const searchRateLimiter = new SimpleRateLimiter(10, 60); // 10 requests per 60 seconds
const streamingRateLimiter = new SimpleRateLimiter(20, 60); // 20 requests per 60 seconds  
const metadataRateLimiter = new SimpleRateLimiter(100, 60); // 100 requests per 60 seconds

function getClientId(req: NextRequest): string {
  // In production, you might want to use X-Forwarded-For or other headers
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
}

export async function applyRateLimit(
  req: NextRequest,
  type: 'search' | 'streaming' | 'metadata' = 'metadata'
): Promise<void> {
  let limiter;
  
  switch (type) {
    case 'search':
      limiter = searchRateLimiter;
      break;
    case 'streaming':
      limiter = streamingRateLimiter;
      break;
    case 'metadata':
    default:
      limiter = metadataRateLimiter;
      break;
  }

  const clientId = getClientId(req);
  await limiter.consume(clientId);
}

export function createRateLimitHandler(type: 'search' | 'streaming' | 'metadata' = 'metadata') {
  return async (req: NextRequest, res: any, next: any) => {
    try {
      await applyRateLimit(req, type);
      next();
    } catch (error: any) {
      res.status(error.status || 429).json({
        error: 'Too many requests',
        retryAfter: error.retryAfter || 60,
      });
    }
  };
}