import type { ThemeTokens } from "./theme";

export const tokenPresets: Record<string, ThemeTokens> = {
  default: {
    primary: "#2563eb",
    surface: "#f8fafc",
    surfaceAlt: "#ffffff",
    text: "#0f172a",
    mutedText: "#475569",
    border: "#e2e8f0",
    accent: "#0ea5e9",
    radius: 12,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  dusk: {
    primary: "#7c3aed",
    surface: "#0f172a",
    surfaceAlt: "#1e293b",
    text: "#e2e8f0",
    mutedText: "#94a3b8",
    border: "#334155",
    accent: "#22d3ee",
    radius: 14,
    fontFamily: "'Manrope', 'Inter', system-ui, sans-serif",
  },
};

export const defaultTokens = tokenPresets.default;
