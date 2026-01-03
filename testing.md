# NeoBuilder E2E & Integration Test Plan

This document outlines end-to-end and integration suites for NeoBuilder based on the capabilities currently implemented. The focus is on realistic user flows across admin (packages/admin) and public web (packages/web) surfaces, backed by the shared DB and media services.

## Test Strategy & Tooling
- Runner: Playwright (UI-first with API helpers) plus Node test harness for background-job and cache verification.
- Environment: Docker Compose stack (Postgres 16, Redis 7, MinIO) started per test run with a test-specific database/schema and bucket prefix to isolate runs.
- Seeding: Minimal bootstrap fixture that creates a workspace, quota, demo user credentials, and sample pages/media/templates via TypeORM or admin APIs before UI steps.
- Isolation: Use unique `COMPOSE_PROJECT_NAME` and `DATABASE_NAME=neobuilder_e2e` per run; purge Redis keys with a test prefix.
- Artifacts: Video/screenshot on failure, HTML dumps for SSR responses, and console/network logs from Playwright.

## Infrastructure & Environment Suites
- **Compose stack boot**: Bring up `docker-compose.yml` with overrides for `POSTGRES_DB=neobuilder_e2e`, MINIO bucket name, and Redis URL; verify all containers are healthy.
- **Admin health**: Hit admin health endpoint and expect 200 to confirm server, DB, Redis connectivity.
- **Workspace bootstrap**: Ensure a workspace exists (create if missing) and quota row is present; assert default slug/id is picked up by admin and web contexts.
- **Secrets/env guardrails**: Validate required env keys (database, Redis, NextAuth secret, MinIO) are present via startup logs; fail fast if missing.

## Authentication & RBAC
- **Login flow**: Navigate to admin root, get redirected to sign-in, complete NextAuth credential login using demo env vars, land on dashboard with session cookie set.
- **Route protection**: Direct GET to protected route returns 302 to login when unauthenticated; API endpoints reject with 401/403 when missing session or lacking permissions.
- **Role matrix enforcement**: Use API calls to assert `assertPermission` rejects for disallowed action/resource combinations; sanity-check viewer vs editor/admin.

## Admin Shell & Navigation
- **Layout chrome**: Verify sidebar sections (Overview, Content, Data, Site, Design, Settings) render and navigate without client errors.
- **Workspace switcher stub**: Ensure workspace name placeholder renders; switching (if multiple workspaces seeded) reloads context and data lists.
- **Top bar actions**: Quick actions (Create page, Upload media) route correctly and preserve session.

## Pages & Publishing Workflow
- **Draft creation**: Create a new page via API/UI, ensure `draftContent` persisted and status `draft`.
- **Scheduling**: Set `scheduledPublishAt`/`scheduledUnpublishAt`, verify conflicts are rejected, calendar view reflects events, and `runScheduledPublishing` promotes/demotes on cron tick.
- **Publish & versioning**: Publish a page, assert PageVersion appended, status updated, published content stored; verify version list order and rollback restores prior snapshot with new version entry.
- **Rename/slug changes**: Update slug/title, confirm navigation updates and duplicates are prevented.
- **Soft delete**: Trigger soft delete, ensure `deletedAt` set and status reset to draft; 404 on public surface.
- **Preview (Draft Mode)**: Generate preview URL, request public page with Draft Mode on, banner visible, and draft content rendered while published content remains unchanged for normal requests.

## Craft Editor & Templates
- **Canvas load**: Open editor for a page, ensure block palette, layers tree, viewport switcher, and inspector render without hydration errors.
- **Block add/edit**: Insert a core block (heading/paragraph), change props, save draft; reload to confirm serialized state round-trips.
- **Global sections**: Insert a GlobalSection reference, publish, edit the section, and confirm public pages reflect updates without republish after cache purge.
- **Templates**: Use template gallery to create a page, save current page as template, and reuse it for a new page; verify snapshot persistence.
- **Theme tokens**: Change theme token values and confirm CSS variables applied in editor preview and SSR output.

## Media Library & Storage
- **Folder CRUD**: Create nested folders, rename/move assets across folders, confirm path updates.
- **Upload flow**: Drag/drop image, observe signed PUT to MinIO, call completion endpoint, and see status transition to ready with variants generated.
- **Tagging & filters**: Add tags on asset detail, filter by tag/type/search, ensure results match and usage counters increment when linked from pages.
- **Orphans & quota**: Enable orphan filter to surface unused assets; push uploads near quota and assert quota error surfaces and prevents upload.
- **Bulk actions**: Multi-select delete/download/move operations succeed and reflect in UI and DB.

## Settings, SEO, Redirects, Domains
- **SEO defaults & sitemap/robots editors**: Forms render, allow edits, and persist via API; sitemap/robots endpoints respond with updated content.
- **Redirect validation**: Create redirect with chain detection; invalid loops are blocked with error copy.
- **Domain wizard**: Domain entries persist and display verification status placeholders; canonicalization toggle reflects selection.

## Storage & Backups
- **Storage dashboard**: Usage widget reflects live stats from media usage; orphan cleanup action available.
- **Backup/restore UI**: Manual backup action triggers API call; restore flow shows confirmation guard and blocks without explicit confirm.

## Comments, Forms, Databases (Scaffolds)
- **Route presence**: Comments, forms, databases routes render placeholder tables/forms without client errors.
- **Navigation integrity**: Switching between these sections retains session and loads scaffolded content.

## Public Rendering & Caching
- **SSR path resolution**: Request published page path; expect HTML content rendered via Craft renderer, correct status codes for unpublished/scheduled pages.
- **Locale routing**: Access `/de/...` or `/fr/...` and verify locale selection and fallback behavior.
- **Cache hit/miss**: First request populates Redis cache; subsequent request serves cached HTML (timing/log assertion); cache bypass in Draft Mode.
- **Structured data & meta**: `<head>` contains title/description/OG/Twitter meta; JSON-LD script injected.
- **Interactive blocks**: Pages with interactive blocks load client bundle via ClientInteractions and hydrate without errors.

## Media Resolution in Public Site
- **CDN URLs & variants**: Rendered `<picture>` uses variant URLs from MinIO; missing media falls back gracefully and logs error without breaking page.
- **Usage tracking**: Rendering a page marks media usage and decrements orphan count accordingly.

## Background Jobs & Rate Limits
- **runScheduledPublishing**: Invoke job and assert scheduled pages publish/unpublish; log output captured.
- **Rate limiting**: Exceed thresholds on media upload or API endpoints and expect 429 with retry headers (if configured in the helper).

## Security & Error Handling
- **Authz errors**: Forbidden actions yield 403 JSON with message; UI shows toast without leaking stack traces.
- **Malformed input**: Invalid dates or status in page PATCH return 400; invalid mime types in upload return 400.
- **Graceful missing refs**: Deleted media/global sections referenced by a page render placeholders and log diagnostics instead of throwing.

## Non-Functional Checks
- **Performance budget**: Basic SSR render duration logged under threshold for simple pages; cache-hit latency <20ms.
- **Accessibility smoke**: Axe-core smoke in admin and public pages for common violations (missing alt, contrast) while respecting existing accessibility checker UI.

## Test Data & Fixtures
- Demo credentials via env: `NEOBUILDER_DEMO_USER`, `NEOBUILDER_DEMO_PASSWORD`.
- Workspace: seed `default` slug with quota 2GB.
- Sample content: one published page with hero block, one scheduled page, one draft, one global section (header), two templates, and at least two media assets with variants.

## Execution Order (happy-path suite)
1) Bring up infra and seed workspace/content/media.
2) Auth & navigation smoke.
3) Pages workflow (draft → publish → preview → rollback).
4) Media library CRUD + quota edge.
5) Craft editor interactions + templates/global sections.
6) Public SSR verification + cache behavior.
7) Background job + rate limit edges.
8) Cleanup: tear down compose project and delete test bucket/DB.

## Reporting
- Capture per-suite timing, pass/fail counts, flaky retries, and attach screenshots/video on failure.
- Export summarized junit for CI and artifact bundle (screenshots, HTML, logs) for triage.
