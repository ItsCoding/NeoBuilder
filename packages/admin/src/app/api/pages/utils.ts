export async function resolveWorkspaceId(searchParams: URLSearchParams, preferredId?: string) {
  const { AppDataSource, Workspace, ensureDataSource } = await import("@neobuilder/db");
  await ensureDataSource();
  const workspaceRepo = AppDataSource.getRepository(Workspace);
  const candidate = preferredId ?? searchParams.get("workspaceId") ?? process.env.DEFAULT_WORKSPACE_ID ?? undefined;

  if (candidate) {
    const existing = await workspaceRepo.findOne({ where: { id: candidate } });
    if (existing) return existing.id;
  }

  const fallback = await workspaceRepo.findOne({ where: {}, order: { createdAt: "ASC" } });
  if (fallback) return fallback.id;

  const created = workspaceRepo.create({ name: "Default Workspace", slug: "default" });
  const saved = await workspaceRepo.save(created);
  return saved.id;
}

export const decodeSlugParam = (slug: string) => decodeURIComponent(slug);
