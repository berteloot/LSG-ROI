/**
 * Simple in-memory rate limiter.
 * Tracks request counts per IP within a sliding window.
 */

const hits = new Map<string, number[]>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of hits) {
    const valid = timestamps.filter((t) => now - t < 60_000);
    if (valid.length === 0) {
      hits.delete(key);
    } else {
      hits.set(key, valid);
    }
  }
}, 5 * 60_000);

/**
 * Returns true if the request should be allowed, false if rate-limited.
 * @param key - Identifier (usually IP address)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Window duration in milliseconds (default: 60 seconds)
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const timestamps = hits.get(key) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    return false; // rate limited
  }

  valid.push(now);
  hits.set(key, valid);
  return true; // allowed
}
