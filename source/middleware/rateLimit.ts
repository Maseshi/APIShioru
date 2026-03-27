import { Elysia } from "elysia";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter plugin for Elysia.
 *
 * @param maxRequests - Maximum requests allowed per window.
 * @param windowMs - Time window in milliseconds.
 */
export const rateLimit = (maxRequests = 60, windowMs = 60_000) => {
  const store = new Map<string, RateLimitEntry>();

  // Cleanup expired entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000);

  return new Elysia({ name: "rate-limit" }).onBeforeHandle(
    ({ request, set }) => {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return;
      }

      entry.count++;

      if (entry.count > maxRequests) {
        set.status = 429;
        set.headers["Retry-After"] = String(
          Math.ceil((entry.resetAt - now) / 1000)
        );
        return { error: "Too many requests. Please try again later." };
      }
    }
  );
};
