PM:
I wanna build an cms/website builder that supports creating pages, having a visual builder  , plugins/themes, media management, comments, small contact form feature and so on. Everything that Is needed for a small shop/restaurant/hotel to have a website.
The CMS should be build on nextjs with typescript, sod, easyblocks(for visual editor). The system should be extensible and easy in usage for non technical people. 
The media management supports:
- crud for media
- creating folders (nested is possible)
- manage tags (free form autocomplete)
There should be a way to create "databases" which allow to create virtual custom databases/tables. The customer should be able to set the fields of a table and choose the datatype for each field/column (text,number,enum/select,boolean,date,time,datetime,media link). The database types should be extensible
The visual editor should have at least these blocks:
- paragaraph
- different headings
- grid
- repetable grid (hooked up to a database table and allows to use template strings as placeholders)
- repetable list (same as repetable grid)
- cards
- callouts
- carousels
- table
- media embeds (photos/videos)
- media gallery (connected to a folder in the media management or table from database)
- accordion
- modal
- links
- Buttons
- Chips
- Divider


Besides these "basic blocks" there should be more high level blocks like a split (image 1), product list (image 2), prethemed gallery (image 3). Imagine a lot more of these high-level blocks.

Also I wanna have a plugin system to extend the system/cms features, add new blocks for the visual editor/page and themes that style the blocks/website.

Im imagining the system to be a "page" that is shown for general users and an "admin" interface that allows me to edit this page, content, etc.

Research what also is needed for a good cms like I have imagined, what tech/libaries are also needed and make me an implementation plan including:
- intro (what is the goal)
- tech stack
- architecture and project structure
- considerations, hints, explanation 
- implementation plan
    - consists out of max 6 phases
    - each phase has concrete detailed todos for what to do
    - each todo is in markdown checkbox style 

Architect:

## Intro: what you’re building and why

Goal: a **small‑business website builder + CMS** (shop/restaurant/hotel) where non‑technical users can:

* create pages and edit them visually (block-based)
* manage media (folders + tags + CRUD)
* create “custom databases” (user-defined tables/fields) and bind them into repeatable blocks
* enable optional features (comments, forms, plugins, themes)
* publish safely (drafts, preview, version history, rollback)

Easyblocks is a strong fit for the visual builder because it’s an **embeddable framework** that already handles the hard editor fundamentals (drag & drop, responsive styling fields, history, etc.) while keeping project-specific blocks/data sources in your code/config. ([GitHub][1])

---

## Tech stack

### Core (your required stack)

* **Next.js (App Router) + React + TypeScript**
* **Zod** for runtime validation + TS inference ([Zod][2])
* **Easyblocks** for the visual editor + “No‑Code Components” ([Easyblocks][3])

### Backend/data

* **PostgreSQL** as primary DB (multi-tenant friendly; great indexing/search options)
* **Prisma** ORM + migrations

  * Prisma supports a **Json** field type for reading/writing/filtering JSON-ish data, which is useful for dynamic content/table rows. ([Prisma][4])
* **Redis** (optional but recommended) for:

  * background job queues (e.g., BullMQ)
  * rate limiting (forms/comments)
  * caching

### Auth, security, permissions

* **Auth.js / NextAuth** for authentication in Next.js (App Router support via route handlers). ([NextAuth][5])
* **Middleware-based route protection** (admin routes, API routes). ([authjs.dev][6])
* **RBAC**: design your own, but base the UX on proven patterns (roles → permissions → CRUD rules). Directus docs show the typical CRUD-per-collection approach and why it’s foundational. ([directus.io][7])

### Admin UI + UX foundations

* **Tailwind CSS**
* **Radix UI primitives** (accessible building blocks) ([GitHub][8])
* **shadcn/ui** (fast admin UI composition; good DX) ([Shadcn UI][9])
* **React Hook Form + zod resolver** (forms, field editors)

### Media uploads & processing

* **S3-compatible object storage** (AWS S3 / Cloudflare R2 / MinIO)
* **Uppy** on the client for uploads; direct-to-S3 is supported via `@uppy/aws-s3` with signing via Companion or custom signing. ([uppy.io][10])
* **sharp** for image variants (thumbs, responsive sizes)
* Optional: **ffmpeg** for video thumbnailing

### Editorial workflow (strongly recommended)

A “good CMS” needs drafts + safe publishing + version history. This is common in mature CMSes:

* Strapi has a Draft & Publish workflow concept. ([Strapi Docs][11])
* Payload provides Drafts + Autosave (and ties it to versions). ([Payload][12])
  You should implement an equivalent capability (even if your UI is simpler).

### Preview

* Use **Next.js Draft Mode** for previewing unpublished/draft content cleanly. ([Next.js][13])

### Observability

* **Sentry** for error tracking + performance monitoring. ([Sentry Documentation][14])

### Spam & abuse prevention (comments + forms)

* **Cloudflare Turnstile**: you must validate tokens server-side; client-only is not sufficient. ([Cloudflare Docs][15])
* Optional: **Akismet** for spam detection (comments/contact forms). ([Akismet][16])

### Extensibility & plugins

Use known patterns: both Strapi and Payload emphasize plugins as modular extension points.

* Strapi: plugins can be local or published/shared; they integrate like built-in plugins. ([Strapi Docs][17])
* Payload: plugins hook into a modular config to inject functionality. ([Payload][18])

---

## Architecture and project structure

### High-level architecture

You’ll effectively ship two “surfaces”:

1. **Public site**

* renders published pages
* fast + cacheable
* supports SSR/SSG/ISR depending on page type and traffic

2. **Admin app**

* authentication + RBAC
* content management (pages, databases, media)
* visual builder page(s) embedding Easyblocks editor

Easyblocks specifics that matter architecturally:

* You need a dedicated **editor page** in your app where `EasyblocksEditor` is mounted. ([Easyblocks][19])
* The editor handles UI logic, but your app defines:

  * No‑Code Components (blocks) + their schemas ([Easyblocks][3])
  * external data wiring (for your “databases”, media, etc.) ([Easyblocks][20])
* Easyblocks supports **design tokens** and tokenized types (color/font/space), which maps nicely to theming. ([Easyblocks][21])

### Monorepo recommendation

A monorepo makes plugins/themes/blocks clean and shareable.

* Use **Turborepo + pnpm workspaces**
* Turborepo even recommends starting from conventions or `create-turbo` to get a correct structure quickly. ([Turborepo][22])

Example structure:

```txt
repo/
  apps/
    admin/                    # Next.js app (admin UI + Easyblocks editor page)
    web/                      # Next.js app (public website renderer)
  packages/
    core/                     # domain types, permissions, plugin interfaces
    db/                       # Prisma schema + client
    ui/                       # shared UI kit (shadcn/radix wrappers)
    editor/                   # easyblocks config builder + block registry
    plugins/
      core-pages/
      core-media/
      core-databases/
      core-forms/
      core-comments/
      ecommerce-lite/         # optional
    themes/
      default/
      modern/
      restaurant/
      hotel/
  tooling/
    eslint-config/
    tsconfig/
```

### Key domain modules (what you need to model)

**Multi-tenancy**

* `Workspace` (customer account)
* `Site` (a workspace can have 1..N sites, optional)
* `Domain` mapping (custom domain, subdomain)
* Every entity must be scoped by `workspaceId` (and optionally `siteId`)

**Pages & navigation**

* `Page` with slug/path, status (draft/published), timestamps
* `PageVersion` (snapshot of content)
* `NavigationMenu` (header/footer)

**Visual content**

* `BuilderDocument` for Easyblocks document JSON (draft)
* `BuilderPublishedDocument` or version snapshots for published

**Media**

* `MediaAsset`, `MediaFolder`, `MediaTag` (+ join table)
* `MediaVariant` (thumbs/responsive sizes)

**Custom databases**

* `TableDefinition` (schema)
* `FieldDefinition` (columns)
* `Row` (data payload)

**Forms & comments (plugins or core)**

* `FormDefinition`, `FormSubmission`
* `CommentThread`, `Comment`

---

## Considerations, hints, and explanations (what “good CMS” usually needs)

### 1) Drafts, publishing, version history, rollback

Non-technical users will make mistakes. Mature CMSes treat “draft vs published” as fundamental. ([Strapi Docs][11])
Plan to implement:

* draft content saved frequently (autosave)
* explicit publish/unpublish
* version list + rollback
* audit metadata (“who changed what”)

### 2) Preview must feel instant and safe

Use **Next.js Draft Mode** for previewing draft content without exposing it publicly. ([Next.js][13])
Typical UX:

* “Preview” button in admin opens `web` app in draft mode (signed link)
* preview shows a banner: “Draft mode enabled”

### 3) Dynamic “custom databases”: choose a storage strategy early

You have 3 practical patterns:

1. **JSONB rows** (recommended for v1)

* row data in `rows.data JSONB`
* schema in `tables/fields` tables
* generate Zod schemas from field definitions for validation
* add indexes for common queries (GIN on JSONB, expression indexes for specific keys)

2. **EAV** (entity-attribute-value)

* highly flexible but can get complex and slow without care

3. **Generate real SQL tables** per user schema

* hard in SaaS/multi-tenant; migrations become your product

Given your goals (small businesses, fast iteration, extensibility), JSONB is the best tradeoff. Prisma’s JSON support is good for read/write/filtering basics. ([Prisma][4])

### 4) Easyblocks + your “databases/media” integration

This is where Easyblocks’ **external data** model fits:

* Easyblocks has an `external` type concept where the document stores only identifiers and you provide the actual payload dynamically. ([Easyblocks][23])
  Use that for:
* “select media asset” fields (store `mediaId`)
* “connect to table row” fields (store `rowId`)
* “repeatable list/grid” blocks (store `tableId` + query + template)

### 5) Theming and design tokens (make it idiot-proof)

Non-technical users should **not** be choosing arbitrary CSS.

Make themes:

* set a token set (colors/fonts/spacing)
* set block style variants (card shadows, button radii, etc.)

Easyblocks supports tokenized types (color/font/space…) and you define tokens in config. ([Easyblocks][21])
So themes can literally be “token packs + CSS”.

### 6) Plugin system: be realistic about Next.js constraints

Next.js apps are compiled/bundled. Fully dynamic “upload a plugin ZIP and it runs” is a huge security + infra problem.

A realistic approach:

* **Build-time plugins**: plugins are packages installed in the monorepo (or npm) and enabled via config.
* Later: “marketplace” becomes “install package + redeploy”.

This mirrors how plugin ecosystems work in many systems (Strapi/Payload style modular injection). ([Strapi Docs][17])

### 7) Media management: upload UX and scaling

You’ll want:

* direct-to-object-storage uploads (avoid routing large files through your server)
* background processing to generate variants
* folder tree + tags + search
  Uppy supports direct-to-S3 uploads and has a Companion server for signing/remote providers. ([uppy.io][10])

### 8) Comments + contact forms: abuse is guaranteed

If you ship comments/forms, you ship spam defense.

* Turnstile **must** be verified server-side. ([Cloudflare Docs][15])
* Akismet is a common spam-detection API you can integrate for comments/forms. ([Akismet][16])

### 9) Observability and supportability

If this is a product, you’ll need:

* audit log (“who published what”)
* error tracking/monitoring (Sentry) ([Sentry Documentation][14])
* backups and retention policies

---

## Implementation plan (max 6 phases)

### Phase 1 — Foundation & scaffolding (repo, DB, auth skeleton)

* [ ] Create a **Turborepo** monorepo (`apps/admin`, `apps/web`, `packages/*`) and set up pnpm workspaces. ([Turborepo][22])
* [ ] Add shared tooling: ESLint, Prettier, TS configs, CI pipeline, commit hooks.
* [ ] Set up **PostgreSQL** locally + in your target environment.
* [ ] Add **Prisma** in `packages/db` with baseline models: `User`, `Workspace`, `WorkspaceMember`, `Role`.
* [ ] Implement authentication with **Auth.js / NextAuth** (App Router route handlers) and protect `/admin/**`. ([NextAuth][5])
* [ ] Add RBAC scaffolding:

  * [ ] permission model (resource/action)
  * [ ] `can(user, action, resource)` helper used across server + UI
  * [ ] admin route guards using middleware
* [ ] Set up admin UI kit:

  * [ ] Tailwind
  * [ ] shadcn/ui + Radix primitives for accessible base components ([Shadcn UI][9])
* [ ] Add Sentry early (errors during early integration are expensive). ([Sentry Documentation][14])

---

### Phase 2 — Core CMS entities (pages, publishing workflow, preview)

* [ ] Define page model:

  * [ ] `Page { id, workspaceId, slug, title, status, createdAt, updatedAt }`
  * [ ] `PageVersion { pageId, version, snapshotJson, createdBy, createdAt }`
* [ ] Implement basic admin flows:

  * [ ] list pages, create page, rename, change slug, delete (soft delete)
  * [ ] status changes: draft ↔ published
* [ ] Implement **versioning**:

  * [ ] create a new `PageVersion` on publish
  * [ ] rollback to a previous version
  * [ ] show “diff metadata” (who/when/version) in UI
* [ ] Implement preview:

  * [ ] add Next.js **Draft Mode** flow in `apps/web` ([Next.js][13])
  * [ ] “Preview” button in admin creates a signed preview URL
  * [ ] draft mode banner + “exit preview”
* [ ] Add “site settings”:

  * [ ] global SEO defaults (title template, description, OG image)
  * [ ] navigation menus (header/footer)
  * [ ] basic redirects (old slug → new slug)

---

### Phase 3 — Visual builder (Easyblocks) + basic block library

* [ ] Integrate Easyblocks:

  * [ ] add a dedicated editor page in `apps/admin` mounting `EasyblocksEditor`. ([Easyblocks][19])
  * [ ] create `packages/editor` for Easyblocks config + block registry
* [ ] Decide backend strategy for Easyblocks documents:

  * [ ] implement your own “documents/templates” persistence (DB tables)
  * [ ] support drafts + publishing of documents
  * [ ] (optional) start with Easyblocks cloud backend for prototyping, then replace (Easyblocks explicitly allows bringing your own backend). ([Easyblocks][24])
* [ ] Define your core No‑Code Components (basic blocks) with schemas:

  * [ ] Paragraph (rich text)
  * [ ] Headings (h1–h6)
  * [ ] Grid
  * [ ] Repeatable Grid (table-bound)
  * [ ] Repeatable List (table-bound)
  * [ ] Cards
  * [ ] Callouts
  * [ ] Carousel
  * [ ] Table
  * [ ] Media embed (image/video)
  * [ ] Media gallery (folder/table-bound)
  * [ ] Accordion
  * [ ] Modal
  * [ ] Links
  * [ ] Buttons
  * [ ] Chips
  * [ ] Divider
* [ ] Establish theming primitives:

  * [ ] define Easyblocks tokens for color/font/space etc. ([Easyblocks][21])
  * [ ] map tokens into CSS variables / Tailwind theme
* [ ] Rendering pipeline in `apps/web`:

  * [ ] fetch published page + document JSON
  * [ ] render React component tree from Easyblocks document
  * [ ] support responsive styling + tokens

---

### Phase 4 — Media management (folders, tags, CRUD) + editor integration

* [ ] DB schema:

  * [ ] `MediaFolder { id, workspaceId, parentId, name, path }`
  * [ ] `MediaAsset { id, workspaceId, folderId, storageKey, mime, size, width, height, duration, alt, createdAt }`
  * [ ] `MediaTag { id, workspaceId, name }` + join table
* [ ] Implement admin UI:

  * [ ] folder tree (nested)
  * [ ] asset grid/list view
  * [ ] drag/drop move between folders
  * [ ] tag free-form autocomplete
* [ ] Uploads:

  * [ ] direct upload to S3-compatible storage using Uppy AWS S3 plugin ([uppy.io][10])
  * [ ] server-side signing endpoint (workspace-scoped)
  * [ ] enforce limits: mime allowlist, max size, quotas
* [ ] Processing pipeline:

  * [ ] background jobs to generate thumbnails + responsive variants
  * [ ] store variant metadata
* [ ] Easyblocks integration:

  * [ ] implement a media picker widget
  * [ ] store `mediaId` in the document (external reference)
  * [ ] render media via CDN URL + variants

---

### Phase 5 — Custom databases (user-defined tables/fields) + data-bound blocks

* [ ] Data model:

  * [ ] `TableDefinition { id, workspaceId, name, slug }`
  * [ ] `FieldDefinition { id, tableId, key, label, type, required, configJson }`
  * [ ] `Row { id, tableId, dataJson, createdAt, updatedAt }`
* [ ] Field type registry (extensible):

  * [ ] implement built-in field types: text, number, enum/select, boolean, date, time, datetime, media link
  * [ ] each type defines: editor component, validation builder (Zod), serialize/deserialize, optional indexing hints
* [ ] Admin UI:

  * [ ] table builder UI (add/remove/reorder fields)
  * [ ] row CRUD UI with generated forms based on schema
  * [ ] basic filtering + sorting
* [ ] Validation:

  * [ ] generate a Zod schema per table definition and validate row writes
* [ ] Bind to visual blocks:

  * [ ] implement repeatable grid/list selectors:

    * [ ] pick a table
    * [ ] define a query (filter/sort/limit)
    * [ ] define a template string per item (safe substitution)
  * [ ] implement placeholder resolver (e.g., `{{name}}`, `{{price}}`, `{{media.main}}`)
  * [ ] support media link fields (render images inside repeatables)
* [ ] Performance:

  * [ ] add JSONB indexes for frequently used keys (optional per field “index this” toggle)
  * [ ] add a “denormalized search view” if you need fast search later

---

### Phase 6 — Plugins, themes, high-level blocks, and product hardening

* [ ] Plugin system (v1 = build-time plugins):

  * [ ] define plugin manifest + `register()` API
  * [ ] plugin contributions:

    * [ ] Easyblocks blocks + templates
    * [ ] database field types
    * [ ] admin nav pages + settings panels
    * [ ] server hooks (on publish, on form submit)
  * [ ] load plugins from `packages/plugins/*` and compose into a single runtime registry
  * [ ] document compatibility rules (block versioning/migrations)
  * [ ] take inspiration from Strapi/Payload style modular plugins. ([Strapi Docs][17])
* [ ] Theme system:

  * [ ] themes as packages exporting:

    * [ ] Easyblocks token sets
    * [ ] CSS variables / Tailwind presets
    * [ ] block style variants
  * [ ] per-site theme selection + safe defaults
* [ ] High-level blocks + starter designs (like your images):

  * [ ] Split block variants (text/image, image/text, stacked)
  * [ ] Product list + product carousel blocks (table-bound)
  * [ ] Pre-themed gallery/slider blocks
  * [ ] “Design templates” gallery using Easyblocks Templates ([Easyblocks][25])
* [ ] Comments + contact forms (as plugins):

  * [ ] comments: moderation queue, approve/spam/trash, threading optional
  * [ ] forms: simple contact form builder or prebuilt “ContactForm” block
  * [ ] spam defense:

    * [ ] Turnstile with **server-side validation** ([Cloudflare Docs][15])
    * [ ] optional Akismet scoring for submissions ([Akismet][16])
* [ ] Production hardening:

  * [ ] audit log for admin actions
  * [ ] rate limiting + abuse controls
  * [ ] E2E tests (Playwright) for critical flows (publish, preview, upload)
  * [ ] backups/retention strategy
  * [ ] deployment playbook (domains, env vars, migrations, storage)

[1]: https://github.com/easyblockshq/easyblocks?utm_source=chatgpt.com "easyblockshq/easyblocks: The open-source visual builder framework. - GitHub"
[2]: https://zod.dev/?utm_source=chatgpt.com "Intro | Zod"
[3]: https://docs.easyblocks.io/essentials/no-code-components?utm_source=chatgpt.com "No-Code Components - Easyblocks"
[4]: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields?utm_source=chatgpt.com "Working with Json fields (Concepts) | Prisma Documentation"
[5]: https://next-auth.js.org/getting-started/example?utm_source=chatgpt.com "Getting Started | NextAuth.js"
[6]: https://authjs.dev/getting-started/session-management/protecting?utm_source=chatgpt.com "Auth.js | Protecting"
[7]: https://directus.io/docs/guides/auth/access-control?utm_source=chatgpt.com "Access Control | Directus Docs"
[8]: https://github.com/radix-ui/primitives?utm_source=chatgpt.com "GitHub - radix-ui/primitives: Radix Primitives is an open-source UI ..."
[9]: https://ui.shadcn.com/docs/installation/next?utm_source=chatgpt.com "Next.js - shadcn/ui"
[10]: https://uppy.io/docs/aws-s3/?utm_source=chatgpt.com "AWS S3 - Uppy"
[11]: https://docs.strapi.io/cms/features/draft-and-publish?utm_source=chatgpt.com "Draft & Publish | Strapi 5 Documentation"
[12]: https://payloadcms.com/docs/versions/autosave?utm_source=chatgpt.com "Autosave | Documentation | Payload"
[13]: https://nextjs.org/docs/app/guides/draft-mode?utm_source=chatgpt.com "Guides: Draft Mode | Next.js"
[14]: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/?utm_source=chatgpt.com "Manual Setup | Sentry for Next.js"
[15]: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/?utm_source=chatgpt.com "Validate the token · Cloudflare Turnstile docs"
[16]: https://akismet.com/developers/?utm_source=chatgpt.com "Developer Documentation – Akismet"
[17]: https://docs.strapi.io/cms/plugins-development/developing-plugins?utm_source=chatgpt.com "Developing plugins | Strapi 5 Documentation"
[18]: https://payloadcms.com/docs/plugins/overview?utm_source=chatgpt.com "Plugins | Documentation | Payload"
[19]: https://docs.easyblocks.io/essentials/editor-page.md?utm_source=chatgpt.com "docs.easyblocks.io"
[20]: https://docs.easyblocks.io/essentials/external-data?utm_source=chatgpt.com "External data | Easyblocks"
[21]: https://docs.easyblocks.io/essentials/configuration?utm_source=chatgpt.com "Configuration | Easyblocks"
[22]: https://turborepo.com/docs/crafting-your-repository/structuring-a-repository?utm_source=chatgpt.com "Structuring a repository | Turborepo"
[23]: https://docs.easyblocks.io/essentials/custom-types?utm_source=chatgpt.com "Custom types | Easyblocks"
[24]: https://docs.easyblocks.io/getting-started?utm_source=chatgpt.com "Getting started | Easyblocks"
[25]: https://docs.easyblocks.io/essentials/templates?utm_source=chatgpt.com "Templates - Easyblocks"

PM:

I like your Idea about the plugins at build time. There should be a folder called "plugins" where each subfolder contains one plugins with some index.ts and e plugin.json describing it. I like using s3, but since the s3 will be a selfhosted, private minio instance, the backend should handle data transmission. SSO is not needed for the moment, but since we use NextAuth anyway, we can add it late. Right now lets go with a "users" Table where a users can be workspace admins to invite/create new accounts for their workspace. Besides that their are also "Global" Admins which can create workspaces and workspace admin users.

Developer:
- The plan is implementable as written. Build-time plugins in plugins/<name> with index.ts + plugin.json works well with Next.js bundling; we can load manifests at build and expose a registry to admin/public apps.
- For MinIO, we’ll route uploads through the backend (signed URLs or multipart presigned parts) and run background image variant jobs; no direct public S3 access needed.
- NextAuth can cover both global admins and workspace admins; we’ll scope RBAC checks by workspaceId and keep a global admin role for cross-tenant actions (workspace creation, user seeding).
- SSO can be added later via another NextAuth provider without schema changes; we’ll keep user identities normalized to avoid migration pain.
- No blockers spotted; the phased plan in story.md stays realistic if we start with Phase 1 scaffolding and RBAC foundations.
Code Review Agent:

✅ **Transfer verification complete** — All requirements and decisions have been correctly consolidated into [story.md](story.md).

**Confirmed transfers:**
- ✅ All visual editor blocks (paragraph, headings, grid, repeatable grid/list, cards, callouts, carousel, table, media embed/gallery, accordion, modal, links, buttons, chips, divider)
- ✅ High-level blocks (split hero, product list/carousel, pre-themed galleries)
- ✅ Media management details (nested folders, free-form autocomplete tags, CRUD operations)
- ✅ Custom database system (user-defined tables/fields with all specified field types: text, number, enum/select, boolean, date, time, datetime, media link; JSONB storage strategy)
- ✅ Auth model (workspace admins can invite/create accounts; global admins can create workspaces and workspace admins; SSO deferred)
- ✅ Build-time plugin system (plugins/<name> with index.ts + plugin.json)
- ✅ MinIO backend-mediated uploads (no direct public S3 access)
- ✅ Complete tech stack (Next.js, TypeScript, Zod, Easyblocks, PostgreSQL, Prisma, NextAuth, Tailwind, Radix UI, shadcn/ui, Redis, sharp, optional ffmpeg)
- ✅ All 6 implementation phases with detailed todos preserved
- ✅ Architecture decisions (monorepo structure, two surfaces: public site + admin app, multi-tenancy scoping)
- ✅ Editorial workflow (drafts, autosave, publish/unpublish, version history, rollback, preview via Draft Mode)
- ✅ Spam defense requirements (Turnstile server-side validation, optional Akismet)
- ✅ Observability (Sentry, audit log, rate limiting, backups)

**Notable consolidation improvements:**
- story.md effectively distills verbose architect documentation into actionable requirements
- Removes citation links (appropriate for internal story doc)
- Maintains all technical decisions and constraints
- Preserves all PM follow-up corrections (plugin structure, MinIO routing, admin hierarchy)
- Implementation phases remain intact with proper granularity

**No missing information detected.** The story.md is ready for implementation.

---

Core Review (Senior Architect + Ex-Agency Engineer):

## Critical Missing Features

### 1. **Content Scheduling & Publishing Workflow**
**Impact: High | Urgency: Phase 2**
- No scheduled publish/unpublish mentioned. Small businesses run campaigns, seasonal menus, holiday hours.
- **Add**: `scheduledPublishAt` and `scheduledUnpublishAt` to Page model
- **Add**: Cron job or scheduled task system to auto-publish/unpublish
- **UX**: Calendar view showing scheduled content; conflict warnings if overlapping

### 2. **SEO Management (Beyond Basics)**
**Impact: Critical | Urgency: Phase 2**
- Story mentions "SEO defaults" but this is insufficient for agency work.
- **Missing**:
  - Per-page meta (title, description, OG image, Twitter cards)
  - Auto-generated XML sitemap (dynamic, respects publish status)
  - robots.txt management
  - Canonical URL handling
  - Structured data / JSON-LD (LocalBusiness, Product, Event schemas critical for shops/restaurants)
  - Redirect chain validation (no 301 → 301)
- **Add**: SEO score/checker in editor (missing meta, image alt text, heading structure)
- **Library**: Consider `next-seo` or custom head management

### 3. **Multi-Language/Localization (i18n)**
**Impact: High | Urgency: Phase 3 or plugin**
- Hotels/restaurants in tourist areas NEED multi-language sites
- **Critical decision needed**: Per-page translation vs. full content duplication?
- **Schema impact**: `PageTranslation` table or `locale` column on Page; media alt text per locale
- **UX**: Language switcher; translation status indicators; fallback to default language
- **Routing**: `/en/about`, `/de/about` or domain-based
- **Note**: Easyblocks supports this but you need to model it in your CMS layer

### 4. **Search Functionality (Site Search for End Users)**
**Impact: High | Urgency: Phase 4**
- Visitors need to find products, menu items, hotel rooms
- **Options**:
  - PostgreSQL full-text search (good enough for v1; index published content)
  - Algolia/Meilisearch/Typesense (better UX but external dependency)
- **Scope**: Search pages, custom database rows (products, menu items), media
- **Admin**: Search analytics (what users search for but don't find = content gap)

### 5. **Form Builder (Visual)**
**Impact: High | Urgency: Phase 4**
- Story mentions "contact form feature" but small businesses need: booking requests, catering inquiries, job applications, custom surveys
- **Need**: Visual form builder as a page block (not just code-defined forms)
  - Drag/drop fields (text, email, phone, select, radio, checkbox, file upload, date picker)
  - Conditional logic (show field X if Y is checked)
  - Email notifications (to workspace admin + auto-reply to user)
  - Submission storage + export (CSV)
  - Integration hooks (Zapier webhook, email service)
- **Spam**: Already planned (Turnstile), but add honeypot fields too

### 6. **E-commerce Basics (For "Shop" Use Case)**
**Impact: High if targeting shops | Urgency: Phase 5 or separate product**
- PM says "small shop" needs a website—do they sell online or just show products?
- **Minimum viable e-commerce**:
  - Product catalog (use custom databases, but need cart + checkout)
  - Inventory tracking (low stock warnings)
  - Stripe/PayPal integration
  - Order management (status: pending, paid, shipped, completed)
  - Email receipts
  - Shipping calculator
- **Alternative**: Don't build this; integrate with Shopify/WooCommerce/Snipcart via plugin
- **Decision needed**: Full e-commerce or "catalog + external checkout"?

### 7. **Booking/Reservation System (For Hotel/Restaurant Use Case)**
**Impact: High for hospitality | Urgency: Phase 5 or plugin**
- Hotels need room booking; restaurants need table reservations
- **Core features**:
  - Availability calendar
  - Time slot selection
  - Capacity limits
  - Deposit/payment collection
  - Confirmation emails
  - Admin calendar view + status (pending, confirmed, canceled)
- **Alternative**: Integrate external booking systems (OpenTable, Booking.com) via plugin/widget
- **Decision needed**: Build native or plugin-based integration?

### 8. **Email System (Transactional + Marketing)**
**Impact: High | Urgency: Phase 3**
- Missing email infrastructure discussion
- **Needed**:
  - Transactional email service (SendGrid, Postmark, Resend, AWS SES)
  - Templates (form submission, comment notification, password reset, booking confirmation)
  - Email queue (via Redis/BullMQ already planned)
  - Unsubscribe management (GDPR/CAN-SPAM)
- **Later**: Simple newsletter (collect emails, send broadcasts)—or integrate Mailchimp/ConvertKit

## Major UX/DX Oversights

### 9. **Global Elements & Component Reuse**
**Impact: Medium | Urgency: Phase 3**
- No mention of global headers/footers that update across all pages
- **Need**: "Global Sections" that can be referenced in multiple pages
  - Edit once, updates everywhere
  - Examples: header nav, footer, promo banner, cookie consent
- **Easyblocks**: Supports this via "external data" references; you need to model `GlobalSection` table

### 10. **Mobile Preview in Editor**
**Impact: High | Urgency: Phase 3**
- Easyblocks has responsive editing, but UX needs explicit mobile/tablet/desktop viewport switcher
- **Add**: Preview frame size toggle in editor toolbar
- **Bonus**: Device-specific screenshot for version history

### 11. **Collaboration & Approval Workflow**
**Impact: Medium | Urgency: Phase 4 or plugin**
- Multi-user editing conflicts not addressed
- **For agencies managing client sites**:
  - Draft comments/annotations (designer leaves feedback for content editor)
  - Approval gates (content editor submits → workspace admin approves → publish)
  - Activity feed (who changed what)
- **Tech**: Real-time presence (who's editing) via WebSockets/Pusher
- **MVP**: Lock pages when in use; show "User X is editing"

### 12. **Revision Comparison (Visual Diff)**
**Impact: Medium | Urgency: Phase 3**
- Version history exists, but "what changed?" needs visual diff
- **UX**: Side-by-side before/after; highlight changed blocks
- **Alternative**: Text-based JSON diff (less user-friendly but faster to build)

### 13. **Accessibility Checker**
**Impact: Medium | Urgency: Phase 4**
- Small businesses may not know WCAG requirements
- **Add**: Real-time checks in editor:
  - Missing alt text on images
  - Low contrast text/background
  - Missing heading hierarchy
  - Empty links
- **Library**: axe-core for automated checks

### 14. **Undo/Redo Across Sessions**
**Impact: Low-Medium | Urgency: Phase 3**
- Easyblocks has in-session undo, but if user closes browser and returns, they lose undo stack
- **Consider**: Persist operation log for X hours so undo works across sessions

### 15. **Template Library & Page Cloning**
**Impact: High | Urgency: Phase 3**
- Non-technical users struggle with blank canvas
- **Need**:
  - Pre-built page templates (homepage, about, contact, menu, product grid)
  - "Duplicate page" feature (clone page + content)
  - "Save page as template" (workspace-specific reusable templates)
- **Easyblocks**: Templates feature exists; integrate into your flow

## Technical & Security Concerns

### 16. **Rate Limiting & Abuse Prevention (Granular)**
**Impact: High | Urgency: Phase 1**
- Story mentions rate limiting, but needs detail:
  - Per-IP limits (uploads, form submits, comment posts)
  - Per-workspace limits (API calls, storage quota)
  - DDoS protection (Cloudflare in front)
- **Redis**: Use for sliding window rate limit counters

### 17. **Backup & Restore UI (User-Facing)**
**Impact: High | Urgency: Phase 2**
- Story says "backups" but doesn't specify UX
- **Workspace admins need**:
  - "Download full site export" (JSON/ZIP with media)
  - "Restore from backup" (rollback entire site, not just one page)
  - Auto-backup before bulk operations (theme change, plugin update)
- **Database backups** are ops-level; this is user-level safety net

### 18. **Storage Quota Management**
**Impact: High | Urgency: Phase 2**
- MinIO uploads with no quota = $$$ surprise bills
- **Add**: Per-workspace storage limits
  - Show usage dashboard (X GB used / Y GB limit)
  - Block uploads when over quota
  - Auto-delete media variants if original is deleted
  - Orphan detection (media not referenced in any page/database)

### 19. **Domain & SSL Management**
**Impact: High | Urgency: Phase 2**
- Story mentions "Domain mapping" but no detail
- **Small businesses need**:
  - DNS instructions (simple, visual)
  - Auto SSL via Let's Encrypt (Caddy/Traefik, or Next.js hosting handles it)
  - HTTPS redirect enforcement
  - www vs non-www canonicalization
- **UX**: "Connect domain" wizard with DNS verification checks

### 20. **Legal & Compliance (GDPR/Cookie Consent)**
**Impact: High | Urgency: Phase 4**
- EU businesses need cookie consent banners
- **Add**:
  - Cookie consent block (customizable text, accept/reject)
  - Privacy policy & terms generator (templates)
  - Data export (user requests their data → JSON export)
  - Right to be forgotten (delete user data, anonymize comments)
- **Tech**: Cookie consent needs to block analytics/tracking scripts until accepted

### 21. **Webhooks & Integrations**
**Impact: Medium | Urgency: Phase 5**
- Power users want to connect external tools
- **Add**: Webhook system for events (page.published, form.submitted, comment.created)
- **Use cases**: Trigger Netlify rebuild, send Slack notification, sync to CRM

### 22. **API (Headless CMS Mode)**
**Impact: Low-Medium | Urgency: Phase 6 or later**
- Some users want to use your CMS as data source for mobile apps or separate frontends
- **Add**: Public JSON API (read-only) for published content
  - `/api/public/pages/:slug` → page + rendered blocks
  - `/api/public/tables/:slug/rows` → custom database data
  - API keys for authentication
- **Alternative**: GraphQL for flexible querying

## Performance & Scale Considerations

### 23. **Asset Optimization Pipeline**
**Impact: High | Urgency: Phase 4**
- Story mentions sharp for variants, but need:
  - Auto-convert to WebP/AVIF (with fallbacks)
  - Lazy loading by default on rendered pages
  - Image CDN (Cloudflare Images, Imgix, or DIY with MinIO + nginx caching)
  - Video transcoding (ffmpeg) for web-optimized formats
  - Max file size enforcement (prevent 20MB PNG uploads)

### 24. **Page Speed & Core Web Vitals Monitoring**
**Impact: Medium | Urgency: Phase 5**
- Published pages need to be fast
- **Add**: Lighthouse score tracking per page
  - Run on publish; warn if score drops below threshold
  - Show LCP, FID, CLS metrics
- **Integration**: Sentry has performance monitoring; use it

### 25. **Caching Strategy**
**Impact: High | Urgency: Phase 2**
- Next.js ISR mentioned but needs detail:
  - Which pages are static, ISR, or SSR?
  - Cache invalidation on publish (purge page cache)
  - Redis cache for database queries (expensive JSONB queries)
  - CDN cache for media (already planned via MinIO, but set proper headers)

### 26. **Database Indexing for Custom Databases**
**Impact: High | Urgency: Phase 5**
- JSONB queries can be slow without indexes
- **Add**: Auto-create GIN indexes on JSONB columns
- **User-facing**: "Index this field" checkbox for commonly queried fields
- **Alternative**: Denormalize hot data into separate columns (e.g., product price as real column, not JSONB)

## Agency-Specific Pain Points (from experience)

### 27. **White-Label & Multi-Brand**
**Impact: Medium | Urgency: Later**
- Agencies manage multiple clients; need to rebrand admin UI per workspace
- **Add**: Workspace-level branding (logo, colors in admin sidebar)
- **Alternative**: Full white-label (custom domain for admin, e.g., `cms.clientdomain.com`)

### 28. **Client Handoff & Training**
**Impact: High | Urgency: Phase 6**
- Non-technical users WILL break things
- **Add**:
  - In-app tutorials (onboarding tooltips, video guides)
  - Sandbox mode (test changes without affecting live site)
  - Support widget (Intercom, Crisp) in admin
  - Documentation site (searchable help articles)

### 29. **Billing & Subscription Management**
**Impact: High if SaaS | Urgency: Phase 6 or separate**
- If this is a product (not just client sites), you need:
  - Stripe subscription integration
  - Plan limits (pages, storage, bandwidth)
  - Usage metering (overage charges)
  - Invoicing & receipts
  - Trial period logic
- **Alternative**: Sell as self-hosted license (no billing, customer manages infra)

### 30. **Staging Environments**
**Impact: High | Urgency: Phase 5**
- Agencies need to test changes before showing clients
- **Add**: Per-workspace staging site (separate subdomain)
  - Clone production → staging
  - Test changes in staging
  - Promote staging → production (one-click merge)

## Recommendations Summary

### Must-Have Before Launch (Phases 1-3)
1. Content scheduling (publish/unpublish dates)
2. Full SEO management (meta, sitemap, structured data)
3. Site search for end users
4. Storage quota enforcement
5. Domain/SSL setup wizard
6. Email infrastructure (transactional emails)
7. Global sections/components (headers/footers)
8. Template library & page cloning
9. Mobile preview in editor
10. Backup/restore UI

### Should-Have for Target Market (Phases 4-5)
1. Multi-language support (hotels/restaurants need this)
2. Visual form builder (beyond basic contact form)
3. E-commerce catalog (decide: native vs. integration)
4. Booking system (decide: native vs. integration)
5. Asset optimization (WebP/AVIF, lazy loading)
6. Accessibility checker
7. Revision comparison (visual diff)
8. Collaboration features (comments, approval workflow)

### Nice-to-Have (Phase 6+)
1. Webhooks & integrations
2. Headless API mode
3. White-label/multi-brand
4. Staging environments
5. Page speed monitoring
6. Newsletter/email marketing

### Decision Points (Document These)
- **E-commerce**: Build native or integrate Shopify/Snipcart?
- **Bookings**: Build native or integrate external systems?
- **i18n**: Full multi-language or English-only v1?
- **Business model**: SaaS (need billing) or self-hosted product?
- **Deployment**: Cloud (Vercel/Railway) or self-hosted (Docker)?

## Final Thoughts

The plan in story.md is **solid for a v1 technical foundation**, but it reads like an engineer-focused MVP. From an agency perspective serving actual small businesses, you're missing **half the features they'll ask for in the first month**:

- "Can I schedule this to go live next Monday?"
- "How do I show up on Google?"
- "Can customers book a table?"
- "I need this in English and Spanish."
- "Can I take payments?"

**Advice**: After Phase 2 (before diving into custom databases in Phase 5), pause and build out the SEO, search, scheduling, and form builder features. These have higher ROI for small businesses than flexible data modeling.

Also, **Easyblocks is powerful but has a learning curve** for non-technical users. You'll need extensive templates and hand-holding, or they'll stare at a blank canvas. Budget time for UX polish, onboarding, and documentation—agencies live or die by how fast clients can self-serve.

Good luck. This is an ambitious but achievable project if scoped correctly. 🚀