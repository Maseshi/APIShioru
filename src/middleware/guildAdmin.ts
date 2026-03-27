import { db } from "../services/firebase";
import { fetchUserGuilds, type UserGuild } from "../services/discord";

const guildCache = new Map<
  string,
  { guilds: UserGuild[]; expiresAt: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getManageableGuilds = async (
  userId: string,
  accessToken: string
): Promise<UserGuild[]> => {
  const cached = guildCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.guilds;

  const userGuilds = await fetchUserGuilds(accessToken);

  // Filter to guilds where the bot is present
  const botGuildsSnapshot = await db.ref("guilds").once("value");
  const botGuildIds = botGuildsSnapshot.exists()
    ? Object.keys(botGuildsSnapshot.val())
    : [];

  const manageable = userGuilds.filter((g) => botGuildIds.includes(g.id));

  guildCache.set(userId, {
    guilds: manageable,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return manageable;
};

export const canManageGuild = async (
  userId: string,
  accessToken: string,
  guildId: string
): Promise<boolean> => {
  const guilds = await getManageableGuilds(userId, accessToken);
  return guilds.some((g) => g.id === guildId);
};
