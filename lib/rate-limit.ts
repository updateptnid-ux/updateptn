/**
 * Rate Limiting untuk prevent brute force attacks
 * Uses simple in-memory store (untuk production gunakan Redis/Upstash)
 */

type RateLimitStore = {
  [key: string]: {
    count: number;
    resetTime: number;
  };
};

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * Production: gunakan @upstash/ratelimit dengan Redis
 */
export class RateLimiter {
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const key = identifier;

    // Clean expired entries
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }

    // Initialize if not exists
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    const record = store[key];

    // Check if limit exceeded
    if (record.count >= this.limit) {
      return {
        success: false,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    // Increment count
    record.count++;

    return {
      success: true,
      remaining: this.limit - record.count,
      reset: record.resetTime,
    };
  }
}

// ========================================
// PRE-CONFIGURED RATE LIMITERS
// ========================================

/**
 * Login Rate Limiter
 * 5 attempts per 15 minutes per IP
 */
export const loginRateLimit = new RateLimiter(
  5, // 5 attempts
  15 * 60 * 1000 // 15 minutes
);

/**
 * API Rate Limiter
 * 100 requests per minute per user
 */
export const apiRateLimit = new RateLimiter(
  100, // 100 requests
  60 * 1000 // 1 minute
);

/**
 * Tryout Submit Rate Limiter
 * 1 submission per 5 seconds (prevent double submit)
 */
export const submitRateLimit = new RateLimiter(
  1, // 1 submit
  5 * 1000 // 5 seconds
);

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(
  request: { headers: Headers },
  userId?: string
): string {
  // Prefer userId if available
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address
  const headers = request.headers;
  
  // Try various headers for IP address
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cfConnectingIp = headers.get("cf-connecting-ip"); // Cloudflare
  
  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown";
  
  return `ip:${ip}`;
}

/**
 * Helper untuk Next.js middleware/API routes
 */
export async function checkRateLimit(
  identifier: string,
  limiter: RateLimiter = apiRateLimit
): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
}> {
  const result = await limiter.check(identifier);
  
  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Production-ready setup dengan Upstash Redis
 * 
 * Installation:
 * npm install @upstash/ratelimit @upstash/redis
 * 
 * .env:
 * UPSTASH_REDIS_REST_URL=...
 * UPSTASH_REDIS_REST_TOKEN=...
 * 
 * Usage:
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { Redis } from "@upstash/redis";
 * 
 * export const loginRateLimit = new Ratelimit({
 *   redis: Redis.fromEnv(),
 *   limiter: Ratelimit.slidingWindow(5, "15 m"),
 *   analytics: true,
 *   prefix: "@updateptn/ratelimit",
 * });
 */
