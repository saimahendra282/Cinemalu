import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiters for different endpoint types
const searchRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => getClientId(req),
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

const streamingRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => getClientId(req),
  points: 20, // Number of requests
  duration: 60, // Per 60 seconds
});

const metadataRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => getClientId(req),
  points: 100, // More generous for cached metadata
  duration: 60, // Per 60 seconds
});

function getClientId(req: any): string {
  // In production, you might want to use X-Forwarded-For or other headers
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

export async function applyRateLimit(
  req: any,
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

  try {
    await limiter.consume(getClientId(req));
  } catch (rejRes) {
    const error = new Error('Too many requests');
    (error as any).status = 429;
    (error as any).retryAfter = Math.round(rejRes.msBeforeNext) || 60000;
    throw error;
  }
}

export function createRateLimitHandler(type: 'search' | 'streaming' | 'metadata' = 'metadata') {
  return async (req: any, res: any, next: any) => {
    try {
      await applyRateLimit(req, type);
      next();
    } catch (error: any) {
      res.status(error.status || 429).json({
        error: 'Too many requests',
        retryAfter: error.retryAfter || 60000,
      });
    }
  };
}