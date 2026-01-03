import type { Workspace } from "@neobuilder/db";
import { getDataSource } from "./datasource";

export type WorkspaceContext = {
  workspace: Workspace;
  locale: string;
  slugPath: string;
  host: string;
};

const defaultLocale = process.env.DEFAULT_LOCALE ?? "en";
const supportedLocales = (process.env.SUPPORTED_LOCALES ?? "en,de,fr").split(",").map((loc) => loc.trim()).filter(Boolean);

function extractLocale(slugSegments: string[] | undefined) {
  const [maybeLocale, ...rest] = slugSegments ?? [];
  if (maybeLocale && supportedLocales.includes(maybeLocale)) {
    return { locale: maybeLocale, segments: rest };
  }
  return { locale: defaultLocale, segments: slugSegments ?? [] };
}

async function getWorkspaceRepository() {
  const { Workspace } = await import("@neobuilder/db");
  const ds = await getDataSource();
  return ds.getRepository(Workspace);
}

async function findWorkspaceBySlugOrId(value: string) {
  const repo = await getWorkspaceRepository();
  const byId = await repo.findOne({ where: { id: value } });
  if (byId) return byId;
  return repo.findOne({ where: { slug: value } });
}

function deriveSlugFromHost(host: string) {
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  if (isLocalhost) return process.env.DEFAULT_WORKSPACE_SLUG ?? null;
  const [subdomain] = host.split(".");
  if (!subdomain || subdomain === "www") return process.env.DEFAULT_WORKSPACE_SLUG ?? null;
  return subdomain;
}

export async function resolveWorkspaceContext(params: { host: string; slugSegments?: string[]; workspaceHint?: string }) {
  const { locale, segments } = extractLocale(params.slugSegments);
  const slugPath = `/${segments.join("/")}`.replace(/\/$/, "") || "/";

  const hint = params.workspaceHint ?? process.env.DEFAULT_WORKSPACE_ID ?? process.env.DEFAULT_WORKSPACE_SLUG ?? deriveSlugFromHost(params.host);
  if (!hint) return null;

  const workspace = await findWorkspaceBySlugOrId(hint);
  if (!workspace) return null;

  return { workspace, locale, slugPath, host: params.host } satisfies WorkspaceContext;
}
