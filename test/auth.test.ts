import { describe, expect, it } from "bun:test";
import { createApp } from "../src/index";

const app = createApp();

describe("Auth endpoints", () => {
  it("GET /auth/login redirects to Discord OAuth", async () => {
    const res = await app.handle(new Request("http://localhost/auth/login"), {
      redirect: "manual",
    });

    expect(res.status).toBe(302);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("discord.com/api/oauth2/authorize");
    expect(location).toContain("scope=identify+guilds");
  });

  it("GET /auth/callback without code redirects with error", async () => {
    const res = await app.handle(
      new Request("http://localhost/auth/callback"),
      { redirect: "manual" }
    );

    expect(res.status).toBe(302);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("error=no_code");
  });

  it("POST /auth/logout clears token and returns success", async () => {
    const res = await app.handle(
      new Request("http://localhost/auth/logout", { method: "POST" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true });
  });
});
