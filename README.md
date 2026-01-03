# NeoBuilder

Monorepo scaffold for the NeoBuilder CMS. This repository uses npm workspaces and is split into multiple packages:

- packages/admin — Next.js admin surface (App Router)
- packages/web — Next.js public site surface
- packages/core — shared utilities (RBAC, rate limiting)
- packages/db — database models and connections
- packages/ui — shared UI primitives
- packages/editor — Easyblocks configuration (placeholder for now)

## Quick start

1. Install dependencies: `npm install`
2. Start infrastructure: `docker compose up -d`
3. Run admin app: `npm run dev:admin`
4. Run public web app: `npm run dev:web`

Environment variables are expected in per-app `.env.local` files. See comments inside package configs for required keys (PostgreSQL, Redis, MinIO, NextAuth, Sentry).

## Tooling

- TypeScript project references across packages
- ESLint + Prettier
- Husky + lint-staged pre-commit hook
- GitHub Actions CI (lint + typecheck)

## Infrastructure (local)

`docker-compose.yml` includes PostgreSQL, Redis, and MinIO. Default credentials are development-only; override via environment if needed.

## UI Kit note

Tailwind is configured in packages/admin. shadcn/ui installation must be run manually (per upstream license/CLI) when you are ready to pull components. Radix primitives and Tailwind are already listed as dependencies.
