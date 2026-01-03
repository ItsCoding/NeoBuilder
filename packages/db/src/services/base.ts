import { getDataSource } from "../data-source";
import { Workspace } from "../entities/Workspace";
import { WorkspaceQuota } from "../entities/WorkspaceQuota";

const DEFAULT_STORAGE_LIMIT_MB = 2048;

export async function ensureDataSource() {
  return getDataSource();
}

export async function loadWorkspace(workspaceId: string) {
  const ds = await ensureDataSource();
  const repo = ds.getRepository(Workspace);
  const workspace = await repo.findOne({ where: { id: workspaceId } });
  if (!workspace) throw new Error("Workspace not found");
  return workspace;
}

export async function resolveWorkspaceQuota(workspaceId: string) {
  const ds = await ensureDataSource();
  const quotaRepo = ds.getRepository(WorkspaceQuota);
  const quota = await quotaRepo.findOne({ where: { workspace: { id: workspaceId } } });
  const storageLimitMb = quota?.storageLimitMb ?? DEFAULT_STORAGE_LIMIT_MB;
  return { storageLimitMb };
}
