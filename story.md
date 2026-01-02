NeoBuilder — Small Business Website Builder & CMS
-------------------------------------------------

Goal
- Build a Next.js + TypeScript CMS that lets small businesses (shops/restaurants/hotels) create and publish sites via a visual block editor (Easyblocks) with drafts, preview, and rollback.

Who it serves
- Non-technical owners/managers who need: page creation, visual layout, media library, custom data (tables), forms, comments, themes, and plugins to extend functionality.

Key capabilities (from discussion + architect + core review)
- Visual editor (Easyblocks) with core blocks: paragraph, headings, grid, repeatable grid/list (table-bound), cards, callouts, carousel, table, media embed, media gallery (folder/table-bound), accordion, modal, links, buttons, chips, divider.
- High-level blocks and templates: split hero, product list/carousel, pre-themed galleries, design templates via Easyblocks templates.
- Global sections: reusable header/footer/banner components that update across all pages; edit once, applies everywhere.
- Template library: pre-built page templates (homepage, about, contact, menu); page cloning; save-as-template for workspace-specific reuse.
- Media management: S3-compatible (self-hosted MinIO); folders (nested), tags (free-form autocomplete), CRUD; uploads via backend-mediated flow (no direct public S3); variants (sharp) with WebP/AVIF auto-conversion; optional video thumbs (ffmpeg); lazy loading; storage quota per workspace with usage dashboard; orphan detection.
- Custom databases: user-defined tables/fields; field types text/number/enum-select/boolean/date/time/datetime/media link; JSONB row storage with GIN indexes; Zod validation; query/filter/sort; bind to repeatable blocks with template placeholders.
- Auth & roles: NextAuth; users can be workspace admins (invite/manage accounts per workspace); global admins can create workspaces and workspace admins. SSO deferred.
- RBAC: resource/action rules used in admin/API middleware; granular per-IP and per-workspace rate limiting.
- Drafts/publishing/version history: autosave drafts, explicit publish/unpublish, scheduled publish/unpublish dates with cron job, version list + rollback with visual diff comparison; audit metadata.
- Preview: Next.js Draft Mode; signed preview links; banner in preview; mobile/tablet/desktop viewport switcher in editor.
- Navigation & site settings: menus (header/footer), redirects with chain validation, comprehensive SEO (per-page meta, auto-generated XML sitemap, robots.txt, canonical URLs, structured data/JSON-LD, SEO score checker in editor).
- Multi-language/localization (i18n): per-page translations with PageTranslation table; language switcher; translation status indicators; fallback to default; routing via /en/about, /de/about.
- Site search: PostgreSQL full-text search for published pages, custom database rows, media; search analytics (track what users search for).
- Visual form builder: drag/drop fields (text, email, phone, select, radio, checkbox, file upload, date picker); conditional logic; notifications (workspace admin + auto-reply); submission storage + CSV export; spam defense (Turnstile + honeypot).
- Booking/reservation system: availability calendar, time slot selection, capacity limits, confirmation flow, admin calendar view.
- Plugins/themes: build-time plugins in repo under plugins/<name> with index.ts + plugin.json manifest; plugins can add blocks, field types, admin pages, hooks; themes as token packs + CSS/Tailwind presets and block variants.
- Comments: moderation queue (approve/spam/trash); spam defense (Turnstile server validation; optional Akismet).
- Domain management: connection wizard with DNS verification checks, domain mapping, www canonicalization.
- Backup & restore: user-facing "download site export" (JSON/ZIP with media), "restore from backup", auto-backup before bulk operations.
- Staging environments: per-workspace staging site (separate subdomain); clone production → staging; test changes; promote staging → production.
- Accessibility checker: real-time checks in editor (missing alt text, low contrast, heading hierarchy, empty links) using axe-core.
- Performance monitoring: Lighthouse score tracking per page on publish; LCP/FID/CLS metrics; warnings if score drops.
- Analytics: GDPR-compliant privacy-first analytics (no cookies, no personal data, no tracking across sites); pageview tracking, referrer sources, popular pages, device/browser stats, geographic data (country-level only); real-time visitor count; custom event tracking for form submissions, button clicks; all data aggregated and anonymized; no user identification; respects DNT headers; self-hosted to ensure data sovereignty.
- Observability & ops: Sentry, granular rate limiting (per-IP, per-workspace), audit log, backups/retention; Redis for SSR cache/queues/rate limit; BullMQ for background jobs; deployment playbook; caching strategy (SSR with Redis + CDN edge cache, purge-on-publish, client-side fetching for dynamic data).

Architecture
- Two surfaces: public site (SSR with selective client-side fetching) and admin app (auth + RBAC + Easyblocks editor page).
- Rendering strategy: Pure SSR for page content, metadata, and SEO; client-side fetching only for highly dynamic data (booking calendars, real-time availability). No SSG/ISR since this is multi-tenant SaaS.
- Monorepo (Turborepo + pnpm): apps/admin, apps/web, packages/core, db (Prisma), ui, editor, plugins/*, themes/*, tooling configs.
- Data modeling highlights: Workspace, Site, Domain; Page + PageVersion; BuilderDocument (draft/published); MediaAsset/Folder/Tag/Variant; TableDefinition/FieldDefinition/Row; FormDefinition/Submission; CommentThread/Comment.
- Storage: PostgreSQL + Prisma; JSONB for dynamic row data; Redis for caching/rate limiting; MinIO for media (backend handles signed uploads/ingest).

Public page rendering flow (Easyblocks → React)

Overview
The public site (apps/web) renders pages via pure SSR (Server-Side Rendering). Each request fetches the Easyblocks document JSON from the database, resolves external references, and transforms it into React components on the server. The fully-rendered HTML is sent to the client with embedded metadata for SEO. Highly dynamic components (booking calendars, real-time availability) hydrate on the client and fetch their data via API endpoints.

Content authoring → storage → rendering lifecycle
1. **Authoring (Admin App)**
   - User edits page in Easyblocks visual editor (apps/admin)
   - Editor state is Easyblocks document JSON: hierarchical tree of block definitions with props
   - Each block has: type (e.g., "Paragraph", "Card", "RepeatableGrid"), props (text, styles, external references like mediaId or tableId)
   - Document saved to database as draft (BuilderDocument table, or Page.draftContent JSON column)
   - On publish: snapshot copied to PageVersion and Page.publishedContent

2. **Storage (Database)**
   - Published content stored as JSON in Page.publishedContent (or separate BuilderPublishedDocument table)
   - External references stored as IDs only (not embedded data):
     - Media: `{ type: "Image", props: { mediaId: "abc123" } }`
     - Database rows: `{ type: "RepeatableGrid", props: { tableId: "xyz789", query: {...} } }`
   - This keeps documents lightweight and allows content updates without re-saving pages

3. **Fetching (Public Site Request)**
   - User requests `/about-us` on apps/web
   - Next.js route handler: look up Page by slug, check status (only published), check locale (if i18n)
   - Load Page.publishedContent JSON + metadata (title, meta, scheduledUnpublishAt)
   - If scheduled to unpublish in past, treat as 404

4. **External Data Resolution**
   - Before rendering, resolve all external references in document:
     - Media IDs → fetch MediaAsset records (get CDN URLs, alt text, variants)
     - Table IDs → fetch TableDefinition + query Row records matching filters/sort/limit
     - Global Section IDs → fetch GlobalSection content (recursive resolution if sections reference other externals)
   - Build a "resolution map": `{ mediaId: { url, alt, variants }, tableId: [rows...] }`

5. **React Component Rendering**
   - Pass document JSON + resolution map to Easyblocks renderer (`@easyblocks/core`)
   - Easyblocks walks the document tree and for each block:
     - Look up block definition from registry (packages/editor/blocks/*)
     - Each block definition exports a React component + schema
     - Instantiate component with resolved props (e.g., Image component receives `src={resolvedMedia.url}` instead of `mediaId`)
   - For repeatable blocks (RepeatableGrid, RepeatableList):
     - Template strings like `{{name}}` and `{{price}}` are replaced with actual row values
     - Renderer creates one component instance per row
     - Media link fields in rows are resolved to full media objects
   - Result: full React tree

6. **Styling & Theming**
   - Easyblocks blocks use design tokens (colors, fonts, spacing) defined in config
   - Tokens mapped to CSS variables in page `<head>`:
     ```css
     :root {
       --color-primary: #3b82f6; /* from active theme */
       --font-body: 'Inter', sans-serif;
       --space-md: 1rem;
     }
     ```
   - Blocks apply tokens via CSS: `color: var(--color-primary)`
   - Active theme (selected in admin) determines token values
   - Responsive styling: Easyblocks blocks store per-breakpoint props; renderer outputs responsive CSS

7. **HTML Output (SSR)**
   - React tree rendered to HTML string on the server for each request
   - Inject page metadata in `<head>`: `<title>`, `<meta>`, JSON-LD structured data (critical for SEO)
   - Hydration markers for interactive blocks (carousels, accordions, modals, forms)
   - Dynamic data containers: booking calendar, availability checker render with placeholder + client-side hydration script
   - Output CDN URLs for media with `<picture>` tags (WebP/AVIF with fallbacks)
   - Lazy loading attributes on images below fold

8. **Caching & Performance (SSR + Redis)**
   - **Server-side cache (Redis)**: cache rendered page HTML per workspace/page/locale key with TTL (e.g., 5-60 minutes)
   - On publish action: purge Redis cache for affected page(s) to force re-render on next request
   - Cache external data resolution: cache MediaAsset lookups, TableDefinition + Row queries in Redis (short TTL)
   - **CDN edge cache**: reverse proxy (Nginx/Caddy/Cloudflare) caches HTML responses with Cache-Control headers; purge on publish via cache API
   - **Media CDN**: MinIO-backed CDN for images/videos with immutable URLs, long TTL (1 year)
   - **Client-side hydration**: minimal JS for interactive blocks (carousels, accordions, modals); dynamic data (booking calendar) fetches via API after initial render
   - **Client-side data fetching**: booking availability, real-time inventory uses `/api/calendar/availability?date=...` endpoints; keeps SSR HTML in sync for SEO while showing live data

Example: RepeatableGrid rendering flow
1. Admin creates "Products Grid" block, selects "products" table, adds filter `category == "shoes"`, sort by `price desc`, limit 12
2. Template slots: `<h3>{{name}}</h3><img src="{{media.main}}"/><p>{{price}}</p>`
3. On publish: document saved with `{ type: "RepeatableGrid", props: { tableId: "products-123", query: { filter: ..., sort: ..., limit: 12 }, template: {...} } }`
4. Public site request:
   - Fetch page document
   - Resolve tableId: query Row records matching filter/sort/limit → 12 product rows
   - For each row: resolve media.main (media link field) → get MediaAsset URL
   - Pass resolved rows to RepeatableGrid component
   - Component iterates rows, replaces `{{name}}` with row.data.name, `{{media.main}}` with resolved URL
   - Output: 12 product cards as HTML

Example: Global Section (header) rendering
1. Admin creates GlobalSection "Main Header" with logo (mediaId) + navigation menu (links to pages)
2. Multiple pages reference this section via `{ type: "GlobalSection", props: { sectionId: "header-456" } }`
3. Public site request for any page (SSR):
   - Document contains GlobalSection reference
   - Resolve sectionId: fetch GlobalSection.content (another Easyblocks document)
   - Recursively resolve externals in section content (logo mediaId → URL)
   - Render section content as React components
   - Insert rendered section HTML at reference point in page
4. On section edit + save: purge cache; all pages auto-updated on next request (no republish needed)

Example: Booking calendar (client-side dynamic data)
1. Admin adds BookingCalendar block to page, selects "room_availability" table, sets capacity limits
2. On publish: document saved with `{ type: "BookingCalendar", props: { tableId: "room-availability-123", config: {...} } }`
3. Public site request (SSR):
   - Render page with calendar block as placeholder HTML: `<div id="calendar-root" data-table-id="..." data-config="..."></div>`
   - Include calendar widget JS in page bundle
4. Client-side hydration:
   - Calendar widget mounts, reads data attributes
   - Fetches current month availability via `/api/public/calendar/availability?tableId=...&month=2026-01`
   - Renders interactive calendar with available/booked dates
   - User selects date → fetches time slots for that day → shows booking form
5. Why client-side: availability changes frequently (bookings happen in real-time); caching would show stale data; SSR ensures page structure + SEO metadata intact

Draft Mode preview flow
1. Admin clicks "Preview" in editor
2. Generate signed preview URL: `/api/preview?token=...&pageId=...`
3. Preview API route: validate token, enable Draft Mode, redirect to page URL
4. Page request with Draft Mode enabled:
   - Fetch Page.draftContent instead of publishedContent
   - Render with same flow as published (resolve externals, render React, output HTML)
   - Show preview banner with "Exit Preview" button
5. Editor can see changes before publishing

Multi-language rendering (i18n)
1. Page has translations: Page (default locale) + PageTranslation records (de, fr, etc.)
2. Request `/de/about-us`:
   - Look up Page by slug, then PageTranslation where locale = "de"
   - If translation exists and status = published: use PageTranslation.content
   - If not: fallback to default Page.publishedContent
3. Media alt text per locale: MediaAsset has altTextTranslations JSON `{ en: "...", de: "..." }`
4. Render flow same as single-language, but resolve locale-specific strings

Performance considerations (SSR + caching)
- **Cold request** (no cache): query DB, resolve externals, render React tree to HTML; total time 100-300ms depending on page complexity
- **Warm request** (Redis cached): serve cached HTML; response time <20ms
- **Cache invalidation**: on page publish, purge Redis + CDN cache for that page; next request rebuilds cache
- **Multi-tenant isolation**: cache keys scoped by workspaceId to prevent cross-tenant cache pollution
- **External resolution batching**: fetch all mediaIds in one query, all tableIds in parallel to minimize DB round-trips
- **RepeatableGrid with large datasets**: limit rows fetched (e.g., 100 max), implement pagination, or use client-side "load more" for UX
- **Easyblocks renderer**: fast (pure React, no DOM manipulation), but complex pages (50+ blocks) may take 50-100ms to render; acceptable for SSR
- **React Server Components**: use for zero-JS blocks (paragraphs, headings, static images) to reduce client-side bundle
- **Dynamic data isolation**: booking calendars, availability checkers hydrate after initial SSR and fetch data client-side; keeps main content cacheable
- **Stale-while-revalidate pattern**: serve cached HTML immediately, refresh cache in background if TTL expired

Error handling
- Missing external reference (deleted media, deleted table): render fallback (placeholder image, empty list) + log error (don't break page)
- Malformed document JSON: catch + log + render error state (avoid white screen)
- Scheduled unpublish: return 404 but keep content in DB (can be republished)

Constraints & considerations
- Plugin loading is build-time only (Next.js bundling + security). Marketplace = install package + redeploy.
- Theming via Easyblocks tokens mapped to CSS variables/Tailwind.
- External references in Easyblocks documents: store IDs for media/table rows and resolve at render time.
- Spam defense mandatory for comments/forms; abuse controls and rate limits required.
- Multi-tenancy: every entity scoped by workspaceId (and optionally siteId); domain mapping.

Admin interface structure

Navigation & layout
- Top bar: workspace switcher dropdown (shows current workspace name + list of user's workspaces with quick switch), user menu (profile, settings, logout), environment indicator (production/staging toggle), notifications bell (comments awaiting moderation, form submissions, system alerts).
- Sidebar (collapsible): primary navigation with icon + label; organized into logical sections with dividers.

Primary navigation sections
1. Overview
   - Dashboard (landing page after login)

2. Content
   - Pages (list all pages with status badges, search/filter, bulk actions)
   - Media Library (folder tree + grid view)
   - Navigation Menus (header/footer menu editor)
   - Global Sections (reusable components)

3. Data
   - Databases (list custom tables)
   - Forms (form definitions + submissions inbox)
   - Comments (moderation queue)

4. Site
   - Analytics (GDPR-compliant stats dashboard)
   - SEO (sitemap, robots.txt, structured data settings)
   - Domains (domain connection wizard, domain mapping)
   - Redirects (manage 301/302 redirects)

5. Design
   - Themes (installed themes, activate/preview)
   - Templates (page templates gallery, create from existing)

6. Settings
   - General (site name, tagline, timezone, language)
   - Users & Permissions (workspace members, roles, invitations)
   - Integrations (plugins list, enable/disable)
   - Backups (download/restore, auto-backup schedule)
   - Storage (quota usage, orphan cleanup)
   - Advanced (staging controls, danger zone)

Page-specific layouts

Dashboard page
- Welcome banner with quick actions ("Create page", "Upload media", "View site")
- Key metrics cards: total pages (published/draft), storage used, recent visitors (7d), pending comments
- Recent activity feed (last 10 actions: page published, media uploaded, comment posted)
- Quick links: "View analytics", "Manage forms", "Site settings"
- Site health status: domain connected, sitemap generated, no broken links

Pages list/management
- Table view: columns for title, slug, status (draft/scheduled/published), last edited, author, actions (edit/preview/delete)
- Filters: status, author, created date range, search by title/slug
- Bulk actions: delete, duplicate, change status, schedule publish
- "Create page" button (opens page type selector: blank, from template)
- Calendar view toggle (shows scheduled publish dates)

Page editor (Easyblocks)
- Top toolbar: page title (editable inline), status dropdown, "Preview" button, "Save draft" button, "Publish" button (or "Schedule"), "Settings" icon
- Left sidebar: blocks palette (drag to canvas), layers tree, device switcher (mobile/tablet/desktop)
- Center canvas: Easyblocks editor with live preview
- Right sidebar: selected block properties, page settings tab (SEO meta, slug, schedule, template, featured image)
- Bottom bar: version history dropdown ("Restore to version X"), accessibility score, performance score

Media library
- Left sidebar: folder tree (nested, drag/drop to reorganize, "New folder" button)
- Main area: grid or list view toggle; assets with thumbnails, filename, size, dimensions, upload date
- Filters: file type (image/video/document), tags (multi-select autocomplete), date range, search by filename
- Bulk actions: move to folder, add tags, delete, download
- Upload area: drag/drop zone or "Upload files" button (shows progress, quota remaining)
- Asset detail panel (click asset): preview, metadata, alt text editor, tags, usage indicator ("Used in 3 pages"), variants list, download options, delete button
- Orphan detection: filter to show unused media, bulk cleanup action

Custom databases
- List view: table cards showing name, record count, last modified, "Edit schema" and "View records" buttons
- Create table flow: name, slug, add fields (name, type, required, indexed), save
- Table detail page: tabs for "Records" and "Schema"
  - Records tab: data table with filtering/sorting, "Add record" button, inline edit, export CSV
  - Schema tab: field list, add/edit/delete fields, reorder fields, indexing toggles

Forms & submissions
- Forms list: form name, submission count, last submission date, "Edit form" and "View submissions" buttons
- Form builder: drag/drop field editor (similar to page editor but for form fields), field properties (label, placeholder, required, validation rules, conditional logic), preview panel, "Embed code" snippet
- Submissions inbox: table view with submitted data, date, IP (if not GDPR-sensitive), status (new/read/archived), export CSV, filter by date range, bulk actions (mark read, delete)
- Form settings: notification recipients, auto-reply settings, spam protection config

Comments moderation
- Queue view: tabs for "Pending", "Approved", "Spam", "Trash"
- List shows: commenter name, email (if provided), comment preview, page/context, date, actions (approve/spam/trash/reply)
- Bulk moderation: select multiple, apply action
- Settings: auto-approval rules, blocklist, notification settings

Analytics dashboard (GDPR-compliant)
- Time range selector: today, 7d, 30d, 90d, custom range
- Key metrics row: unique visitors, pageviews, bounce rate, avg session duration (all aggregated, no individual tracking)
- Visitors chart: line graph over time
- Top pages: list with pageviews and avg time on page
- Referrer sources: where visitors come from (direct, search engines, social, other sites)
- Geographic data: country-level map/list (no city-level tracking)
- Device stats: desktop/mobile/tablet breakdown
- Browser/OS stats: aggregated data
- Custom events: form submissions, button clicks (if tracked), conversions
- Real-time view: current visitors online (anonymized count)
- Privacy-first notice: "No cookies, no personal data stored, GDPR-compliant" badge
- Export data: CSV export for reporting

SEO management page
- Tabs: "Meta Defaults", "Sitemap", "Robots.txt", "Structured Data"
- Meta defaults: default title pattern, description, OG image uploader, Twitter card settings
- Sitemap: auto-generated sitemap status, last generated date, "Regenerate" button, view/download link
- Robots.txt: text editor with syntax highlighting, "Restore default" button
- Structured Data: templates for LocalBusiness, Restaurant, Hotel schemas with form inputs, preview JSON-LD output

Domains page
- Current domain status: shows connected domain(s) and mapping status
- "Connect new domain" button: wizard with DNS instructions (A/CNAME records), verification check, "Test DNS" button
- Domain settings: www canonicalization toggle (www → non-www or vice versa), custom domain mapping
- Subdomain list: staging subdomain, preview subdomain, status indicators
- Note: SSL/HTTPS is managed by reverse proxy (not in CMS)

Users & permissions
- Members list: name, email, role, last active, "Invite" button
- Invite flow: email input, role selector (workspace admin/editor/viewer custom roles), send invitation
- Role management: list of roles, permissions matrix (CRUD on pages/media/databases/etc.), create custom roles
- Pending invitations: list with resend/cancel actions
- Activity log: user-specific audit trail (who did what)

Themes page
- Installed themes: theme cards with preview image, name, version, "Activate" button (one active at a time), "Configure" button (opens theme settings)
- Theme settings: token values (colors, fonts, spacing), save/reset
- "Install theme" button: upload theme package or browse built-in themes
- Preview mode: apply theme temporarily to see changes before activating

Templates gallery
- Pre-built templates: cards showing preview image, name, category (homepage/about/contact/etc.), "Use template" button
- Workspace templates: user-saved templates, "Edit" and "Delete" options
- "Save current page as template" flow: from page editor, name template, add to gallery

Backups page
- Auto-backup schedule: toggle on/off, frequency selector (daily/weekly), retention period (keep last X backups)
- Manual backup: "Create backup now" button (shows progress, completion time)
- Backup history: list showing date, size, type (manual/auto/pre-operation), "Download" and "Restore" buttons
- Restore confirmation: warning modal, "This will overwrite current site", checkbox confirmation, restore button
- Storage used by backups: shows GB used, "Delete old backups" cleanup action

Staging environment controls (in Advanced settings)
- Environment toggle: "Production" vs "Staging" mode (switches entire admin view context)
- Staging actions:
  - "Clone production to staging" button (with confirmation)
  - "Promote staging to production" button (with detailed diff preview, confirmation)
  - Staging site URL (opens in new tab)
  - Last sync date
  - Environment indicator banner (always visible when in staging mode)

Admin UI/UX patterns
- Consistent action buttons: primary actions (blue), destructive (red), secondary (gray)
- Inline editing: click to edit common fields (page title, asset alt text) with save/cancel
- Contextual actions: hover over list items reveals action menu (edit/delete/duplicate)
- Breadcrumbs: show navigation path (Pages > About Us > Edit)
- Toast notifications: success/error messages (non-blocking, auto-dismiss)
- Confirmation modals: for destructive actions (delete, restore backup) with "Type to confirm" input for critical operations
- Loading states: skeleton screens for lists, spinners for actions, progress bars for uploads
- Empty states: helpful messages with call-to-action ("No pages yet. Create your first page!")
- Keyboard shortcuts: document and support (Cmd+S to save, Cmd+P to preview, etc.)
- Responsive admin: works on tablet (sidebar collapses to hamburger menu on mobile)
- Dark mode support: optional user preference toggle

Implementation plan (raw, phased)

Phase 1 — Foundation & scaffolding
- [ ] Create Turborepo monorepo (apps/admin, apps/web, packages/*) with pnpm workspaces.
- [ ] Add shared tooling: ESLint, Prettier, TS configs, CI, commit hooks.
- [ ] Set up local PostgreSQL and general deployment using Docker Compose (define services for Postgres, Redis, MinIO, and any other required infrastructure; document usage for local dev and production-like environments).
- [ ] Add Prisma in packages/db with baseline models: User, Workspace, WorkspaceMember, Role, WorkspaceQuota (storage limits, API rate limits).
- [ ] Implement authentication with Auth.js/NextAuth (App Router route handlers) and protect /admin/**.
- [ ] Add RBAC scaffolding: permission model, can(user, action, resource) helper, admin route guards via middleware.
- [ ] Implement granular rate limiting: per-IP limits (uploads, form submits, API calls) and per-workspace limits using Redis sliding window counters.
- [ ] Set up admin UI kit: Tailwind, shadcn/ui + Radix primitives.
- [ ] Add Sentry early (error tracking + performance monitoring).

Phase 2 — Core CMS entities (pages, publishing workflow, preview)
- [ ] Define page model: Page { id, workspaceId, slug, title, status, scheduledPublishAt, scheduledUnpublishAt, createdAt, updatedAt }; PageVersion { pageId, version, snapshotJson, createdBy, createdAt }.
- [ ] Build admin interface foundation: navigation structure, sidebar, top bar with workspace switcher, routing setup for all admin pages, responsive layout with collapsible sidebar.
- Dashboard page: welcome banner, key metrics cards (pages/storage/visitors), recent activity feed, quick actions, site health status (sitemap generated, no broken links).
- [ ] Admin flows: list/create/rename/change slug/delete (soft delete); status changes draft ↔ published; calendar view showing scheduled content.
- [ ] Pages list UI: table view with filters (status/author/date), bulk actions, search, "Create page" flow with template selector.
- [ ] Content scheduling: add scheduledPublishAt and scheduledUnpublishAt fields; implement cron job/scheduled task to auto-publish/unpublish; conflict warnings for overlapping schedules.
- [ ] Versioning: create PageVersion on publish; rollback; show who/when/version; visual diff comparison (side-by-side before/after with highlighted changed blocks).
- [ ] Preview: Next.js Draft Mode; signed preview URL; banner + exit preview.
- [ ] Comprehensive SEO management: per-page meta (title, description, OG image, Twitter cards); auto-generated XML sitemap (dynamic, respects publish status); robots.txt management; canonical URL handling; structured data/JSON-LD (LocalBusiness, Product, Event schemas); redirect chain validation (no 301 → 301); SEO score checker in editor (missing meta, image alt text, heading structure); dedicated SEO admin page with tabs for defaults/sitemap/robots/structured data.
- [ ] Site settings: SEO defaults, navigation menus (header/footer), redirects with validation.
- [ ] Domain management: "Connect domain" wizard with DNS verification checks, domain mapping configuration, www vs non-www canonicalization; dedicated Domains admin page showing connection status, DNS instructions, test tools. Note: SSL/HTTPS handled by reverse proxy.
- [ ] Backup & restore UI: "Download full site export" (JSON/ZIP with media), "Restore from backup" with rollback entire site capability, auto-backup before bulk operations (theme change, plugin update); dedicated Backups admin page with history, schedule, manual backup.
- [ ] Storage quota management: per-workspace storage limits, usage dashboard (X GB used / Y GB limit), block uploads when over quota, auto-delete media variants when original is deleted; storage page showing quota usage and orphan cleanup tools.

Phase 3 — Visual builder (Easyblocks) + basic block library
- [ ] Integrate Easyblocks: editor page in apps/admin mounting EasyblocksEditor; packages/editor for config + block registry.
- [ ] Page editor UI: top toolbar (title, status, preview, save, publish, settings), left sidebar (blocks palette, layers tree, device switcher), center canvas, right sidebar (block properties, page settings), bottom bar (version history, scores).
- [ ] Document persistence: DB tables for drafts/published; optional Easyblocks cloud backend for prototyping.
- [ ] Core blocks: paragraph, headings, grid, repeatable grid/list (table-bound), cards, callouts, carousel, table, media embed, media gallery, accordion, modal, links, buttons, chips, divider.
- [ ] Global sections: implement GlobalSection table for reusable header/footer/banner components; allow referencing in multiple pages via Easyblocks external data; edit once updates everywhere; dedicated admin page for managing global sections.
- [ ] Template library: pre-built page templates (homepage, about, contact, menu, product grid); "Duplicate page" feature (clone page + content); "Save page as template" for workspace-specific reusable templates; templates gallery admin page using Easyblocks Templates.
- [ ] Mobile preview: explicit mobile/tablet/desktop viewport switcher in editor toolbar; device-specific screenshot for version history.
- [ ] Theming primitives: define Easyblocks tokens for color/font/space; map to CSS variables/Tailwind.
- [ ] Admin UI polish: breadcrumbs, toast notifications, confirmation modals for destructive actions, loading states (skeleton screens, spinners, progress bars), empty states with helpful CTAs, inline editing patterns, contextual action menus.

Phase 4 — Public site rendering (apps/web)
- [ ] Set up apps/web Next.js app: App Router, TypeScript, SSR configuration, environment-based routing (workspace domain mapping).
- [ ] Page request handler: receive incoming request, extract workspace from domain/subdomain, look up Page by slug + workspaceId, check publish status and scheduledUnpublishAt.
- [ ] External data resolver: implement resolution system for external references in Easyblocks documents:
  - [ ] MediaAsset resolver: fetch media by IDs, build resolution map with CDN URLs, alt text, variants (WebP/AVIF).
  - [ ] TableDefinition + Row resolver: fetch table schema, query rows matching filters/sort/limit, resolve nested media link fields.
  - [ ] GlobalSection resolver: recursively resolve section content and its external references.
  - [ ] Batching optimization: group all mediaIds and tableIds, execute parallel queries to minimize DB round-trips.
- [ ] Easyblocks renderer integration: configure @easyblocks/core for SSR:
  - [ ] Register all block components (from packages/editor/blocks).
  - [ ] Pass document JSON + resolution map to renderer.
  - [ ] Generate React tree with resolved props (media URLs, table row data).
  - [ ] Handle template string replacement in repeatable blocks ({{name}}, {{price}}, {{media.main}}).
- [ ] Theme system integration: load active theme for workspace, inject design tokens as CSS variables in <head>, apply token-based styling to blocks.
- [ ] SEO & metadata injection: generate <head> content (title, meta description, OG tags, Twitter cards, canonical URL), render JSON-LD structured data (LocalBusiness, Restaurant, Hotel schemas).
- [ ] HTML output optimization: render React tree to HTML string, apply lazy loading to images below fold, generate <picture> tags with WebP/AVIF + fallbacks, add hydration markers for interactive blocks.
- [ ] Redis caching layer: implement page HTML cache with TTL (5-60 min), cache key structure (workspaceId:pageSlug:locale), cache external data resolution results (media lookups, table queries).
- [ ] Cache invalidation: on page publish, purge Redis cache for affected page, emit cache purge event for CDN edge cache, implement stale-while-revalidate pattern.
- [ ] Client-side hydration: minimal JS bundle for interactive blocks (carousels, accordions, modals, forms), lazy load block-specific JS only when block present on page.
- [ ] Dynamic data API endpoints: implement /api/public/* endpoints for client-side fetching:
  - [ ] /api/public/calendar/availability: fetch booking availability for date range.
  - [ ] /api/public/forms/submit: handle form submissions with spam validation.
  - [ ] /api/public/search: site search endpoint (full-text search on pages/tables/media).
  - [ ] Rate limiting on public APIs (per-IP, per-workspace).
- [ ] Dynamic component placeholders: booking calendar, availability checker render as server-side placeholders with data attributes, hydrate client-side with API fetching.
- [ ] Multi-language routing: implement locale detection from URL path (/en/about, /de/about), fetch PageTranslation if exists or fallback to default, resolve locale-specific strings (media alt text).
- [ ] Error handling: missing external references (deleted media/tables) render fallback (placeholder image, empty list), malformed document JSON caught and logged, scheduled unpublish returns 404 with proper headers.
- [ ] Performance monitoring: track SSR render time per page, log slow queries (>100ms), monitor cache hit/miss ratio, set up Sentry performance tracking for rendering pipeline.
- [ ] Draft Mode implementation: /api/preview endpoint validates token and enables Draft Mode, rendering pipeline fetches Page.draftContent instead of publishedContent, preview banner with "Exit Preview" button.

Phase 5 — Media management (folders, tags, CRUD) + editor integration
- [ ] DB: MediaFolder { id, workspaceId, parentId, name, path }; MediaAsset { id, workspaceId, folderId, storageKey, mime, size, width, height, duration, alt, createdAt }; MediaTag { id, workspaceId, name } + join table; MediaVariant { assetId, variantType, storageKey, width, height, format }.
- [ ] Media Library admin page: left sidebar folder tree (nested, drag/drop reorganize, "New folder" button); main area with grid/list view toggle; asset thumbnails with metadata; filters (file type, tags, date, search); bulk actions (move, tag, delete, download); upload drag/drop zone with progress and quota indicator.
- [ ] Asset detail panel: preview, metadata editor (alt text, tags), usage indicator ("Used in X pages"), variants list, download options, delete button.
- [ ] Uploads: backend-signed uploads to self-hosted MinIO (no public direct upload); enforce mime allowlist, max file size, per-workspace storage quotas.
- [ ] Asset optimization pipeline: auto-convert images to WebP/AVIF (with fallbacks); generate responsive variants (thumbs, multiple sizes); video transcoding (ffmpeg) for web-optimized formats; max file size enforcement (prevent large uploads).
- [ ] Processing: background jobs (BullMQ via Redis) for thumbnails/responsive variants; store variant metadata; lazy loading by default on rendered pages; proper CDN cache headers.
- [ ] Orphan detection: filter showing unused media, bulk cleanup action in storage management page.
- [ ] Easyblocks integration: media picker widget in editor; store mediaId in documents; render via CDN URL + variants with WebP/AVIF support.
- [ ] apps/web integration: update media resolver to fetch and use MediaVariant records; generate responsive <picture> elements with srcset for different sizes; automatic WebP/AVIF format selection with fallbacks; update CDN URL generation to point to variant storage keys.

Phase 6 — Custom databases (user-defined tables/fields) + data-bound blocks
- [ ] Data model: TableDefinition { id, workspaceId, name, slug }; FieldDefinition { id, tableId, key, label, type, required, configJson, indexed }; Row { id, tableId, dataJson, createdAt, updatedAt }.
- [ ] Databases admin page: list view with table cards (name, record count, last modified); "Create table" flow (name, slug, add fields with type/required/indexed options).
- [ ] Table detail page: tabs for "Records" and "Schema"; Records tab with data table (filtering/sorting, inline edit, "Add record" button, export CSV); Schema tab with field list (add/edit/delete fields, reorder, indexing toggles).
- [ ] Field type registry: text, number, enum/select, boolean, date, time, datetime, media link; each defines editor component, Zod builder, serialize/deserialize, optional indexing hints; make registry extensible for plugins.
- [ ] Validation: generate Zod schema per table definition; validate row writes.
- [ ] Bind to visual blocks: repeatable selectors (pick table, query filter/sort/limit, template strings {{name}}, {{price}}, {{media.main}}); placeholder resolver; media link rendering.
- [ ] Performance: auto-create GIN indexes on JSONB columns for indexed fields; consider denormalizing hot data (e.g., product price as real column, not JSONB) for frequently queried fields; add optional denormalized search view for fast search.
- [ ] Site search implementation: PostgreSQL full-text search for published pages, custom database rows, and media; search results page block; search analytics (track what users search for but don't find = content gap); admin search analytics dashboard (under Analytics page, separate tab for search insights).
- [ ] apps/web integration: update table data resolver to handle complex queries (filters, sorting, pagination); implement template string replacement engine for {{placeholder}} syntax; support nested field access ({{media.main}}, {{user.name}}); handle media link field resolution in row data; add RepeatableGrid/RepeatableList rendering components; implement search results page rendering with highlighted matches.

Phase 7 — Plugins, themes, high-level blocks, and product hardening
- [ ] Plugin system v1 (build-time): plugin manifest + register() API; contributions for blocks/templates, field types, admin pages/settings, server hooks (publish, form submit); load from packages/plugins/*; compatibility rules; Integrations admin page (list plugins, enable/disable, configure).
- [ ] apps/web plugin integration: load plugin-contributed blocks in rendering pipeline; register plugin blocks in Easyblocks renderer; execute plugin server hooks (pre-render, post-render, page-viewed); support plugin-defined external data resolvers.
- [ ] Theme system: packages exporting Easyblocks token sets, CSS variables/Tailwind presets, block style variants; per-site theme selection; Themes admin page (installed themes cards with preview, activate, configure token values).
- [ ] apps/web theme integration: fetch active theme for workspace on each request; inject theme CSS variables in <head>; apply theme-specific Tailwind classes; support theme switching without cache invalidation (dynamic CSS injection).
- [ ] High-level blocks + starter designs: split variants, product list/carousel (table-bound), pre-themed gallery/slider, design templates gallery.
- [ ] Multi-language/localization (i18n): PageTranslation table; language switcher block; translation status indicators in admin; fallback to default language; routing via /en/about, /de/about; media alt text per locale; locale column on relevant tables; language management in General settings.
- [ ] apps/web i18n integration: expand locale routing from Phase 4; render language switcher block with proper hrefs; resolve all locale-specific strings (page content, media alt text, form labels); implement locale fallback chain (de-CH → de → en); set lang attribute on <html> tag; include hreflang links in <head> for SEO.
- [ ] Visual form builder: drag/drop form editor block; field types (text, email, phone, select, radio, checkbox, file upload, date picker); conditional logic (show field X if Y is checked); notifications to workspace admin + auto-reply to user; submission storage + CSV export; spam defense (Turnstile server-side validation + honeypot fields); Forms admin page (list forms, builder UI, submissions inbox with table view, filters, export).
- [ ] apps/web form integration: render FormBuilder block as interactive HTML form; implement client-side validation; handle conditional field logic (show/hide based on other fields); submit to /api/public/forms/submit endpoint; show success/error messages; integrate Turnstile widget; render honeypot fields (hidden from users).
- [ ] Booking/reservation system: availability calendar UI; time slot selection; capacity limits per slot; confirmation flow; admin calendar view with status (pending, confirmed, canceled); basic notification system; dedicated Bookings admin section or part of Forms.
- [ ] apps/web booking integration: render BookingCalendar block (already covered in Phase 4 dynamic components); implement /api/public/bookings/* endpoints (availability, create booking, cancel booking); handle capacity validation; send confirmation emails via background job.
- [ ] Comments (as plugin): moderation queue (approve/spam/trash); threading optional; spam defense (Turnstile server-side validation, optional Akismet); notification system for workspace admins; Comments admin page with tabs (Pending/Approved/Spam/Trash), bulk moderation, settings.
- [ ] apps/web comments integration: render Comments block showing approved comments for page; implement comment submission form with Turnstile; submit to /api/public/comments/submit; show pending moderation message; support threading (replies) if enabled; real-time comment updates optional (WebSocket or polling).
- [ ] GDPR-compliant Analytics: implement privacy-first tracking (no cookies, no personal data, anonymized pageviews); Analytics admin page with time range selector, key metrics (unique visitors, pageviews, bounce rate, avg session), visitors chart, top pages, referrer sources, geographic data (country-level only), device/browser stats, custom events, real-time visitor count, export CSV, "GDPR-compliant" badge; search analytics tab (what users search for, popular queries, no-result searches).
- [ ] apps/web analytics integration: inject lightweight tracking script in <head> or <body>; track pageview on SSR (send to /api/internal/analytics/track); anonymize IP addresses; respect DNT header; track custom events (form submit, button click) client-side; no third-party requests; all data stored in own DB.
- [ ] Accessibility checker: integrate axe-core; real-time checks in editor (missing alt text on images, low contrast text/background, missing heading hierarchy, empty links); accessibility score display in page editor bottom bar; warnings before publish.
- [ ] Performance monitoring: Lighthouse score tracking per page; run on publish and show LCP/FID/CLS metrics in page editor bottom bar; warn if score drops below threshold; integrate with Sentry performance monitoring; optional Performance tab in Analytics page.
- [ ] Staging environments: per-workspace staging site (separate subdomain); "Clone production → staging" action; test changes in staging; "Promote staging → production" one-click merge with diff preview; staging mode indicator in admin (environment toggle in top bar, persistent banner when in staging mode); staging controls in Advanced settings page.
- [ ] Users & Permissions admin page: members list (name, email, role, last active); "Invite" button with email + role selector; role management (permissions matrix for CRUD on pages/media/databases/etc., create custom roles); pending invitations list (resend/cancel); activity log per user.
- [ ] Navigation Menus admin page: header/footer menu editor; drag/drop menu items; nested items (submenus); link to page/URL/anchor; open in new tab toggle; menu preview.
- [ ] Redirects admin page: list of 301/302 redirects (from path → to path, status code); add/edit/delete redirects; redirect chain validation (warn if 301 → 301); bulk import CSV; test redirect tool.
- [ ] Production hardening: comprehensive audit log (who published what, who changed settings) viewable in Advanced settings; granular rate limiting + abuse controls; E2E tests (Playwright) for publish/preview/upload/scheduling flows; backups/retention policy; deployment playbook (domains, env vars, migrations, storage, reverse proxy/SSL setup, CDN setup); keyboard shortcuts documentation; dark mode support for admin UI; responsive admin (tablet/mobile support with collapsible sidebar).
