import { describe, expect, it, afterAll } from "bun:test";
import { Elysia } from "elysia";

describe("Rate limiting", () => {
  // Test with inline onBeforeHandle to avoid Elysia plugin deduplication
  const store = new Map<string, { count: number; resetAt: number }>();
  const MAX = 2;
  const WINDOW = 60_000;

  const app = new Elysia()
    .onBeforeHandle(({ request, set }) => {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + WINDOW });
        return;
      }

      entry.count++;

      if (entry.count > MAX) {
        set.status = 429;
        set.headers["Retry-After"] = String(
          Math.ceil((entry.resetAt - now) / 1000)
        );
        return { error: "Too many requests. Please try again later." };
      }
    })
    .get("/", () => "ok")
    .listen(0);

  const baseUrl = `http://${app.server!.hostname}:${app.server!.port}`;

  afterAll(() => app.stop());

  it("allows requests within limit then blocks", async () => {
    // First two requests should pass
    expect((await fetch(baseUrl)).status).toBe(200);
    expect((await fetch(baseUrl)).status).toBe(200);

    // Third request should be rate limited
    const res = await fetch(baseUrl);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });
});
