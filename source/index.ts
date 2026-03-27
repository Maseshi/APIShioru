import { createApp } from "./app";

const PORT = Number(process.env.PORT) || 3000;

const app = createApp().listen(PORT);

console.log(
  `🦊 Shioru API worker [pid: ${process.pid}] is running at ${app.server?.hostname}:${app.server?.port}`
);
