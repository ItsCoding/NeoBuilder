## Phase 1 completion (admin + infra)

- Bootstrapped npm workspaces monorepo with packages for admin, web, core, ui, db, and editor placeholders; added shared TS project references.
- Tooling in place: ESLint/Prettier configs, husky + lint-staged hook, GitHub Actions CI for lint/typecheck.
- Added docker-compose stack (Postgres 16, Redis 7, MinIO) and documented usage in README along with scripts and shadcn manual note.
- Created TypeORM-based db package with baseline entities (User, Workspace, WorkspaceMember, Role, WorkspaceQuota) and DataSource wiring.
- Admin app scaffolded with Next.js (App Router), NextAuth credentials demo, middleware-protected routes, RBAC helper, sample protected API route, Tailwind setup (UI kit foundation), and rate limiting via Redis helper; Sentry configs wired for admin/web.
- Public web app scaffolded (Next.js) with Sentry wiring and env example; shared UI primitives (Button) and core utilities (RBAC, rate limiting) exposed for reuse.

## Phase 2 completion (core CMS, publishing, preview)

- Added Page and PageVersion entities with scheduling fields and soft-delete timestamp; registered in the datasource.
- Implemented page workflow helpers (publish, rollback, rename/slug, soft delete, conflict finder) plus cron-friendly runner for auto-publish/unpublish.
- Upgraded admin shell to a collapsible, responsive layout with full navigation coverage across content/data/site/design/settings sections.
- Built Pages list, version sidebar + diff stub, calendar schedule view, template selector, and new page form with SEO/canonical/redirect validation prompts.
- Added settings scaffolds for SEO (meta/sitemap/robots/structured data + score checks), navigation/redirect validation, domains (DNS + staging/preview rows), backups (history + pre-flight backup note), and storage (quota/orphan cleanup block upload notice).
- Added placeholders for remaining admin sections (sections, media, databases, forms, comments, analytics, redirects, themes, templates) to keep routing unblocked.
- Wired preview flow in web app with draft mode banner and preview/exit API routes.
