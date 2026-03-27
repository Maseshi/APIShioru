import { Elysia, t } from "elysia";
import { jwtPlugin } from "../services/jwt";
import { db } from "../services/firebase";
import { canManageGuild } from "../middleware/guildAdmin";

const guildGuard = async (
  jwt: any,
  token: any,
  guildId: string,
  set: any
): Promise<string | null> => {
  if (!token.value) {
    set.status = 401;
    return null;
  }

  const payload = await jwt.verify(token.value as string);
  if (!payload) {
    set.status = 401;
    return null;
  }

  const allowed = await canManageGuild(
    payload.userId as string,
    payload.accessToken as string,
    guildId
  );

  if (!allowed) {
    set.status = 403;
    return null;
  }

  return payload.userId as string;
};

export const guildRoutes = new Elysia({ prefix: "/api/guilds" })
  .use(jwtPlugin)
  // Get full guild config
  .get("/:guildId", async ({ jwt, cookie: { token }, params, set }) => {
    const userId = await guildGuard(jwt, token, params.guildId, set);
    if (!userId) return { error: "Forbidden" };

    const snapshot = await db
      .ref(`guilds/${params.guildId}`)
      .once("value");

    if (!snapshot.exists()) return { data: null };
    return { data: snapshot.val() };
  })

  // Get language settings
  .get(
    "/:guildId/language",
    async ({ jwt, cookie: { token }, params, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      const snapshot = await db
        .ref(`guilds/${params.guildId}/language`)
        .once("value");

      return {
        data: snapshot.exists()
          ? snapshot.val()
          : { type: "USER", locale: "en-US" },
      };
    }
  )

  // Update language settings
  .put(
    "/:guildId/language",
    async ({ jwt, cookie: { token }, params, body, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      await db.ref(`guilds/${params.guildId}/language`).update(body);
      return { success: true };
    },
    {
      body: t.Object({
        type: t.Optional(t.String()),
        locale: t.Optional(t.String()),
      }),
    }
  )

  // Get DJ settings
  .get("/:guildId/djs", async ({ jwt, cookie: { token }, params, set }) => {
    const userId = await guildGuard(jwt, token, params.guildId, set);
    if (!userId) return { error: "Forbidden" };

    const snapshot = await db
      .ref(`guilds/${params.guildId}/djs`)
      .once("value");

    return {
      data: snapshot.exists()
        ? snapshot.val()
        : { enable: false, only: false, roles: [], users: [] },
    };
  })

  // Update DJ settings
  .put(
    "/:guildId/djs",
    async ({ jwt, cookie: { token }, params, body, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      await db.ref(`guilds/${params.guildId}/djs`).update({
        ...(body as object),
        editedAt: new Date().toISOString(),
      });
      return { success: true };
    },
    {
      body: t.Object({
        enable: t.Optional(t.Boolean()),
        only: t.Optional(t.Boolean()),
        roles: t.Optional(t.Array(t.String())),
        users: t.Optional(t.Array(t.String())),
      }),
    }
  )

  // Get notification settings
  .get(
    "/:guildId/notification",
    async ({ jwt, cookie: { token }, params, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      const snapshot = await db
        .ref(`guilds/${params.guildId}/notification`)
        .once("value");

      return { data: snapshot.exists() ? snapshot.val() : {} };
    }
  )

  // Update notification settings for a specific event
  .put(
    "/:guildId/notification/:eventName",
    async ({ jwt, cookie: { token }, params, body, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      await db
        .ref(`guilds/${params.guildId}/notification/${params.eventName}`)
        .update(body as Record<string, unknown>);
      return { success: true };
    },
    {
      body: t.Object({
        enable: t.Optional(t.Boolean()),
        channelId: t.Optional(t.String()),
        content: t.Optional(t.String()),
        embed: t.Optional(
          t.Object({
            author: t.Optional(
              t.Object({
                name: t.Optional(t.String()),
                url: t.Optional(t.String()),
                iconURL: t.Optional(t.String()),
              })
            ),
            color: t.Optional(t.String()),
            title: t.Optional(t.String()),
            url: t.Optional(t.String()),
            description: t.Optional(t.String()),
            thumbnail: t.Optional(t.String()),
            fields: t.Optional(
              t.Array(
                t.Object({
                  name: t.Optional(t.String()),
                  value: t.Optional(t.String()),
                  inline: t.Optional(t.Boolean()),
                })
              )
            ),
            image: t.Optional(t.String()),
            timestamp: t.Optional(t.String()),
            footer: t.Optional(
              t.Object({
                text: t.Optional(t.String()),
                iconURL: t.Optional(t.String()),
              })
            ),
          })
        ),
      }),
    }
  )

  // Get anti-bot settings
  .get(
    "/:guildId/antibot",
    async ({ jwt, cookie: { token }, params, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      const snapshot = await db
        .ref(`guilds/${params.guildId}/antibot`)
        .once("value");

      return { data: snapshot.exists() ? snapshot.val() : null };
    }
  )

  // Update anti-bot settings
  .put(
    "/:guildId/antibot",
    async ({ jwt, cookie: { token }, params, body, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      await db.ref(`guilds/${params.guildId}/antibot`).update(body);
      return { success: true };
    },
    {
      body: t.Object({
        enable: t.Optional(t.Boolean()),
        all: t.Optional(t.Boolean()),
        bots: t.Optional(t.Array(t.String())),
      }),
    }
  )

  // Get captcha settings
  .get(
    "/:guildId/captcha",
    async ({ jwt, cookie: { token }, params, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      const snapshot = await db
        .ref(`guilds/${params.guildId}/captcha`)
        .once("value");

      return {
        data: snapshot.exists()
          ? snapshot.val()
          : { enable: false, text: "", role: "" },
      };
    }
  )

  // Update captcha settings
  .put(
    "/:guildId/captcha",
    async ({ jwt, cookie: { token }, params, body, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      await db.ref(`guilds/${params.guildId}/captcha`).update(body);
      return { success: true };
    },
    {
      body: t.Object({
        enable: t.Optional(t.Boolean()),
        text: t.Optional(t.String()),
        role: t.Optional(t.String()),
      }),
    }
  )

  // Get guild chat conversations
  .get(
    "/:guildId/chat",
    async ({ jwt, cookie: { token }, params, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      const snapshot = await db
        .ref(`guilds/${params.guildId}/chat`)
        .once("value");

      return {
        data: snapshot.exists()
          ? snapshot.val()
          : { conversations: [], alternatives: [] },
      };
    }
  )

  // Update guild chat conversations
  .put(
    "/:guildId/chat",
    async ({ jwt, cookie: { token }, params, body, set }) => {
      const userId = await guildGuard(jwt, token, params.guildId, set);
      if (!userId) return { error: "Forbidden" };

      await db.ref(`guilds/${params.guildId}/chat`).set(body);
      return { success: true };
    },
    {
      body: t.Object({
        conversations: t.Optional(
          t.Array(
            t.Object({
              prompts: t.Array(t.String()),
              replies: t.Array(t.String()),
              script: t.Optional(t.String()),
            })
          )
        ),
        alternatives: t.Optional(t.Array(t.String())),
      }),
    }
  );
