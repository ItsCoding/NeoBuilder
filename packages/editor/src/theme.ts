import type { CSSProperties } from "react";

export type ThemeTokens = {
  primary: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  mutedText: string;
  border: string;
  accent: string;
  radius: number;
  fontFamily: string;
};

export const defaultTheme: ThemeTokens = {
  primary: "#2563eb",
  surface: "#f8fafc",
  surfaceAlt: "#ffffff",
  text: "#0f172a",
  mutedText: "#475569",
  border: "#e2e8f0",
  accent: "#0ea5e9",
  radius: 12,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

export function themeToCssVars(theme: ThemeTokens): CSSProperties {
  return {
    "--nb-primary": theme.primary,
    "--nb-surface": theme.surface,
    "--nb-surface-alt": theme.surfaceAlt,
    "--nb-text": theme.text,
    "--nb-muted-text": theme.mutedText,
    "--nb-border": theme.border,
    "--nb-accent": theme.accent,
    "--nb-radius": `${theme.radius}px`,
    "--nb-font": theme.fontFamily,
  } as CSSProperties;
}
