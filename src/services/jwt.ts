import { jwt } from "@elysiajs/jwt";
import { t } from "elysia";

export const jwtPlugin = jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET ?? "change-this-secret",
  schema: t.Object({
    userId: t.String(),
    username: t.String(),
    avatar: t.String(),
    globalName: t.String(),
    accessToken: t.String(),
  }),
});
