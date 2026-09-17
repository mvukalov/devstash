/**
 * A minimal fixed-window rate limiter, held in this process's memory.
 *
 * Credentials auth is expensive on purpose — bcrypt at 12 rounds costs roughly
 * a third of a second of CPU per call — so the public registration endpoint
 * needs *some* ceiling, or anyone can spend the server's CPU for free and
 * create unbounded accounts.
 *
 * Deliberately not durable: the counters live in the module scope, so they
 * reset on redeploy and are not shared between serverless instances. That makes
 * this a speed bump, not a security control. The real limiter belongs in Redis
 * (listed as "maybe" in the tech stack) or at the edge, once there is one.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

// Bound the map so a flood of distinct keys cannot grow it without limit.
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the current window expires — for the Retry-After header. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) {
      sweepExpired(now);
    }

    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;

  return {
    allowed: existing.count <= limit,
    retryAfter: Math.ceil((existing.resetAt - now) / 1000),
  };
}

function sweepExpired(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) {
      windows.delete(key);
    }
  }
}

/**
 * Best-effort client address. Behind Vercel the proxy sets these; locally they
 * are absent, so every caller shares the "unknown" bucket — fine, since the
 * point is a ceiling rather than fairness.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
