import { AppDataSource } from "../data-source";
import { Page, PageStatus } from "../entities/Page";
import { PageVersion } from "../entities/PageVersion";
import { IsNull, LessThanOrEqual, Not } from "typeorm";
import { ensureDataSource, loadWorkspace } from "./base";

async function nextVersionNumber(page: Page) {
  const repo = AppDataSource.getRepository(PageVersion);
  const latest = await repo.findOne({ where: { page }, order: { version: "DESC" } });
  return (latest?.version ?? 0) + 1;
}

export async function publishPage(options: {
  pageId: string;
  snapshotJson?: unknown;
  createdBy?: string;
}) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  const versionRepo = AppDataSource.getRepository(PageVersion);

  const page = await pageRepo.findOne({ where: { id: options.pageId } });
  if (!page) throw new Error("Page not found");

  const versionNumber = await nextVersionNumber(page);
  const snapshot = options.snapshotJson ?? page.draftContent ?? page.publishedContent ?? {};

  const version = versionRepo.create({
    page,
    version: versionNumber,
    snapshotJson: snapshot,
    createdBy: options.createdBy,
  });
  await versionRepo.save(version);

  page.status = "published" satisfies PageStatus;
  page.publishedContent = snapshot;
  page.scheduledPublishAt = null;
  page.deletedAt = null;

  const saved = await pageRepo.save(page);
  return { page: saved, version };
}

export async function rollbackPageVersion(options: { pageId: string; version: number; createdBy?: string }) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  const versionRepo = AppDataSource.getRepository(PageVersion);

  const page = await pageRepo.findOne({ where: { id: options.pageId } });
  if (!page) throw new Error("Page not found");

  const targetVersion = await versionRepo.findOne({ where: { page, version: options.version } });
  if (!targetVersion) throw new Error("Version not found");

  const nextVersion = await nextVersionNumber(page);
  const rollbackVersion = versionRepo.create({
    page,
    version: nextVersion,
    snapshotJson: targetVersion.snapshotJson,
    createdBy: options.createdBy ?? "rollback",
  });
  await versionRepo.save(rollbackVersion);

  page.status = "published" satisfies PageStatus;
  page.publishedContent = targetVersion.snapshotJson;
  page.scheduledUnpublishAt = null;
  page.deletedAt = null;

  return pageRepo.save(page);
}

export async function renamePage(options: { pageId: string; title: string; slug: string }) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  const page = await pageRepo.findOne({ where: { id: options.pageId } });
  if (!page) throw new Error("Page not found");
  page.title = options.title;
  page.slug = options.slug;
  return pageRepo.save(page);
}

export async function changeStatus(options: { pageId: string; status: PageStatus }) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  const page = await pageRepo.findOne({ where: { id: options.pageId } });
  if (!page) throw new Error("Page not found");
  page.status = options.status;
  return pageRepo.save(page);
}

export async function softDeletePage(options: { pageId: string }) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  const page = await pageRepo.findOne({ where: { id: options.pageId } });
  if (!page) throw new Error("Page not found");
  page.deletedAt = new Date();
  page.status = "draft" satisfies PageStatus;
  return pageRepo.save(page);
}

export async function runScheduledPublishing(now = new Date()) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);

  const dueToPublish = await pageRepo.find({
    where: {
      status: "scheduled",
      scheduledPublishAt: LessThanOrEqual(now),
      deletedAt: IsNull(),
    },
  });

  for (const page of dueToPublish) {
    await publishPage({ pageId: page.id, snapshotJson: page.draftContent ?? page.publishedContent ?? {} });
  }

  const dueToUnpublish = await pageRepo.find({
    where: {
      status: "published",
      scheduledUnpublishAt: LessThanOrEqual(now),
      deletedAt: IsNull(),
    },
  });

  for (const page of dueToUnpublish) {
    page.status = "draft" satisfies PageStatus;
    await pageRepo.save(page);
  }
}

export async function findScheduleConflicts(workspaceId: string, slug: string) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  return pageRepo.find({
    where: {
      slug,
      deletedAt: IsNull(),
      workspace: { id: workspaceId },
      status: Not("draft"),
    },
    order: { scheduledPublishAt: "ASC" },
  });
}

export async function findPageBySlug(options: { workspaceId: string; slug: string }) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  return pageRepo.findOne({ where: { slug: options.slug, workspace: { id: options.workspaceId } } });
}

export async function findPageWithVersions(options: { workspaceId: string; slug: string }) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  const versionRepo = AppDataSource.getRepository(PageVersion);
  const page = await pageRepo.findOne({ where: { slug: options.slug, workspace: { id: options.workspaceId } } });
  if (!page) return null;
  const versions = await versionRepo.find({ where: { page }, order: { version: "DESC" } });
  return { page, versions };
}

type UpsertDraftOptions = {
  workspaceId: string;
  slug: string;
  title?: string;
  draftContent?: unknown;
  status?: PageStatus;
  scheduledPublishAt?: Date | null;
  scheduledUnpublishAt?: Date | null;
};

export async function upsertPageDraft(options: UpsertDraftOptions) {
  await ensureDataSource();
  const workspace = await loadWorkspace(options.workspaceId);
  const pageRepo = AppDataSource.getRepository(Page);

  let page = await pageRepo.findOne({ where: { slug: options.slug, workspace: { id: workspace.id } } });
  if (!page) {
    const slugTitle = options.slug.replace(/^\//, "").replace(/[-_]/g, " ");
    const fallbackTitle = options.title ?? (slugTitle || "Untitled page");
    page = pageRepo.create({
      workspace,
      slug: options.slug,
      title: fallbackTitle,
      status: options.status ?? "draft",
    });
  }

  if (options.title) page.title = options.title;
  if (options.draftContent !== undefined) page.draftContent = options.draftContent;
  if (options.status) page.status = options.status;
  if (options.scheduledPublishAt !== undefined) page.scheduledPublishAt = options.scheduledPublishAt;
  if (options.scheduledUnpublishAt !== undefined) page.scheduledUnpublishAt = options.scheduledUnpublishAt;

  page.deletedAt = null;

  return pageRepo.save(page);
}
