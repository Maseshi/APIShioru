import { describe, expect, it } from "bun:test";
import { createApp } from "../src/createApp";

const app = createApp();

describe("Health endpoints", () => {
  it("GET / returns API status", async () => {
    const res = await app.handle(new Request("http://localhost/"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ status: "ok", name: "Shioru API" });
  });

  it("GET /health returns ok", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ status: "ok" });
  });
});
