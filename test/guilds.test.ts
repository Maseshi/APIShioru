import { describe, expect, it } from "bun:test";
import { createApp } from "../src/server";

const app = createApp();

describe("Guild endpoints", () => {
  it("GET /api/guilds/:guildId without token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/guilds/123456789")
    );

    expect(res.status).toBe(401);
  });

  it("GET /api/guilds/:guildId/language without token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/guilds/123456789/language")
    );

    expect(res.status).toBe(401);
  });

  it("PUT /api/guilds/:guildId/language without token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/guilds/123456789/language", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "th" }),
      })
    );

    expect(res.status).toBe(401);
  });

  it("GET /api/guilds/:guildId/djs without token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/guilds/123456789/djs")
    );

    expect(res.status).toBe(401);
  });

  it("GET /api/guilds/:guildId/notification without token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/guilds/123456789/notification")
    );

    expect(res.status).toBe(401);
  });

  it("GET /api/guilds/:guildId/antibot without token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/guilds/123456789/antibot")
    );

    expect(res.status).toBe(401);
  });

  it("GET /api/guilds/:guildId/captcha without token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/guilds/123456789/captcha")
    );

    expect(res.status).toBe(401);
  });

  it("GET /api/guilds/:guildId/chat without token returns 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/guilds/123456789/chat")
    );

    expect(res.status).toBe(401);
  });
});
