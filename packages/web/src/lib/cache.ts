import { getRedis } from "./redis";

export type PageCacheEntry = {
  html: string;
  diagnostics?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type CacheKeyInput = { workspaceId: string; slug: string; locale: string; draft: boolean };

const defaultTtl = Number(process.env.PAGE_CACHE_TTL_SECONDS ?? 300);

export function buildPageCacheKey({ workspaceId, slug, locale, draft }: CacheKeyInput) {
  const trimmedSlug = slug.replace(/\/+$/, "") || "/";
  return `page:${workspaceId}:${locale}:${trimmedSlug}:draft:${draft ? "1" : "0"}`;
}

export async function getCachedPageHtml(key: string) {
  const redis = getRedis();
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PageCacheEntry;
  } catch (error) {
    console.warn("Failed to parse cached HTML", error);
    return null;
  }
}

export async function setCachedPageHtml(key: string, value: PageCacheEntry, ttlSeconds = defaultTtl) {
  const redis = getRedis();
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function purgeCachedPage(workspaceId: string, slug: string, locale: string) {
  const redis = getRedis();
  const base = slug.replace(/\/+$/, "") || "/";
  const keys = [
    buildPageCacheKey({ workspaceId, slug: base, locale, draft: false }),
    buildPageCacheKey({ workspaceId, slug: base, locale, draft: true }),
  ];
  for (const key of keys) {
    await redis.del(key);
  }
  // Placeholder for CDN purge hook
  console.info(`[cache] Purged keys for ${workspaceId} ${base}`);
}
