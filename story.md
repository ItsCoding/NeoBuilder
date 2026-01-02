NeoBuilder — Small Business Website Builder & CMS
-------------------------------------------------

Goal
- Build a Next.js + TypeScript CMS that lets small businesses (shops/restaurants/hotels) create and publish sites via a visual block editor (Easyblocks) with drafts, preview, and rollback.

Who it serves
- Non-technical owners/managers who need: page creation, visual layout, media library, custom data (tables), forms, comments, themes, and plugins to extend functionality.

Key capabilities (from discussion + architect)
- Visual editor (Easyblocks) with core blocks: paragraph, headings, grid, repeatable grid/list (table-bound), cards, callouts, carousel, table, media embed, media gallery (folder/table-bound), accordion, modal, links, buttons, chips, divider.
- High-level blocks and templates: split hero, product list/carousel, pre-themed galleries, design templates via Easyblocks templates.
- Media management: S3-compatible (self-hosted MinIO); folders (nested), tags (free-form autocomplete), CRUD; uploads via backend-mediated flow (no direct public S3); variants (sharp), optional video thumbs (ffmpeg).
- Custom databases: user-defined tables/fields; field types text/number/enum-select/boolean/date/time/datetime/media link; JSONB row storage; Zod validation; query/filter/sort; bind to repeatable blocks with template placeholders.
- Auth & roles: NextAuth; users can be workspace admins (invite/manage accounts per workspace); global admins can create workspaces and workspace admins. SSO deferred.
- RBAC: resource/action rules used in admin/API middleware.
- Drafts/publishing/version history: autosave drafts, explicit publish/unpublish, version list + rollback; audit metadata.
- Preview: Next.js Draft Mode; signed preview links; banner in preview.
- Navigation & site settings: menus (header/footer), redirects, SEO defaults (title/description/OG image).
- Plugins/themes: build-time plugins in repo under plugins/<name> with index.ts + plugin.json manifest; plugins can add blocks, field types, admin pages, hooks; themes as token packs + CSS/Tailwind presets and block variants.
- Forms & comments: moderation/spam defense (Turnstile server validation; optional Akismet); contact form block.
- Observability & ops: Sentry, rate limiting, audit log, backups; Redis for queues/cache/rate limit; optional bullmq; deployment playbook.

Architecture
- Two surfaces: public site (SSR/SSG/ISR) and admin app (auth + RBAC + Easyblocks editor page).
- Monorepo (Turborepo + pnpm): apps/admin, apps/web, packages/core, db (Prisma), ui, editor, plugins/*, themes/*, tooling configs.
- Data modeling highlights: Workspace, Site, Domain; Page + PageVersion; BuilderDocument (draft/published); MediaAsset/Folder/Tag/Variant; TableDefinition/FieldDefinition/Row; FormDefinition/Submission; CommentThread/Comment.
- Storage: PostgreSQL + Prisma; JSONB for dynamic row data; Redis optional; MinIO for media (backend handles signed uploads/ingest).

Constraints & considerations
- Plugin loading is build-time only (Next.js bundling + security). Marketplace = install package + redeploy.
- Theming via Easyblocks tokens mapped to CSS variables/Tailwind.
- External references in Easyblocks documents: store IDs for media/table rows and resolve at render time.
- Spam defense mandatory for comments/forms; abuse controls and rate limits required.
- Multi-tenancy: every entity scoped by workspaceId (and optionally siteId); domain mapping.

Implementation plan (raw, phased)

Phase 1 — Foundation & scaffolding
- [ ] Create Turborepo monorepo (apps/admin, apps/web, packages/*) with pnpm workspaces.
- [ ] Add shared tooling: ESLint, Prettier, TS configs, CI, commit hooks.
- [ ] Set up local PostgreSQL and general deployment using Docker Compose (define services for Postgres, and any other required infrastructure; document usage for local dev and production-like environments).
- [ ] Add Prisma in packages/db with baseline models: User, Workspace, WorkspaceMember, Role.
- [ ] Implement authentication with Auth.js/NextAuth (App Router route handlers) and protect /admin/**.
- [ ] Add RBAC scaffolding: permission model, can(user, action, resource) helper, admin route guards via middleware.
- [ ] Set up admin UI kit: Tailwind, shadcn/ui + Radix primitives.
- [ ] Add Sentry early.

Phase 2 — Core CMS entities (pages, publishing workflow, preview)
- [ ] Define page model: Page { id, workspaceId, slug, title, status, createdAt, updatedAt }; PageVersion { pageId, version, snapshotJson, createdBy, createdAt }.
- [ ] Admin flows: list/create/rename/change slug/delete (soft delete); status changes draft ↔ published.
- [ ] Versioning: create PageVersion on publish; rollback; show who/when/version.
- [ ] Preview: Next.js Draft Mode; signed preview URL; banner + exit preview.
- [ ] Site settings: SEO defaults, navigation menus, redirects.

Phase 3 — Visual builder (Easyblocks) + basic block library
- [ ] Integrate Easyblocks: editor page in apps/admin mounting EasyblocksEditor; packages/editor for config + block registry.
- [ ] Document persistence: DB tables for drafts/published; optional Easyblocks cloud backend for prototyping.
- [ ] Core blocks: paragraph, headings, grid, repeatable grid/list (table-bound), cards, callouts, carousel, table, media embed, media gallery, accordion, modal, links, buttons, chips, divider.
- [ ] Theming primitives: define Easyblocks tokens for color/font/space; map to CSS variables/Tailwind.
- [ ] Rendering pipeline in apps/web: fetch published page + document JSON; render React tree; support responsive styling + tokens.

Phase 4 — Media management (folders, tags, CRUD) + editor integration
- [ ] DB: MediaFolder { id, workspaceId, parentId, name, path }; MediaAsset { id, workspaceId, folderId, storageKey, mime, size, width, height, duration, alt, createdAt }; MediaTag { id, workspaceId, name } + join table.
- [ ] Admin UI: folder tree; asset grid/list; drag/drop move; tag autocomplete.
- [ ] Uploads: backend-signed uploads to self-hosted MinIO (no public direct upload); enforce mime/size/quotas.
- [ ] Processing: background jobs for thumbnails/responsive variants; store variant metadata.
- [ ] Easyblocks integration: media picker widget; store mediaId in documents; render via CDN URL + variants.

Phase 5 — Custom databases (user-defined tables/fields) + data-bound blocks
- [ ] Data model: TableDefinition { id, workspaceId, name, slug }; FieldDefinition { id, tableId, key, label, type, required, configJson }; Row { id, tableId, dataJson, createdAt, updatedAt }.
- [ ] Field type registry: text, number, enum/select, boolean, date, time, datetime, media link; each defines editor component, Zod builder, serialize/deserialize, optional indexing hints.
- [ ] Admin UI: table builder; row CRUD with generated forms; filtering/sorting.
- [ ] Validation: generate Zod schema per table definition; validate row writes.
- [ ] Bind to visual blocks: repeatable selectors (pick table, query filter/sort/limit, template strings {{name}}, {{price}}, {{media.main}}); placeholder resolver; media link rendering.
- [ ] Performance: JSONB indexes for key fields; optional denormalized search view.

Phase 6 — Plugins, themes, high-level blocks, and product hardening
- [ ] Plugin system v1 (build-time): plugin manifest + register() API; contributions for blocks/templates, field types, admin pages/settings, server hooks (publish, form submit); load from packages/plugins/*; compatibility rules.
- [ ] Theme system: packages exporting Easyblocks token sets, CSS variables/Tailwind presets, block style variants; per-site theme selection.
- [ ] High-level blocks + starter designs: split variants, product list/carousel (table-bound), pre-themed gallery/slider, design templates gallery.
- [ ] Comments + contact forms (plugins): moderation queue; approve/spam/trash; threading optional; spam defense (Turnstile server-side, optional Akismet).
- [ ] Production hardening: audit log; rate limiting + abuse controls; E2E tests (Playwright) for publish/preview/upload; backups/retention; deployment playbook (domains, env vars, migrations, storage).
