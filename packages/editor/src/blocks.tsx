import { Element, useNode } from "@craftjs/core";
import type { CSSProperties, ReactNode } from "react";
import { defaultTheme, themeToCssVars, type ThemeTokens } from "./theme";
import type { BlockDefinition } from "./types";

const useConnectable = () => {
  const { connectors } = useNode();
  return (ref: HTMLElement | null) => {
    if (ref) {
      connectors.connect(connectors.drag(ref));
    }
  };
};

export type PageCanvasProps = {
  children?: ReactNode;
  padding?: number;
  gap?: number;
  background?: string;
  maxWidth?: number;
  theme?: ThemeTokens;
};

export function PageCanvas({ children, padding = 32, gap = 20, background = "#f8fafc", maxWidth = 1200, theme = defaultTheme }: PageCanvasProps) {
  const attach = useConnectable();
  const cssVars: CSSProperties = themeToCssVars(theme);
  return (
    <div
      ref={attach}
      style={{
        background: "var(--nb-surface, #f8fafc)",
        padding,
        minHeight: "100%",
        width: "100%",
        color: "var(--nb-text, #0f172a)",
        fontFamily: "var(--nb-font, 'Inter', system-ui, -apple-system, sans-serif)",
        ...cssVars,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap, maxWidth, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

PageCanvas.craft = {
  displayName: "Page",
  props: { padding: 32, gap: 20, background: "#f8fafc", maxWidth: 1200 },
  rules: { canMoveIn: () => true },
};

type HeadingProps = {
  text?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  align?: "left" | "center" | "right";
  children?: ReactNode;
};

export function HeadingBlock({ text = "Heading", level = "h2", align = "left", children }: HeadingProps) {
  const attach = useConnectable();
  const Tag = level ?? "h2";
  return (
    <Tag ref={attach} style={{ margin: 0, textAlign: align, fontWeight: 700 }}>
      {text}
      {children}
    </Tag>
  );
}

HeadingBlock.craft = {
  displayName: "Heading",
  props: { text: "Heading", level: "h2", align: "left" },
};

type ParagraphProps = { text?: string; align?: "left" | "center" | "right"; children?: ReactNode };

export function ParagraphBlock({ text = "Body copy", align = "left", children }: ParagraphProps) {
  const attach = useConnectable();
  return (
    <p ref={attach} style={{ margin: 0, lineHeight: 1.6, color: "var(--nb-text, #0f172a)", textAlign: align }}>
      {text}
      {children}
    </p>
  );
}

ParagraphBlock.craft = {
  displayName: "Paragraph",
  props: { text: "Body copy", align: "left" },
};

type ButtonProps = { label?: string; href?: string; variant?: "primary" | "secondary" | "ghost" };

export function ButtonBlock({ label = "Button", href = "#", variant = "primary" }: ButtonProps) {
  const attach = useConnectable();
  const palette = {
    primary: { background: "var(--nb-primary, #2563eb)", color: "#ffffff", border: "none" },
    secondary: { background: "#0f172a", color: "#ffffff", border: "none" },
    ghost: { background: "transparent", color: "#0f172a", border: "1px solid var(--nb-border, #cbd5e1)" },
  } as const;
  const style = palette[variant];

  return (
    <a
      ref={attach}
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 16px",
        borderRadius: 10,
        fontWeight: 600,
        textDecoration: "none",
        ...style,
      }}
    >
      {label}
    </a>
  );
}

ButtonBlock.craft = {
  displayName: "Button",
  props: { label: "Button", href: "#", variant: "primary" },
};

type LinkProps = { label?: string; href?: string };

export function LinkBlock({ label = "Link", href = "#" }: LinkProps) {
  const attach = useConnectable();
  return (
    <a ref={attach} href={href} style={{ color: "var(--nb-primary, #2563eb)", textDecoration: "underline", fontWeight: 600 }}>
      {label}
    </a>
  );
}

LinkBlock.craft = {
  displayName: "Link",
  props: { label: "Link", href: "#" },
};

type ChipProps = { label?: string };

export function ChipBlock({ label = "Chip" }: ChipProps) {
  const attach = useConnectable();
  return (
    <span
      ref={attach}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        background: "var(--nb-surface-alt, #f1f5f9)",
        color: "var(--nb-text, #0f172a)",
        border: "1px solid var(--nb-border, #e2e8f0)",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

ChipBlock.craft = {
  displayName: "Chip",
  props: { label: "Chip" },
};

type DividerProps = { thickness?: number };

export function DividerBlock({ thickness = 1 }: DividerProps) {
  const attach = useConnectable();
  return <div ref={attach} style={{ height: thickness, background: "var(--nb-border, #e2e8f0)", width: "100%" }} />;
}

DividerBlock.craft = {
  displayName: "Divider",
  props: { thickness: 1 },
};

type GridProps = { children?: ReactNode; columns?: number; gap?: number };

export function GridBlock({ children, columns = 3, gap = 16 }: GridProps) {
  const attach = useConnectable();
  return (
    <div ref={attach} style={{ display: "grid", gap, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {children}
    </div>
  );
}

GridBlock.craft = {
  displayName: "Grid",
  props: { columns: 3, gap: 16 },
  rules: { canMoveIn: () => true },
};

type CardProps = { title?: string; body?: string; media?: string; children?: ReactNode };

export function CardBlock({ title = "Card title", body = "Card body", media, children }: CardProps) {
  const attach = useConnectable();
  return (
    <div
      ref={attach}
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16,
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {media && <div style={{ width: "100%", borderRadius: 10, overflow: "hidden", background: "#f1f5f9", paddingBottom: "56%" }} />}
      {title && <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>}
      {body && <p style={{ margin: 0, color: "#475569" }}>{body}</p>}
      {children}
    </div>
  );
}

CardBlock.craft = {
  displayName: "Card",
  props: { title: "Card title", body: "Card body", media: "" },
  rules: { canMoveIn: () => true },
};

type CalloutProps = { text?: string; tone?: "info" | "success" | "warning" | "danger" };

export function CalloutBlock({ text = "Highlight information.", tone = "info" }: CalloutProps) {
  const attach = useConnectable();
  const tones: Record<string, string> = {
    info: "#eef2ff",
    success: "#ecfdf3",
    warning: "#fff7ed",
    danger: "#fef2f2",
  };
  return (
    <div ref={attach} style={{ borderRadius: 12, padding: "14px 16px", background: tones[tone], border: "1px solid #e2e8f0" }}>
      <span style={{ color: "#0f172a" }}>{text}</span>
    </div>
  );
}

CalloutBlock.craft = {
  displayName: "Callout",
  props: { text: "Highlight information.", tone: "info" },
};

type CarouselProps = { children?: ReactNode; caption?: string };

export function CarouselBlock({ children, caption }: CarouselProps) {
  const attach = useConnectable();
  return (
    <div
      ref={attach}
      style={{
        border: "1px dashed #cbd5e1",
        padding: 16,
        borderRadius: 12,
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {caption && <p style={{ margin: 0, fontWeight: 600 }}>{caption}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>{children}</div>
    </div>
  );
}

CarouselBlock.craft = {
  displayName: "Carousel",
  props: { caption: "Carousel" },
  rules: { canMoveIn: () => true },
};

type TableProps = { columns?: string[]; rows?: string[][] };

const defaultTable = {
  columns: ["Name", "Description", "Price"],
  rows: [
    ["Margherita", "San Marzano tomatoes, mozzarella", "$12"],
    ["Seasonal special", "Local produce, rotating menu", "$18"],
  ],
};

export function TableBlock({ columns = defaultTable.columns, rows = defaultTable.rows }: TableProps) {
  const attach = useConnectable();
  return (
    <table ref={attach} style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0" }}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e2e8f0" }}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {row.map((cell, cellIdx) => (
              <td key={cellIdx} style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

TableBlock.craft = {
  displayName: "Table",
  props: { columns: defaultTable.columns, rows: defaultTable.rows },
};

type MediaEmbedProps = { url?: string; alt?: string; aspect?: number };

export function MediaEmbedBlock({ url, alt = "Media", aspect = 56.25 }: MediaEmbedProps) {
  const attach = useConnectable();
  return (
    <div ref={attach} style={{ width: "100%", borderRadius: 12, overflow: "hidden", background: "#e2e8f0" }}>
      {url ? (
        <iframe src={url} title={alt} style={{ border: "none", width: "100%", aspectRatio: `16/${(aspect / 56.25) * 9}` }} />
      ) : (
        <div style={{ paddingBottom: `${aspect}%`, background: "linear-gradient(135deg,#e2e8f0,#f8fafc)" }} />
      )}
    </div>
  );
}

MediaEmbedBlock.craft = {
  displayName: "Media embed",
  props: { url: "", alt: "Media", aspect: 56.25 },
};

type MediaGalleryProps = { sources?: string[] };

export function MediaGalleryBlock({ sources = [] }: MediaGalleryProps) {
  const attach = useConnectable();
  const placeholders = sources.length ? sources : ["", "", "", ""];
  return (
    <div ref={attach} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
      {placeholders.map((src, idx) => (
        <div
          key={`${src}-${idx}`}
          style={{
            borderRadius: 10,
            overflow: "hidden",
            background: src ? `url(${src}) center/cover` : "#e2e8f0",
            paddingBottom: "75%",
          }}
        />
      ))}
    </div>
  );
}

MediaGalleryBlock.craft = {
  displayName: "Media gallery",
  props: { sources: [] },
};

type AccordionItem = { title: string; body: string };

type AccordionProps = { items?: AccordionItem[] };

export function AccordionBlock({ items = [] }: AccordionProps) {
  const attach = useConnectable();
  const rows = items.length
    ? items
    : [
        { title: "What are your hours?", body: "We are open daily from 10am to 9pm." },
        { title: "Do you take reservations?", body: "Yes, book online or call us." },
      ];
  return (
    <div ref={attach} style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
      {rows.map((item, idx) => (
        <div key={idx} style={{ padding: "14px 16px", borderBottom: idx === rows.length - 1 ? "none" : "1px solid #e2e8f0" }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{item.title}</p>
          <p style={{ margin: "4px 0 0", color: "#475569" }}>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

AccordionBlock.craft = {
  displayName: "Accordion",
  props: { items: [] },
};

type ModalProps = { label?: string; body?: string };

export function ModalBlock({ label = "Open modal", body = "Add modal content" }: ModalProps) {
  const attach = useConnectable();
  return (
    <div ref={attach} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#ffffff" }}>
      <button
        type="button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #cbd5e1",
          background: "#f8fafc",
          cursor: "pointer",
        }}
      >
        {label}
      </button>
      <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f8fafc" }}>{body}</div>
    </div>
  );
}

ModalBlock.craft = {
  displayName: "Modal",
  props: { label: "Open modal", body: "Add modal content" },
};

const sampleRows: Array<Record<string, string>> = [
  { name: "Seasonal special", description: "Rotating menu item", price: "$18" },
  { name: "House salad", description: "Local greens, citrus vinaigrette", price: "$12" },
];

const renderTemplate = (template: string, row: Record<string, string>) =>
  template.replace(/{{(.*?)}}/g, (_, key) => String(row[key.trim()] ?? ""));

type RepeatableListProps = {
  tableId?: string;
  template?: string;
  sort?: string;
  limit?: number;
};

export function RepeatableListBlock({ tableId, template = "{{name}} - {{price}}", sort, limit }: RepeatableListProps) {
  const attach = useConnectable();
  const rows = sampleRows.slice(0, limit ?? sampleRows.length);
  return (
    <div
      ref={attach}
      style={{ border: "1px dashed #cbd5e1", padding: 12, borderRadius: 10, background: "#f8fafc", color: "#0f172a" }}
    >
      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>
        Repeatable list · {tableId ?? "table_id"} {sort ? `· sort ${sort}` : ""}
      </div>
      <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 4 }}>
        {rows.map((row, idx) => (
          <li key={idx} style={{ color: "#0f172a" }}>
            {renderTemplate(template, row)}
          </li>
        ))}
      </ul>
    </div>
  );
}

RepeatableListBlock.craft = {
  displayName: "Repeatable list",
  props: { tableId: "menu_items", template: "{{name}} - {{price}}", limit: 3, sort: "" },
};

type RepeatableGridProps = { tableId?: string; template?: string; limit?: number };

export function RepeatableGridBlock({ tableId, template = "{{name}}", limit }: RepeatableGridProps) {
  const attach = useConnectable();
  const rows = sampleRows.slice(0, limit ?? sampleRows.length);
  return (
    <div
      ref={attach}
      style={{ border: "1px dashed #cbd5e1", padding: 12, borderRadius: 10, background: "#f8fafc", color: "#0f172a" }}
    >
      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>
        Repeatable grid · {tableId ?? "table_id"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
        {rows.map((row, idx) => (
          <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#fff" }}>
            {renderTemplate(template, row)}
          </div>
        ))}
      </div>
    </div>
  );
}

RepeatableGridBlock.craft = {
  displayName: "Repeatable grid",
  props: { tableId: "menu_items", template: "{{name}}", limit: 4 },
};

type GlobalSectionProps = { sectionKey?: string; name?: string };

export function GlobalSectionBlock({ sectionKey = "main-header", name = "Global section" }: GlobalSectionProps) {
  const attach = useConnectable();
  return (
    <div
      ref={attach}
      style={{
        border: "1px dashed #94a3b8",
        padding: 12,
        borderRadius: 10,
        background: "#f1f5f9",
        color: "#334155",
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>{name}</p>
      <p style={{ margin: "4px 0 0", fontSize: 12 }}>Section key: {sectionKey}</p>
      <p style={{ margin: "4px 0 0", fontSize: 12 }}>Updates here will propagate to all pages that reference this section.</p>
    </div>
  );
}

GlobalSectionBlock.craft = {
  displayName: "Global section",
  props: { sectionKey: "main-header", name: "Global section" },
};

export const craftResolver = {
  PageCanvas,
  HeadingBlock,
  ParagraphBlock,
  ButtonBlock,
  LinkBlock,
  ChipBlock,
  DividerBlock,
  GridBlock,
  CardBlock,
  CalloutBlock,
  CarouselBlock,
  TableBlock,
  MediaEmbedBlock,
  MediaGalleryBlock,
  AccordionBlock,
  ModalBlock,
  RepeatableListBlock,
  RepeatableGridBlock,
  GlobalSectionBlock,
};

export type CraftComponentName = keyof typeof craftResolver;

export const blockLibrary: BlockDefinition<CraftComponentName>[] = [
  { type: "HeadingBlock", label: "Heading", category: "text", description: "H1-H6 heading", defaultProps: { text: "Page heading", level: "h2" } },
  { type: "ParagraphBlock", label: "Paragraph", category: "text", description: "Body text", defaultProps: { text: "Add paragraph copy" } },
  { type: "ButtonBlock", label: "Button", category: "interaction", description: "Primary/secondary CTA", defaultProps: { label: "Button", href: "/" } },
  { type: "LinkBlock", label: "Link", category: "interaction", description: "Inline link", defaultProps: { label: "Read more", href: "/" } },
  { type: "ChipBlock", label: "Chip", category: "text", description: "Compact label" },
  { type: "DividerBlock", label: "Divider", category: "layout", description: "Horizontal rule" },
  { type: "GridBlock", label: "Grid", category: "layout", description: "Multi-column layout", defaultProps: { columns: 2 } },
  { type: "CardBlock", label: "Card", category: "content", description: "Card with title/body/media" },
  { type: "CalloutBlock", label: "Callout", category: "content", description: "Accent info box", defaultProps: { tone: "info" } },
  { type: "CarouselBlock", label: "Carousel", category: "media", description: "Horizontal carousel container" },
  { type: "TableBlock", label: "Table", category: "data", description: "Static table scaffold" },
  { type: "MediaEmbedBlock", label: "Media embed", category: "media", description: "Iframe/video embed" },
  { type: "MediaGalleryBlock", label: "Media gallery", category: "media", description: "Responsive gallery grid" },
  { type: "AccordionBlock", label: "Accordion", category: "content", description: "FAQ accordion" },
  { type: "ModalBlock", label: "Modal", category: "interaction", description: "Modal trigger + body" },
  { type: "RepeatableListBlock", label: "Repeatable list", category: "data", description: "Table-bound list", defaultProps: { tableId: "menu_items" } },
  { type: "RepeatableGridBlock", label: "Repeatable grid", category: "data", description: "Table-bound grid", defaultProps: { tableId: "products" } },
  { type: "GlobalSectionBlock", label: "Global section", category: "layout", description: "Reusable header/footer/banner" },
];

export const starterBlocks = (
  <Element is={PageCanvas} canvas padding={32} gap={20} background="#f8fafc">
    <HeadingBlock level="h1" text="Craft.js-powered builder" />
    <ParagraphBlock text="Drafts and publishes store Craft.js serialized JSON snapshots. Use the palette to add more blocks." />
    <GridBlock columns={3} gap={16}>
      <CardBlock title="Pages" body="Draft, schedule, publish, and rollback." />
      <CardBlock title="Data-bound" body="Repeatable grids and lists read from tables." />
      <CardBlock title="Global sections" body="Headers/footers stay in sync across pages." />
    </GridBlock>
    <CalloutBlock tone="info" text="Preview uses Next.js Draft Mode; publish persists serialized Craft trees." />
  </Element>
);
