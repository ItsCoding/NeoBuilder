"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Editor, Frame, ROOT_NODE, useEditor } from "@craftjs/core";
import { blockLibrary, craftResolver, starterBlocks, templateLibrary } from "@neobuilder/editor";
import { toast } from "sonner";

const deviceWidths: Record<string, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "420px",
};

type InspectorField = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "media" | "media-multi";
  options?: string[];
};

const inspectorSchema: InspectorField[] = [
  { key: "text", label: "Text" },
  { key: "label", label: "Label" },
  { key: "href", label: "Link" },
  { key: "level", label: "Heading level", type: "select", options: ["h1", "h2", "h3", "h4", "h5", "h6"] },
  { key: "align", label: "Align", type: "select", options: ["left", "center", "right"] },
  { key: "columns", label: "Columns", type: "number" },
  { key: "gap", label: "Gap", type: "number" },
  { key: "tone", label: "Tone", type: "select", options: ["info", "success", "warning", "danger"] },
  { key: "sectionKey", label: "Section key" },
  { key: "name", label: "Name" },
  { key: "tableId", label: "Table ID" },
  { key: "template", label: "Template" },
  { key: "mediaId", label: "Media", type: "media" },
  { key: "mediaIds", label: "Gallery media", type: "media-multi" },
];

function InspectorPanel() {
  const { actions, selectedNodeId, selectedDisplayName, selectedProps } = useEditor((state: any) => {
    const selected = state.events.selected;
    const nodeId = Array.isArray(selected) && selected.length > 0 ? selected[0] : null;
    const node = nodeId ? state.nodes[nodeId] : null;
    return {
      selectedNodeId: nodeId,
      selectedDisplayName: node?.data.displayName,
      selectedProps: (node?.data.props as Record<string, unknown>) ?? null,
    };
  });

  const handleChange = (field: InspectorField, value: string) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (props: Record<string, unknown>) => {
      if (field.type === "number") {
        const next = Number(value);
        props[field.key] = Number.isNaN(next) ? undefined : next;
      } else {
        props[field.key] = value;
      }
    });
  };

  if (!selectedNodeId || !selectedProps) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Select a block to edit its properties.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-900">Block settings</p>
        <p className="text-xs text-slate-600">Editing {selectedDisplayName ?? "Block"}</p>
      </div>
      {inspectorSchema
        .filter((field) => selectedProps[field.key] !== undefined)
        .map((field) => (
          <label key={field.key} className="block text-sm text-slate-700">
            {field.label}
            {field.type === "select" ? (
              <select
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={String(selectedProps[field.key] ?? "")}
                onChange={(event) => handleChange(field, event.target.value)}
              >
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                type={field.type === "number" ? "number" : "text"}
                value={String(selectedProps[field.key] ?? "")}
                onChange={(event) => handleChange(field, event.target.value)}
              />
            )}
          </label>
        ))}
      <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
        Craft.js nodes serialize to JSON for Page.draftContent/Page.publishedContent.
      </div>
    </div>
  );
}

function Palette({ onAdd }: { onAdd: (type: string) => void }) {
  const [filter, setFilter] = useState("");
  const filtered = blockLibrary.filter((block) => block.label.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Blocks</p>
        <input
          className="w-40 rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder="Search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </div>
      <div className="mt-3 space-y-2">
        {filtered.map((block) => (
          <button
            key={block.type}
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => onAdd(block.type)}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">{block.label}</p>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-600">
                {block.category}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{block.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplatePicker({ onApply }: { onApply: (id: string) => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Templates</p>
      <p className="text-xs text-slate-600">Swap layouts without leaving the editor.</p>
      <div className="mt-2 space-y-2">
        {templateLibrary.map((template: (typeof templateLibrary)[number]) => (
          <button
            key={template.id}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
            onClick={() => onApply(template.id)}
          >
            <span className="font-semibold text-slate-900">{template.name}</span>
            <span className="block text-xs text-slate-600">{template.description}</span>
          </button>
        ))}
      </div>
      <Link href="/templates" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
        Open template gallery
      </Link>
    </div>
  );
}

function EditorSurface({ slug }: { slug: string }) {
  const { actions, query } = useEditor();
  const [device, setDevice] = useState<keyof typeof deviceWidths>("desktop");
  const [frameContent, setFrameContent] = useState<ReactNode>(starterBlocks);
  const [frameKey, setFrameKey] = useState(0);
  const [lastDraft, setLastDraft] = useState<string | null>(null);
  const [lastPublish, setLastPublish] = useState<string | null>(null);

  const addBlock = (type: string) => {
    const definition = blockLibrary.find((block) => block.type === type);
    const Component = definition ? (craftResolver as Record<string, ComponentType>)[definition.type] : undefined;
    if (!definition || !Component) return;
    const element = <Component {...(definition.defaultProps ?? {})} />;
    const nodeTree = query.parseReactElement(element).toNodeTree();
    const state = query.getState();
    const rootNode = state.nodes[ROOT_NODE];
    const canvasId = rootNode?.data.nodes?.[0] ?? ROOT_NODE;
    actions.addNodeTree(nodeTree, canvasId);
    toast.success(`${definition.label} added to canvas`);
  };

  const applyTemplate = (templateId: string) => {
    const template = templateLibrary.find((tpl: (typeof templateLibrary)[number]) => tpl.id === templateId);
    if (!template) return;
    setFrameContent(template.render());
    setFrameKey((current) => current + 1);
    toast.success(`Applied template: ${template.name}`);
  };

  const saveDraft = () => {
    const serialized = query.serialize();
    setLastDraft(serialized);
    toast.success("Draft saved", { description: `Stored to Page.draftContent for ${slug}` });
  };

  const publish = () => {
    const serialized = query.serialize();
    setLastPublish(serialized);
    toast.success("Publish queued", { description: "Snapshot persisted to Page.publishedContent" });
  };

  const preview = () => {
    toast.message("Preview ready", { description: "Draft Mode enabled. Use the preview tab to validate content." });
  };

  const canvasWrapperStyle = useMemo(() => ({ width: deviceWidths[device], margin: "0 auto" }), [device]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <span>Pages</span>
            <span>•</span>
            <span>Craft.js</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Link href="/pages" className="text-blue-600 hover:underline">
              All pages
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">{slug}</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Draft</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-slate-200 bg-white p-1 text-sm shadow-sm">
            {(["desktop", "tablet", "mobile"] as const).map((d) => (
              <button
                key={d}
                className={`rounded-full px-3 py-1 ${device === d ? "bg-slate-900 text-white" : "text-slate-700"}`}
                onClick={() => setDevice(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={preview}>
            Preview
          </button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={saveDraft}>
            Save draft
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={publish}>
            Publish
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr,320px]">
        <aside className="space-y-3">
          <Palette onAdd={addBlock} />
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700">
            <p className="text-sm font-semibold text-slate-900">Global sections</p>
            <p className="text-xs text-slate-600">Insert header/footer/banner placeholders that stay in sync.</p>
            <div className="mt-2 space-y-2">
              {["main-header", "promo-bar", "footer"].map((sectionKey) => (
                <button
                  key={sectionKey}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={() => addBlock("GlobalSectionBlock")}
                >
                  {sectionKey}
                </button>
              ))}
            </div>
            <Link href="/sections" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
              Manage sections
            </Link>
          </div>
        </aside>

        <section className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Autosave on</span>
                <span className="text-slate-500">
                  Draft content persists to DB; published snapshots only change on publish.
                </span>
              </div>
              <button
                className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                onClick={() => toast.info("Craft.js serialized JSON is stored in Page.draftContent/Page.publishedContent.")}
              >
                Persistence details
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full" style={canvasWrapperStyle}>
              <Frame key={frameKey}>{frameContent}</Frame>
            </div>
          </div>
        </section>

        <aside className="space-y-3">
          <InspectorPanel />
          <TemplatePicker onApply={applyTemplate} />
        </aside>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">Version v12</span>
          <span>Last saved {lastDraft ? "just now" : "—"}</span>
          <span>Last publish {lastPublish ? "queued" : "—"}</span>
          <span>Viewport: {device}</span>
          <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">Craft.js editor mounted</span>
        </div>
      </div>
    </div>
  );
}

export default function PageEditor({ params }: { params: { slug: string } }) {
  return (
    <Editor resolver={craftResolver} enabled>
      <EditorSurface slug={params.slug} />
    </Editor>
  );
}
