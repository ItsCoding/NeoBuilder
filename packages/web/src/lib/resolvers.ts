import type { GlobalSection } from "@neobuilder/db";
import { defaultTheme, type ThemeTokens } from "@neobuilder/editor/src/theme";
import { getDataSource } from "./datasource";
import { getRedis } from "./redis";

export type ExternalRefs = {
  mediaIds: Set<string>;
  tableIds: Set<string>;
  sectionKeys: Set<string>;
};

export type MediaResolution = { id: string; url: string; alt?: string; variants?: { format: string; width: number; height: number; url: string }[] };
export type TableRowResolution = { id: string; data: Record<string, unknown> };
export type GlobalSectionResolution = { key: string; content?: unknown };

export type ResolutionMap = {
  media: Record<string, MediaResolution>;
  tables: Record<string, TableRowResolution[]>;
  sections: Record<string, GlobalSectionResolution>;
  theme: ThemeTokens;
};

function placeholderImageUrl(id: string) {
  const base = process.env.CDN_BASE_URL ?? "https://placehold.co";
  return `${base}/800x450?text=${encodeURIComponent(id)}`;
}

function placeholderRows(tableId: string, count = 4) {
  return Array.from({ length: count }).map((_, idx) => ({
    id: `${tableId}-${idx + 1}`,
    data: {
      name: `Row ${idx + 1}`,
      description: `Demo content for ${tableId}`,
      price: (idx + 1) * 10,
      media: { main: `${tableId}-media-${idx + 1}` },
    },
  } satisfies TableRowResolution));
}

async function fetchGlobalSection(workspaceId: string, key: string): Promise<GlobalSectionResolution | null> {
  try {
    const { GlobalSection } = await import("@neobuilder/db");
    const ds = await getDataSource();
    const repo = ds.getRepository(GlobalSection);
    const cached = await repo.findOne({ where: { key, workspace: { id: workspaceId } } });
    if (!cached) return null;
    return { key, content: cached.publishedContent ?? cached.draftContent ?? null };
  } catch (error) {
    console.warn(`[resolver] Failed to load global section ${key}:`, error);
    return null;
  }
}

export async function resolveExternalData(workspaceId: string, locale: string, refs: ExternalRefs): Promise<ResolutionMap> {
  const media: ResolutionMap["media"] = {};
  const tables: ResolutionMap["tables"] = {};
  const sections: ResolutionMap["sections"] = {};

  for (const mediaId of refs.mediaIds) {
    media[mediaId] = {
      id: mediaId,
      url: placeholderImageUrl(mediaId),
      alt: `Media asset ${mediaId}`,
      variants: [
        { format: "webp", width: 800, height: 450, url: placeholderImageUrl(`${mediaId}-webp`) },
        { format: "avif", width: 800, height: 450, url: placeholderImageUrl(`${mediaId}-avif`) },
      ],
    };
  }

  for (const tableId of refs.tableIds) {
    tables[tableId] = placeholderRows(tableId);
  }

  const redis = getRedis();
  for (const sectionKey of refs.sectionKeys) {
    const cacheKey = `section:${workspaceId}:${sectionKey}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        sections[sectionKey] = JSON.parse(cached) as GlobalSectionResolution;
        continue;
      }
    } catch {
      // cache miss or redis unavailable — fall through
    }

    const section = await fetchGlobalSection(workspaceId, sectionKey);
    if (section) {
      sections[sectionKey] = section;
      try {
        await redis.set(cacheKey, JSON.stringify(section), "EX", 300);
      } catch {
        // ignore cache write failure
      }
    }
  }

  const theme: ThemeTokens = defaultTheme;
  return { media, tables, sections, theme };
}
