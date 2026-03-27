const DISCORD_API = "https://discord.com/api/v10";
const MANAGE_GUILD = 0x20;

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  global_name: string | null;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
}

export interface UserGuild {
  id: string;
  name: string;
  icon: string | null;
}

export const exchangeCode = async (code: string) => {
  const response = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord token exchange failed: ${response.status}`);
  }

  return response.json() as Promise<{ access_token: string }>;
};

export const fetchUser = async (
  accessToken: string
): Promise<DiscordUser> => {
  const response = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Discord user fetch failed: ${response.status}`);
  }

  return response.json() as Promise<DiscordUser>;
};

export const fetchUserGuilds = async (
  accessToken: string
): Promise<UserGuild[]> => {
  const response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Discord guilds fetch failed: ${response.status}`);
  }

  const guilds = (await response.json()) as DiscordGuild[];

  return guilds
    .filter((g) => (parseInt(g.permissions) & MANAGE_GUILD) === MANAGE_GUILD)
    .map((g) => ({ id: g.id, name: g.name, icon: g.icon }));
};
