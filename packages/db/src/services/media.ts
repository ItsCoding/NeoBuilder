import { randomUUID } from "crypto";
import { extname } from "path";
import { Client as MinioClient } from "minio";
import sharp from "sharp";
import { lookup as lookupMime } from "mime-types";
import { getDataSource } from "../data-source";
import { MediaAsset, type MediaStatus } from "../entities/MediaAsset";
import { MediaFolder } from "../entities/MediaFolder";
import { MediaTag } from "../entities/MediaTag";
import { MediaVariant } from "../entities/MediaVariant";
import { MediaAssetTag } from "../entities/MediaAssetTag";
import { ensureDataSource, loadWorkspace, resolveWorkspaceQuota } from "./base";
import { Brackets, In } from "typeorm";

const ALLOWED_MIME_PREFIXES = ["image/", "video/", "audio/", "application/pdf"];
const DEFAULT_UPLOAD_LIMIT_BYTES = Number(process.env.MAX_UPLOAD_BYTES ?? 50 * 1024 * 1024);

let storageClient: any | null = null;

function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/-{2,}/g, "-");
}

function bucketName() {
  return process.env.MINIO_BUCKET ?? "neobuilder";
}

function getStorageClient() {
  if (storageClient) return storageClient;
  const endPoint = process.env.MINIO_ENDPOINT ?? "127.0.0.1";
  const port = Number(process.env.MINIO_PORT ?? 9000);
  storageClient = new MinioClient({
    endPoint,
    port,
    accessKey: process.env.MINIO_ACCESS_KEY ?? "minio",
    secretKey: process.env.MINIO_SECRET_KEY ?? "minio123",
    useSSL: process.env.MINIO_USE_SSL === "true",
  });
  return storageClient;
}

async function ensureBucket() {
  const client = getStorageClient();
  const bucket = bucketName();
  const exists = await client.bucketExists(bucket).catch(() => false);
  if (!exists) await client.makeBucket(bucket, "");
  return bucket;
}

async function resolveFolder(workspaceId: string, folderId?: string | null) {
  if (!folderId) return null;
  const ds = await getDataSource();
  const repo = ds.getRepository(MediaFolder);
  const folder = await repo.findOne({ where: { id: folderId, workspace: { id: workspaceId } } });
  if (!folder) throw new Error("Folder not found");
  return folder;
}

async function ensureTags(workspaceId: string, tagNames: string[] = []) {
  if (!tagNames.length) return [] as MediaTag[];
  const ds = await getDataSource();
  const repo = ds.getRepository(MediaTag);
  const existing = await repo.find({ where: { workspace: { id: workspaceId }, name: In(tagNames) } });
  const missing = tagNames.filter((name) => !existing.some((tag) => tag.name === name));
  const workspace = await loadWorkspace(workspaceId);
  const created = missing.map((name) => repo.create({ name, workspace }));
  if (created.length) await repo.save(created);
  return [...existing, ...created];
}

async function sumUsageBytes(workspaceId: string) {
  const ds = await getDataSource();
  const repo = ds.getRepository(MediaAsset);
  const raw = await repo
    .createQueryBuilder("asset")
    .select("COALESCE(SUM(asset.sizeBytes), 0)", "total")
    .where("asset.workspace_id = :workspaceId", { workspaceId })
    .getRawOne<{ total: string }>();
  return Number(raw?.total ?? 0);
}

async function assertWithinQuota(workspaceId: string, incomingBytes: number) {
  const { storageLimitMb } = await resolveWorkspaceQuota(workspaceId);
  const usedBytes = await sumUsageBytes(workspaceId);
  const limitBytes = storageLimitMb * 1024 * 1024;
  if (usedBytes + incomingBytes > limitBytes) {
    throw new Error("Storage quota exceeded for workspace");
  }
}

function ensureAllowedMime(mime: string) {
  const allowed = ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));
  if (!allowed) throw new Error(`Blocked mime type: ${mime}`);
}

function buildStorageKey(workspaceId: string, folder: MediaFolder | null, fileName: string) {
  const basePath = folder?.path ? folder.path.replace(/^\//, "") : "";
  const slug = sanitizeFileName(fileName || randomUUID());
  const prefix = basePath ? `${workspaceId}/${basePath}` : workspaceId;
  return `${prefix}/${randomUUID()}-${slug}`;
}

async function attachTags(asset: MediaAsset, tagNames: string[]) {
  const ds = await getDataSource();
  const tagRepo = ds.getRepository(MediaAssetTag);
  if (tagNames.length === 0) {
    await tagRepo.delete({ asset: { id: asset.id } as MediaAsset });
    return;
  }
  const tags = await ensureTags(asset.workspace.id, tagNames);
  await tagRepo.delete({ asset: { id: asset.id } as MediaAsset });
  const refs = tags.map((tag) => tagRepo.create({ asset, tag }));
  await tagRepo.save(refs);
}

export type SignedUpload = {
  asset: MediaAsset;
  uploadUrl: string;
  expiresIn: number;
};

export async function signMediaUpload(options: {
  workspaceId: string;
  fileName: string;
  mime: string;
  sizeBytes: number;
  folderId?: string | null;
  tags?: string[];
}) {
  const ds = await ensureDataSource();
  const mime = lookupMime(options.fileName) || options.mime;
  ensureAllowedMime(mime);
  if (options.sizeBytes > DEFAULT_UPLOAD_LIMIT_BYTES) throw new Error("File exceeds upload limit");
  await assertWithinQuota(options.workspaceId, options.sizeBytes);

  const workspace = await loadWorkspace(options.workspaceId);
  const folder = await resolveFolder(options.workspaceId, options.folderId);
  const assetRepo = ds.getRepository(MediaAsset);

  const cleanName = sanitizeFileName(options.fileName);
  const asset = assetRepo.create({
    workspace,
    folder,
    fileName: cleanName,
    storageKey: "pending",
    mime,
    sizeBytes: options.sizeBytes,
    status: "uploading" satisfies MediaStatus,
  });
  const saved = await assetRepo.save(asset);
  saved.storageKey = buildStorageKey(workspace.id, folder, cleanName);
  await assetRepo.save(saved);

  if (options.tags?.length) await attachTags(saved, options.tags);

  const bucket = await ensureBucket();
  const client = getStorageClient();
  const expiresIn = 15 * 60;
  const uploadUrl = await client.presignedPutObject(bucket, saved.storageKey, expiresIn, {
    "Content-Type": mime,
  });

  return { asset: saved, uploadUrl, expiresIn } as SignedUpload;
}

export async function completeMediaUpload(options: {
  assetId: string;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  alt?: string | null;
  tags?: string[];
}) {
  const ds = await ensureDataSource();
  const repo = ds.getRepository(MediaAsset);
  const asset = await repo.findOne({ where: { id: options.assetId }, relations: ["variants", "tagRefs", "tagRefs.tag"] });
  if (!asset) throw new Error("Asset not found");

  asset.width = options.width ?? asset.width ?? null;
  asset.height = options.height ?? asset.height ?? null;
  asset.durationMs = options.durationMs ?? asset.durationMs ?? null;
  asset.alt = options.alt ?? asset.alt ?? null;
  asset.status = "ready" satisfies MediaStatus;

  await repo.save(asset);
  if (options.tags) await attachTags(asset, options.tags);

  if (asset.mime.startsWith("image/")) {
    await generateVariantsForAsset(asset.id);
  }

  return repo.findOne({ where: { id: options.assetId }, relations: ["variants", "tagRefs", "tagRefs.tag"] });
}

export async function updateMediaAsset(options: { assetId: string; alt?: string | null; folderId?: string | null; tags?: string[] }) {
  const ds = await ensureDataSource();
  const repo = ds.getRepository(MediaAsset);
  const asset = await repo.findOne({ where: { id: options.assetId }, relations: ["workspace", "folder", "tagRefs", "tagRefs.tag"] });
  if (!asset) throw new Error("Asset not found");

  if (options.alt !== undefined) asset.alt = options.alt;
  if (options.folderId !== undefined) asset.folder = await resolveFolder(asset.workspace.id, options.folderId);
  await repo.save(asset);

  if (options.tags) await attachTags(asset, options.tags);
  return repo.findOne({ where: { id: asset.id }, relations: ["variants", "tagRefs", "tagRefs.tag", "folder"] });
}

export async function generateVariantsForAsset(assetId: string, sizes = [320, 640, 1280], formats: ("webp" | "avif")[] = ["webp", "avif"]) {
  const ds = await ensureDataSource();
  const assetRepo = ds.getRepository(MediaAsset);
  const variantRepo = ds.getRepository(MediaVariant);
  const asset = await assetRepo.findOne({ where: { id: assetId } });
  if (!asset) throw new Error("Asset not found");
  if (!asset.mime.startsWith("image/")) return asset;

  const bucket = await ensureBucket();
  const client = getStorageClient();
  const object = await client.getObject(bucket, asset.storageKey);
  const chunks: Buffer[] = [];
  for await (const chunk of object) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const buffer = Buffer.concat(chunks);
  const base = sharp(buffer);
  const meta = await base.metadata();

  const ratio = meta.width && meta.height ? meta.height / meta.width : 9 / 16;
  asset.width = meta.width ?? asset.width ?? null;
  asset.height = meta.height ?? asset.height ?? null;

  await variantRepo.delete({ asset: { id: asset.id } as MediaAsset });

  const variants: MediaVariant[] = [];
  const baseKey = asset.storageKey.replace(extname(asset.storageKey), "");

  for (const size of sizes) {
    const height = Math.round(size * ratio);
    for (const format of formats) {
      const resized = await base.clone().resize({ width: size }).toFormat(format).toBuffer();
      const key = `${baseKey}-${size}.${format}`;
      await client.putObject(bucket, key, resized, {
        "Content-Type": `image/${format}`,
      });
      variants.push(
        variantRepo.create({
          asset,
          variantType: `responsive-${size}`,
          format,
          width: size,
          height,
          storageKey: key,
          sizeBytes: resized.byteLength,
        }),
      );
    }
  }

  const thumb = await base.clone().resize({ width: 320 }).jpeg({ quality: 70 }).toBuffer();
  const thumbKey = `${baseKey}-thumb.jpg`;
  await client.putObject(bucket, thumbKey, thumb, { "Content-Type": "image/jpeg" });
  variants.push(
    variantRepo.create({
      asset,
      variantType: "thumb",
      format: "jpg",
      width: 320,
      height: Math.round(320 * ratio),
      storageKey: thumbKey,
      sizeBytes: thumb.byteLength,
    }),
  );

  await variantRepo.save(variants);
  await assetRepo.save(asset);
  return asset;
}

export type MediaListFilters = {
  workspaceId: string;
  folderId?: string | null;
  search?: string;
  tagNames?: string[];
  includeOrphans?: boolean;
  limit?: number;
};

export async function listMediaAssets(filters: MediaListFilters) {
  const ds = await ensureDataSource();
  const repo = ds.getRepository(MediaAsset);
  const qb = repo
    .createQueryBuilder("asset")
    .leftJoinAndSelect("asset.folder", "folder")
    .leftJoinAndSelect("asset.variants", "variant")
    .leftJoinAndSelect("asset.tagRefs", "tagRef")
    .leftJoinAndSelect("tagRef.tag", "tag")
    .where("asset.workspace_id = :workspaceId", { workspaceId: filters.workspaceId })
    .orderBy("asset.createdAt", "DESC");

  if (filters.folderId) qb.andWhere("asset.folder_id = :folderId", { folderId: filters.folderId });
  if (filters.includeOrphans) qb.andWhere("asset.usage_count = 0");
  if (filters.search) qb.andWhere(new Brackets((expr) => expr.where("asset.file_name ILIKE :q", { q: `%${filters.search}%` })));
  if (filters.tagNames?.length) qb.andWhere("tag.name IN (:...tagNames)", { tagNames: filters.tagNames });
  if (filters.limit) qb.take(filters.limit);

  const assets = await qb.getMany();
  return assets;
}

export async function listMediaFolders(workspaceId: string) {
  const ds = await ensureDataSource();
  const repo = ds.getRepository(MediaFolder);
  return repo.find({ where: { workspace: { id: workspaceId } }, order: { path: "ASC" } });
}

export async function createMediaFolder(options: { workspaceId: string; name: string; parentId?: string | null }) {
  const ds = await ensureDataSource();
  const folderRepo = ds.getRepository(MediaFolder);
  const workspace = await loadWorkspace(options.workspaceId);
  const parent = await resolveFolder(options.workspaceId, options.parentId);
  const slug = sanitizeFileName(options.name);
  const path = parent ? `${parent.path.replace(/\/$/, "")}/${slug}` : `/${slug}`;
  const folder = folderRepo.create({ name: options.name, path, workspace, parent });
  return folderRepo.save(folder);
}

export async function updateMediaFolder(options: { folderId: string; name?: string; parentId?: string | null }) {
  const ds = await ensureDataSource();
  const folderRepo = ds.getRepository(MediaFolder);
  const folder = await folderRepo.findOne({ where: { id: options.folderId }, relations: ["parent", "workspace"] });
  if (!folder) throw new Error("Folder not found");
  if (options.name) folder.name = options.name;
  if (options.parentId !== undefined) folder.parent = await resolveFolder(folder.workspace.id, options.parentId);
  const slug = sanitizeFileName(folder.name);
  const basePath = folder.parent ? folder.parent.path : "";
  folder.path = `${basePath}/${slug}`.replace(/\/{2,}/g, "/");
  return folderRepo.save(folder);
}

export async function deleteMediaAssets(assetIds: string[]) {
  const ds = await ensureDataSource();
  if (!assetIds.length) return;
  const repo = ds.getRepository(MediaAsset);
  const assets = await repo.find({ where: { id: In(assetIds) }, relations: ["variants"] });
  const bucket = await ensureBucket();
  const client = getStorageClient();
  const keys = assets.flatMap((asset) => [asset.storageKey, ...asset.variants.map((v) => v.storageKey)]);
  if (keys.length) await client.removeObjects(bucket, keys);
  await repo.remove(assets);
}

export async function markMediaUsage(assetIds: string[]) {
  if (!assetIds.length) return;
  const ds = await ensureDataSource();
  const repo = ds.getRepository(MediaAsset);
  const now = new Date();
  await repo
    .createQueryBuilder()
    .update()
    .set({ usageCount: () => "usage_count + 1", lastUsedAt: now })
    .where("id IN (:...assetIds)", { assetIds })
    .execute();
}

export async function listOrphanedAssets(workspaceId: string) {
  const ds = await ensureDataSource();
  const repo = ds.getRepository(MediaAsset);
  return repo.find({ where: { workspace: { id: workspaceId }, usageCount: 0 }, relations: ["variants", "folder"] });
}

export async function listMediaStats(workspaceId: string) {
  const usedBytes = await sumUsageBytes(workspaceId);
  const { storageLimitMb } = await resolveWorkspaceQuota(workspaceId);
  const orphanCount = (await listOrphanedAssets(workspaceId)).length;
  return {
    usedBytes,
    limitBytes: storageLimitMb * 1024 * 1024,
    orphanCount,
  };
}
