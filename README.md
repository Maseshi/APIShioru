# Shioru API

Backend API for [Shioru](https://shiorus.web.app/) dashboard — handles Discord OAuth2 authentication and guild configuration management.

Built with [Elysia](https://elysiajs.com/) + [Bun](https://bun.sh/) + [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup).

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- A [Discord application](https://discord.com/developers/applications) with OAuth2 configured
- A [Firebase](https://firebase.google.com/) project with Realtime Database

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DISCORD_CLIENT_ID` | Discord OAuth2 client ID | — |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 client secret | — |
| `DISCORD_REDIRECT_URI` | OAuth2 callback URL | `http://localhost:3000/auth/callback` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account (JSON string or file path) | — |
| `DATABASE_URL` | Firebase Realtime Database URL | — |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `FRONTEND_URL` | Frontend URL for CORS and redirects | `http://localhost:5173` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Development

```bash
bun run dev
```

The server starts at http://localhost:3000 with hot reload enabled.

## API Endpoints

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | API status |
| `GET` | `/health` | Health check |

### Authentication (`/auth`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/auth/login` | Initiate Discord OAuth2 flow |
| `GET` | `/auth/callback` | OAuth2 callback handler |
| `POST` | `/auth/logout` | Clear auth cookie |

### User (`/api`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/me` | Get authenticated user info and manageable guilds |

### Guild Configuration (`/api/guilds`)

All guild routes require authentication and `MANAGE_GUILD` permission.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/guilds/:guildId` | Get full guild config |
| `GET` | `/api/guilds/:guildId/language` | Get language settings |
| `PUT` | `/api/guilds/:guildId/language` | Update language settings |
| `GET` | `/api/guilds/:guildId/djs` | Get DJ settings |
| `PUT` | `/api/guilds/:guildId/djs` | Update DJ settings |
| `GET` | `/api/guilds/:guildId/notification` | Get notification settings |
| `PUT` | `/api/guilds/:guildId/notification/:eventName` | Update notification event |
| `GET` | `/api/guilds/:guildId/antibot` | Get anti-bot settings |
| `PUT` | `/api/guilds/:guildId/antibot` | Update anti-bot settings |
| `GET` | `/api/guilds/:guildId/captcha` | Get captcha settings |
| `PUT` | `/api/guilds/:guildId/captcha` | Update captcha settings |
| `GET` | `/api/guilds/:guildId/chat` | Get chat conversations |
| `PUT` | `/api/guilds/:guildId/chat` | Update chat conversations |

## Project Structure

```
src/
├── index.ts             # Server entry point
├── routes/
│   ├── auth.ts          # Authentication endpoints
│   ├── api.ts           # User API endpoints
│   └── guilds.ts        # Guild configuration endpoints
├── middleware/
│   ├── guildAdmin.ts    # Guild authorization & caching
│   └── rateLimit.ts     # Rate limiting
└── services/
    ├── discord.ts       # Discord OAuth2 & API
    ├── firebase.ts      # Firebase Realtime Database
    └── jwt.ts           # JWT configuration
```

## License

This project is licensed under the [MIT License](LICENSE).
