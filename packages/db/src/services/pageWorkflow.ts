import { AppDataSource } from "../data-source";
import { Page, PageStatus } from "../entities/Page";
import { PageVersion } from "../entities/PageVersion";
import { IsNull, LessThanOrEqual, Not } from "typeorm";

async function ensureDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

async function nextVersionNumber(page: Page) {
  const repo = AppDataSource.getRepository(PageVersion);
  const latest = await repo.findOne({ where: { page }, order: { version: "DESC" } });
  return (latest?.version ?? 0) + 1;
}

export async function publishPage(options: {
  pageId: string;
  snapshotJson: unknown;
  createdBy?: string;
}) {
  await ensureDataSource();
  const pageRepo = AppDataSource.getRepository(Page);
  const versionRepo = AppDataSource.getRepository(PageVersion);

  const page = await pageRepo.findOne({ where: { id: options.pageId } });
  if (!page) throw new Error("Page not found");

  const versionNumber = await nextVersionNumber(page);

  const version = versionRepo.create({
    page,
    version: versionNumber,
    snapshotJson: options.snapshotJson ?? page.draftContent ?? page.publishedContent ?? {},
    createdBy: options.createdBy,
  });
  await versionRepo.save(version);

  page.status = "published" satisfies PageStatus;
  page.publishedContent = version.snapshotJson;
  page.scheduledPublishAt = null;
  page.deletedAt = null;

  return pageRepo.save(page);
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
