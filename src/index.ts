import { createApp } from "./server";

const app = createApp();

if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT);
  console.log(
    `🦊 Shioru API worker [pid: ${process.pid}] is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

export default app;
