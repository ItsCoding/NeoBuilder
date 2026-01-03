import type { CSSProperties, ReactNode } from "react";
import { defaultTheme, themeToCssVars, type ThemeTokens } from "@neobuilder/editor/src/theme";

type WithTheme = { theme?: ThemeTokens };

export function PageCanvas({ children, padding = 32, gap = 20, background = "#f8fafc", maxWidth = 1200, theme = defaultTheme }: { children?: ReactNode; padding?: number; gap?: number; background?: string; maxWidth?: number } & WithTheme) {
  const cssVars: CSSProperties = themeToCssVars(theme);
  return (
    <div
      style={{
        background,
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

export function HeadingBlock({ text = "Heading", level = "h2", align = "left", children }: { text?: string; level?: keyof JSX.IntrinsicElements; align?: "left" | "center" | "right"; children?: ReactNode }) {
  const Tag = (level ?? "h2") as keyof JSX.IntrinsicElements;
  return (
    <Tag style={{ margin: 0, textAlign: align, fontWeight: 700, color: "var(--nb-text, #0f172a)" }}>
      {text}
      {children}
    </Tag>
  );
}

export function ParagraphBlock({ text = "Body copy", align = "left", children }: { text?: string; align?: "left" | "center" | "right"; children?: ReactNode }) {
  return (
    <p style={{ margin: 0, lineHeight: 1.6, color: "var(--nb-text, #0f172a)", textAlign: align }}>
      {text}
      {children}
    </p>
  );
}

export function ButtonBlock({ label = "Button", href = "#", variant = "primary" }: { label?: string; href?: string; variant?: "primary" | "secondary" | "ghost" }) {
  const palette = {
    primary: { background: "var(--nb-primary, #2563eb)", color: "#ffffff", border: "none" },
    secondary: { background: "#0f172a", color: "#ffffff", border: "none" },
    ghost: { background: "transparent", color: "#0f172a", border: "1px solid var(--nb-border, #cbd5e1)" },
  } as const;
  const style = palette[variant];
  return (
    <a
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

export function LinkBlock({ label = "Link", href = "#" }: { label?: string; href?: string }) {
  return (
    <a href={href} style={{ color: "var(--nb-primary, #2563eb)", textDecoration: "underline", fontWeight: 600 }}>
      {label}
    </a>
  );
}

export function ChipBlock({ label = "Chip" }: { label?: string }) {
  return (
    <span
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

export function DividerBlock({ thickness = 1 }: { thickness?: number }) {
  return <div style={{ height: thickness, background: "var(--nb-border, #e2e8f0)", width: "100%" }} />;
}

export function GridBlock({ children, columns = 3, gap = 16 }: { children?: ReactNode; columns?: number; gap?: number }) {
  return <div style={{ display: "grid", gap, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{children}</div>;
}

export function CardBlock({ title = "Card title", body = "Card body", mediaUrl, children }: { title?: string; body?: string; mediaUrl?: string; children?: ReactNode }) {
  return (
    <div
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
      {mediaUrl && <img src={mediaUrl} alt="" style={{ width: "100%", borderRadius: 10, objectFit: "cover" }} />}
      {title && <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>}
      {body && <p style={{ margin: 0, color: "#475569" }}>{body}</p>}
      {children}
    </div>
  );
}

export function CalloutBlock({ text = "Highlight information.", tone = "info" }: { text?: string; tone?: "info" | "success" | "warning" | "danger" }) {
  const tones: Record<string, string> = {
    info: "#eef2ff",
    success: "#ecfdf3",
    warning: "#fff7ed",
    danger: "#fef2f2",
  };
  return (
    <div
      style={{
        background: tones[tone] ?? tones.info,
        borderRadius: 12,
        padding: 16,
        border: "1px solid #e2e8f0",
        color: "#0f172a",
      }}
    >
      {text}
    </div>
  );
}

export function CarouselBlock({ children }: { children?: ReactNode }) {
  return (
    <div data-block="carousel" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 2px" }}>
      {children}
    </div>
  );
}

export function TableBlock({ headers = ["Column"], rows = [[]] }: { headers?: string[]; rows?: (string | number)[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td key={cidx} style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9" }}>
                  {cell as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MediaEmbedBlock({ url = "https://www.youtube.com/embed/dQw4w9WgXcQ", title = "Embedded media" }: { url?: string; title?: string }) {
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12 }}>
      <iframe
        src={url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}

export function MediaGalleryBlock({ items = [] as { url: string; alt?: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
      {items.map((item, idx) => (
        <picture key={`${item.url}-${idx}`}>
          <img src={item.url} alt={item.alt ?? ""} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
        </picture>
      ))}
    </div>
  );
}

export function AccordionBlock({ items = [] as { title: string; body: string }[] }) {
  return (
    <div data-block="accordion" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, idx) => (
        <details key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", background: "#fff" }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--nb-text, #0f172a)" }}>{item.title}</summary>
          <p style={{ marginTop: 8, color: "#475569" }}>{item.body}</p>
        </details>
      ))}
    </div>
  );
}

export function ModalBlock({ triggerLabel = "Open modal", body = "Modal content" }: { triggerLabel?: string; body?: string }) {
  return (
    <div data-block="modal" style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
      <button type="button" style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff" }}>
        {triggerLabel}
      </button>
      <div data-modal-body style={{ display: "none", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}>
        {body}
      </div>
    </div>
  );
}

export function RepeatableListBlock({ header = "list", items = [] as string[] }: { header?: string; items?: string[] }) {
  return (
    <div style={{ border: "1px dashed #cbd5e1", padding: 12, borderRadius: 10, background: "#f8fafc", color: "#0f172a" }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>{header}</div>
      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function RepeatableGridBlock({ header = "grid", items = [] as string[] }: { header?: string; items?: string[] }) {
  return (
    <div style={{ border: "1px dashed #cbd5e1", padding: 12, borderRadius: 10, background: "#f8fafc", color: "#0f172a" }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>{header}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#fff" }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GlobalSectionBlock({ sectionKey = "section", note }: { sectionKey?: string; note?: string }) {
  return (
    <div
      style={{
        border: "1px dashed #94a3b8",
        padding: 12,
        borderRadius: 10,
        background: "#f1f5f9",
        color: "#334155",
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>{note ?? "Global section"}</p>
      <p style={{ margin: "4px 0 0", fontSize: 12 }}>Section key: {sectionKey}</p>
    </div>
  );
}

export const serverBlockRegistry = {
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

export type ServerBlockName = keyof typeof serverBlockRegistry;
