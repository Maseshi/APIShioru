import { Elysia } from "elysia";
import { jwtPlugin } from "../services/jwt";
import { exchangeCode, fetchUser } from "../services/discord";

const DISCORD_AUTH_URL = "https://discord.com/api/oauth2/authorize";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .get("/login", ({ redirect }) => {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      response_type: "code",
      scope: "identify guilds",
    });

    return redirect(`${DISCORD_AUTH_URL}?${params}`);
  })
  .get("/callback", async ({ query, jwt, cookie: { token }, redirect }) => {
    const code = query.code;

    if (!code) {
      return redirect(`${process.env.FRONTEND_URL}?error=no_code`);
    }

    try {
      const { access_token } = await exchangeCode(code);
      const user = await fetchUser(access_token);

      const jwtToken = await jwt.sign({
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        globalName: user.global_name,
        accessToken: access_token,
      } as Record<string, string>);

      token.set({
        value: jwtToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error("OAuth2 callback error:", error);
      return redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }
  })
  .post("/logout", ({ cookie: { token } }) => {
    token.remove();
    return { success: true };
  });
