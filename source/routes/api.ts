import { Elysia } from "elysia";
import { jwtPlugin } from "../services/jwt";
import { getManageableGuilds } from "../middleware/guildAdmin";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(jwtPlugin)
  .get("/me", async ({ jwt, cookie: { token }, set }) => {
    if (!token.value) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const payload = await jwt.verify(token.value as string);
    if (!payload) {
      set.status = 401;
      return { error: "Invalid token" };
    }

    try {
      const guilds = await getManageableGuilds(
        payload.userId as string,
        payload.accessToken as string
      );

      return {
        user: {
          id: payload.userId,
          username: payload.username,
          avatar: payload.avatar,
          globalName: payload.globalName,
        },
        guilds,
      };
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      set.status = 500;
      return { error: "Failed to fetch user data" };
    }
  });
