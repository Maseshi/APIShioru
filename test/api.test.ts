import { describe, expect, it } from "bun:test";
import { createApp } from "../src/index";

const app = createApp();

describe("API endpoints", () => {
  it("GET /api/me without token returns 401", async () => {
    const res = await app.handle(new Request("http://localhost/api/me"));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("GET /api/me with invalid token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/me", {
        headers: { cookie: "token=invalid-jwt-token" },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Invalid token" });
  });
});
