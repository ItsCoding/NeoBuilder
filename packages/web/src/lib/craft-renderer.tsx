import "server-only";
import { createElement, Fragment, type ReactElement, type ReactNode } from "react";
import { serverBlockRegistry, type ServerBlockName } from "./runtime-blocks";
import { resolveExternalData, type ExternalRefs, type ResolutionMap } from "./resolvers";
import type { ThemeTokens } from "@neobuilder/editor/src/theme";

export type SerializedNode = {
  type?: { resolvedName?: string };
  displayName?: string;
  props?: Record<string, any>;
  nodes?: string[];
  linkedNodes?: Record<string, string>;
};

export type SerializedDocument = Record<string, SerializedNode>;

export type RenderDiagnostics = {
  interactiveBlocks: string[];
  missingComponents: string[];
  usedLocale: string;
  renderedSections: string[];
};

export function parseSerializedDocument(serialized: unknown): SerializedDocument {
  if (!serialized) throw new Error("Document missing");
  if (typeof serialized === "string") {
    return JSON.parse(serialized) as SerializedDocument;
  }
  return serialized as SerializedDocument;
}

export function collectExternalReferences(doc: SerializedDocument): ExternalRefs {
  const mediaIds = new Set<string>();
  const tableIds = new Set<string>();
  const sectionKeys = new Set<string>();

  const walkProps = (value: any) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(walkProps);
      return;
    }
    if (typeof value === "object") {
      Object.entries(value).forEach(([key, val]) => {
        if (key === "mediaId" && typeof val === "string") mediaIds.add(val);
        if (key === "mediaIds" && Array.isArray(val)) val.forEach((v) => typeof v === "string" && mediaIds.add(v));
        if (key === "tableId" && typeof val === "string") tableIds.add(val);
        if (key === "sectionKey" && typeof val === "string") sectionKeys.add(val);
        walkProps(val);
      });
      return;
    }
  };

  for (const node of Object.values(doc)) {
    walkProps(node.props);
  }

  return { mediaIds, tableIds, sectionKeys };
}

function applyTemplate(template: string, row: Record<string, unknown>) {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_match, key) => {
    const path = String(key).split(".");
    let current: any = row;
    for (const part of path) {
      if (current && typeof current === "object" && part in current) {
        current = (current as Record<string, any>)[part];
      } else {
        current = undefined;
        break;
      }
    }
    if (typeof current === "object") return JSON.stringify(current);
    return current !== undefined ? String(current) : "";
  });
}

function renderNode(
  id: string,
  doc: SerializedDocument,
  resolution: ResolutionMap,
  theme: ThemeTokens,
  diagnostics: RenderDiagnostics,
  visitedSections: Set<string>,
): ReactNode {
  const node = doc[id];
  if (!node) return null;
  const resolvedName = node.type?.resolvedName as ServerBlockName | undefined;
  const Component = resolvedName ? serverBlockRegistry[resolvedName] : undefined;

  const childNodes: ReactNode[] = [];
  for (const childId of node.nodes ?? []) {
    childNodes.push(renderNode(childId, doc, resolution, theme, diagnostics, visitedSections));
  }
  for (const linked of Object.values(node.linkedNodes ?? {})) {
    childNodes.push(renderNode(linked, doc, resolution, theme, diagnostics, visitedSections));
  }

  if (!Component) {
    if (resolvedName) diagnostics.missingComponents.push(resolvedName);
    return createElement(Fragment, {}, childNodes);
  }

  const props = { ...(node.props ?? {}) } as Record<string, any>;

  // block-specific prop resolution
  if (resolvedName === "PageCanvas") {
    props.theme = theme;
  }

  if (resolvedName === "CardBlock" && props.mediaId) {
    const media = resolution.media[props.mediaId];
    props.mediaUrl = media?.url;
  }

  if (resolvedName === "MediaGalleryBlock") {
    const ids: string[] = Array.isArray(props.mediaIds) ? props.mediaIds : [];
    props.items = ids.map((id: string) => resolution.media[id] ?? { url: "" });
  }

  if (resolvedName === "AccordionBlock" && Array.isArray(props.items)) {
    diagnostics.interactiveBlocks.push("AccordionBlock");
  }

  if (resolvedName === "CarouselBlock") diagnostics.interactiveBlocks.push("CarouselBlock");
  if (resolvedName === "ModalBlock") diagnostics.interactiveBlocks.push("ModalBlock");

  if (resolvedName === "RepeatableListBlock" || resolvedName === "RepeatableGridBlock") {
    const tableId: string | undefined = props.tableId;
    const template: string = props.template ?? "{{name}}";
    const rows = (tableId ? resolution.tables[tableId] : undefined) ?? [];
    const items = rows.map((row) => applyTemplate(template, row.data));
    props.header = tableId ?? "table";
    props.items = items;
  }

  if (resolvedName === "GlobalSectionBlock") {
    const key: string | undefined = props.sectionKey ?? props.key;
    if (key) {
      diagnostics.renderedSections.push(key);
      if (visitedSections.has(key)) {
        return createElement(Component as any, { sectionKey: key, note: "Circular section reference" });
      }
      visitedSections.add(key);
      const section = resolution.sections[key];
      if (section?.content) {
        const nestedDoc = parseSerializedDocument(section.content);
        return renderDocument(nestedDoc, resolution, theme, diagnostics, visitedSections);
      }
    }
  }

  return createElement(Component as any, props, childNodes.length ? childNodes : undefined);
}

export function renderDocument(
  doc: SerializedDocument,
  resolution: ResolutionMap,
  theme: ThemeTokens,
  diagnostics: RenderDiagnostics,
  visitedSections = new Set<string>(),
): ReactElement {
  const rootId = "ROOT";
  const root = doc[rootId];
  if (!root) throw new Error("ROOT node missing");
  const content = renderNode(rootId, doc, resolution, theme, diagnostics, visitedSections);
  return createElement(Fragment, {}, content as ReactNode);
}

export async function renderCraftDocument(options: {
  serialized: unknown;
  workspaceId: string;
  locale: string;
  theme?: ThemeTokens;
}): Promise<{ html: string; diagnostics: RenderDiagnostics }>
export async function renderCraftDocument(options: { serialized: unknown; workspaceId: string; locale: string; theme?: ThemeTokens }) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const doc = parseSerializedDocument(options.serialized);
  const refs = collectExternalReferences(doc);
  const resolution = await resolveExternalData(options.workspaceId, options.locale, refs);
  const diagnostics: RenderDiagnostics = {
    interactiveBlocks: [],
    missingComponents: [],
    usedLocale: options.locale,
    renderedSections: [],
  };
  const element = renderDocument(doc, resolution, options.theme ?? resolution.theme, diagnostics);
  const html = renderToStaticMarkup(element);
  return { html, diagnostics };
}
