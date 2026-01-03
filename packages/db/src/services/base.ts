import { AppDataSource } from "../data-source";
import { Workspace } from "../entities/Workspace";
import { WorkspaceQuota } from "../entities/WorkspaceQuota";

const DEFAULT_STORAGE_LIMIT_MB = 2048;

export async function ensureDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

export async function loadWorkspace(workspaceId: string) {
  await ensureDataSource();
  const repo = AppDataSource.getRepository(Workspace);
  const workspace = await repo.findOne({ where: { id: workspaceId } });
  if (!workspace) throw new Error("Workspace not found");
  return workspace;
}

export async function resolveWorkspaceQuota(workspaceId: string) {
  await ensureDataSource();
  const quotaRepo = AppDataSource.getRepository(WorkspaceQuota);
  const quota = await quotaRepo.findOne({ where: { workspace: { id: workspaceId } } });
  const storageLimitMb = quota?.storageLimitMb ?? DEFAULT_STORAGE_LIMIT_MB;
  return { storageLimitMb };
}
