import type { GlobalSection } from "@neobuilder/db";
import { MediaAsset, markMediaUsage } from "@neobuilder/db";
import { defaultTheme, type ThemeTokens } from "@neobuilder/editor/src/theme";
import { In } from "typeorm";
import { getDataSource } from "./datasource";
import { getRedis } from "./redis";

export type ExternalRefs = {
  mediaIds: Set<string>;
  tableIds: Set<string>;
  sectionKeys: Set<string>;
};

export type MediaResolution = {
  id: string;
  url: string;
  alt?: string;
  mime?: string;
  variants?: { format: string; width?: number | null; height?: number | null; url: string }[];
};
export type TableRowResolution = { id: string; data: Record<string, unknown> };
export type GlobalSectionResolution = { key: string; content?: unknown };

export type ResolutionMap = {
  media: Record<string, MediaResolution>;
  tables: Record<string, TableRowResolution[]>;
  sections: Record<string, GlobalSectionResolution>;
  theme: ThemeTokens;
};

const cdnBase = (process.env.CDN_BASE_URL ?? process.env.MINIO_PUBLIC_URL ?? "").replace(/\/$/, "");

function placeholderImageUrl(id: string) {
  const base = cdnBase || "https://placehold.co";
  return `${base}/800x450?text=${encodeURIComponent(id)}`;
}

function buildCdnUrl(storageKey: string) {
  if (!cdnBase) return placeholderImageUrl(storageKey);
  const trimmed = cdnBase.replace(/\/$/, "");
  return `${trimmed}/${storageKey}`;
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

async function fetchMediaAssets(workspaceId: string, mediaIds: Set<string>) {
  const media: ResolutionMap["media"] = {};
  if (!mediaIds.size) return media;

  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(MediaAsset);
    const assets = await repo.find({
      where: { id: In(Array.from(mediaIds)), workspace: { id: workspaceId } },
      relations: ["variants"],
    });

    for (const asset of assets) {
      media[asset.id] = {
        id: asset.id,
        url: buildCdnUrl(asset.storageKey),
        alt: asset.alt ?? asset.fileName,
        mime: asset.mime,
        variants: (asset.variants ?? []).map((variant) => ({
          format: variant.format,
          width: variant.width,
          height: variant.height,
          url: buildCdnUrl(variant.storageKey),
        })),
      };
    }

    const missing = Array.from(mediaIds).filter((id) => !media[id]);
    for (const id of missing) {
      media[id] = { id, url: placeholderImageUrl(id), alt: `Media asset ${id}` };
    }

    await markMediaUsage(Array.from(mediaIds)).catch(() => undefined);
  } catch (error) {
    console.warn("[resolver] Failed to load media assets", error);
    for (const id of mediaIds) {
      media[id] = { id, url: placeholderImageUrl(id), alt: `Media asset ${id}` };
    }
  }

  return media;
}

export async function resolveExternalData(workspaceId: string, locale: string, refs: ExternalRefs): Promise<ResolutionMap> {
  const tables: ResolutionMap["tables"] = {};
  const sections: ResolutionMap["sections"] = {};

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

  const media = await fetchMediaAssets(workspaceId, refs.mediaIds);
  const theme: ThemeTokens = defaultTheme;
  return { media, tables, sections, theme };
}
