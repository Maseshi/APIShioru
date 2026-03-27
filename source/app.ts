import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { rateLimit } from "./middleware/rateLimit";
import { authRoutes } from "./routes/auth";
import { apiRoutes } from "./routes/api";
import { guildRoutes } from "./routes/guilds";

export const createApp = () =>
  new Elysia()
    .use(
      cors({
        origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
        credentials: true,
      })
    )
    .use(rateLimit(60, 60_000))
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET ?? "change-this-secret",
      })
    )
    .get("/", () => ({ status: "ok", name: "Shioru API" }))
    .get("/health", () => ({ status: "ok" }))
    .use(authRoutes)
    .use(apiRoutes)
    .use(guildRoutes);
