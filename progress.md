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

## Phase 3 completion (visual builder + persistence)

- Completed Craft.js builder integration with block registry, templates, and page editor UI (palette, inspector, responsive viewport, templates/global sections).
- Added persistence APIs for pages: load by slug with versions, upsert draft snapshots, and publish snapshots to PageVersion + publishedContent fields.
- Expanded db package to include GlobalSection/PageTemplate entities in the data source and helper workflows for saving drafts and publishing versions.
- Added theme primitives (tokens + CSS variables) and wired the canvas/blocks to use them; exported theme helpers for consumers.
- Polished admin UX with global toasts and breadcrumb navigation across dashboard routes.

## Phase 4 completion (public rendering + APIs)

- Replaced the static web surface with a catch-all SSR route that resolves workspace/locale from host + path, respects publish windows/unpublish schedules, and supports Draft Mode rendering of draftContent.
- Added a Craft.js rendering pipeline (server-friendly block registry, template engine, external resolvers for media/tables/global sections) plus JSON-LD injection and theme CSS variable support.
- Implemented Redis-backed HTML caching with structured cache keys and purge helper, alongside performance timing breadcrumbs for render instrumentation.
- Introduced public API endpoints with rate limiting for calendar availability, form submissions (spam-aware), and site search; added lightweight client-side hydration for interactive blocks.
