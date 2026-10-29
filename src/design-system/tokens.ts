/**
 * Design Tokens for X Wallet (Stellar Desktop Web)
 * Adheres to Section 7 of X_Wallet_Stellar_OpenUI_PRD.docx
 */

export const tokens = {
  color: {
    canvas: "#F5F7FB",
    surface: "#FFFFFF",
    surfaceSubtle: "#EEF2F7",
    border: "#DCE3ED",
    borderStrong: "#C7D2E1",
    ink: "#101828",
    inkSecondary: "#475467",
    inkMuted: "#667085",
    stellarNavy: "#0B1020",
    stellarBlue: "#1677FF",
    stellarCyan: "#36C5F0",
    stellarBlueSoft: "#E8F2FF",
    success: "#168A5B",
    warning: "#B76E00",
    danger: "#D92D20",
    info: "#1D6FE8",
  },
  gradient: {
    balance: "linear-gradient(125deg, #0B3A74 0%, #1677FF 54%, #36C5F0 100%)",
    selected: "linear-gradient(135deg, rgba(22, 119, 255, 0.12), rgba(54, 197, 240, 0.10))",
    cardGlow: "radial-gradient(ellipse at top right, rgba(54, 197, 240, 0.25), transparent 70%)",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    base: "16px",
    lg: "20px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "40px",
    "4xl": "48px",
    "5xl": "64px",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    pill: "9999px",
  },
  elevation: {
    flat: "0 1px 2px rgba(16, 24, 40, 0.04)",
    card: "0 4px 14px rgba(16, 24, 40, 0.06)",
    overlay: "0 16px 48px rgba(16, 24, 40, 0.16)",
  },
  font: {
    family:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
} as const;

/** Converts token definitions to CSS variables string for injection into globals.css or root */
export function getTokensCssVariables(): string {
  return `
  --xw-canvas: ${tokens.color.canvas};
  --xw-surface: ${tokens.color.surface};
  --xw-surface-subtle: ${tokens.color.surfaceSubtle};
  --xw-border: ${tokens.color.border};
  --xw-border-strong: ${tokens.color.borderStrong};
  --xw-ink: ${tokens.color.ink};
  --xw-ink-secondary: ${tokens.color.inkSecondary};
  --xw-ink-muted: ${tokens.color.inkMuted};
  --xw-stellar-navy: ${tokens.color.stellarNavy};
  --xw-stellar-blue: ${tokens.color.stellarBlue};
  --xw-stellar-cyan: ${tokens.color.stellarCyan};
  --xw-stellar-blue-soft: ${tokens.color.stellarBlueSoft};
  --xw-success: ${tokens.color.success};
  --xw-warning: ${tokens.color.warning};
  --xw-danger: ${tokens.color.danger};
  --xw-info: ${tokens.color.info};
  --xw-gradient-balance: ${tokens.gradient.balance};
  --xw-gradient-selected: ${tokens.gradient.selected};
  --xw-card-shadow: ${tokens.elevation.card};
  --xw-overlay-shadow: ${tokens.elevation.overlay};
  `;
}

