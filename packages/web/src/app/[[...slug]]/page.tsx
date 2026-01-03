import { headers, draftMode } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageCacheKey, getCachedPageHtml, setCachedPageHtml } from "../../lib/cache";
import { renderCraftDocument } from "../../lib/craft-renderer";
import { resolveWorkspaceContext } from "../../lib/workspace";
import ClientInteractions from "../../components/client-interactions";
import { time } from "../../lib/timing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function slugFromParams(params: { slug?: string[] }) {
  return Array.isArray(params.slug) ? params.slug : [];
}

function buildAbsoluteUrl(host: string, path: string) {
  const base = process.env.PUBLIC_SITE_URL ?? `https://${host}`;
  return `${base}${path}`;
}

async function loadPage(workspaceId: string, slugPath: string) {
  const { findPageBySlug } = await import("@neobuilder/db");
  const page = await findPageBySlug({ workspaceId, slug: slugPath });
  if (!page || page.deletedAt) return null;
  return page;
}

async function resolveContext(params: { slug?: string[] }) {
  const headerHost = headers().get("host") ?? "localhost";
  const context = await resolveWorkspaceContext({ host: headerHost, slugSegments: slugFromParams(params) });
  if (!context) return null;
  return context;
}

export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
  const context = await resolveContext(params);
  if (!context) return {};

  const page = await loadPage(context.workspace.id, context.slugPath);
  if (!page) return {};

  const url = buildAbsoluteUrl(context.host, context.slugPath);

  return {
    title: page.title ?? "NeoBuilder Page",
    description: "Published page",
    alternates: { canonical: url },
    openGraph: { title: page.title, url },
    twitter: { card: "summary_large_image", title: page.title },
  };
}

function RenderedHtml({ html, interactiveBlocks, structuredData }: { html: string; interactiveBlocks: string[]; structuredData?: Record<string, unknown> | null }) {
  return (
    <>
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      ) : null}
      <div className="nb-page" dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />
      {interactiveBlocks.length > 0 ? <ClientInteractions blocks={interactiveBlocks} /> : null}
    </>
  );
}

export default async function SitePage({ params }: { params: { slug?: string[] } }) {
  const context = await resolveContext(params);
  if (!context) return notFound();

  const { isEnabled: isDraft } = draftMode();
  const cacheKey = buildPageCacheKey({ workspaceId: context.workspace.id, slug: context.slugPath, locale: context.locale, draft: isDraft });

  if (!isDraft) {
    const cached = await getCachedPageHtml(cacheKey);
    if (cached) {
      const structuredData = cached.metadata
        ? {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: (cached.metadata as any).title ?? "Page",
            url: (cached.metadata as any).url ?? buildAbsoluteUrl(context.host, context.slugPath),
            inLanguage: (cached.metadata as any).locale ?? context.locale,
          }
        : null;
      return <RenderedHtml html={cached.html} interactiveBlocks={(cached.diagnostics?.interactiveBlocks as string[]) ?? []} structuredData={structuredData} />;
    }
  }

  const now = new Date();
  const page = await loadPage(context.workspace.id, context.slugPath);
  if (!page) return notFound();
  if (!isDraft) {
    const isScheduledLive = page.status === "scheduled" && (!!page.scheduledPublishAt && page.scheduledPublishAt <= now);
    const isPublished = page.status === "published";
    if (!isPublished && !isScheduledLive) return notFound();
    if (page.scheduledUnpublishAt && page.scheduledUnpublishAt < now) return notFound();
  }

  const content = isDraft ? page.draftContent ?? page.publishedContent : page.publishedContent;
  if (!content) return notFound();

  const { result, duration } = await time("render:craft", () => renderCraftDocument({ serialized: content, workspaceId: context.workspace.id, locale: context.locale }));
  const diagnostics = result.diagnostics;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title ?? "Page",
    url: buildAbsoluteUrl(context.host, context.slugPath),
    inLanguage: context.locale,
  } satisfies Record<string, unknown>;

  if (!isDraft) {
    await setCachedPageHtml(cacheKey, {
      html: result.html,
      diagnostics,
      metadata: { title: page.title, locale: context.locale, url: buildAbsoluteUrl(context.host, context.slugPath) },
    });
  }

  console.info(`[render] ${context.slugPath} in ${duration.toFixed(1)}ms (locale ${context.locale})`);

  return <RenderedHtml html={result.html} interactiveBlocks={diagnostics.interactiveBlocks} structuredData={structuredData} />;
}
