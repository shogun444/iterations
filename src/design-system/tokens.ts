export const neutral = {
  0: "#ffffff",
  50: "#f8f9fa",
  100: "#f1f2f3",
  200: "#e7e9eb",
  300: "#dcdfe2",
  400: "#afb3b8",
  500: "#81858b",
  600: "#5f6369",
  700: "#4a4d52",
  800: "#2c2e31",
  900: "#121314",
  950: "#000000",
} as const;

export const accent = {
  coral: "#ff5364",
  coralSoft: "#fff0f1",
  emerald: "#10b980",
  emeraldSoft: "#ecfdf5",
  amber: "#feb600",
  amberSoft: "#fffbeb",
  indigo: "#6366f1",
  indigoSoft: "#eef2ff",
} as const;

export const color = {
  canvas: neutral[100],
  surface: neutral[0],
  surfaceSunken: neutral[50],
  line: neutral[300],
  lineSoft: neutral[200],
  ink: neutral[900],
  inkSecondary: neutral[600],
  inkMuted: neutral[400],
} as const;

export function tokensCss(scope = ":root") {
  return `
    ${scope} {
      --ds-canvas: ${color.canvas};
      --ds-surface: ${color.surface};
      --ds-surface-sunken: ${color.surfaceSunken};
      --ds-line: ${color.line};
      --ds-line-soft: ${color.lineSoft};
      --ds-ink: ${color.ink};
      --ds-ink-secondary: ${color.inkSecondary};
      --ds-ink-muted: ${color.inkMuted};
      --ds-accent-coral: ${accent.coral};
      --ds-accent-emerald: ${accent.emerald};
      --ds-accent-amber: ${accent.amber};
      --ds-accent-indigo: ${accent.indigo};
      --font-display-var: var(--font-display, "Timeless Serif", Georgia, serif);
      --font-ui-var: var(--font-ui, "Timeless Sans", system-ui, sans-serif);
      --font-hand-var: var(--font-hand, cursive);
    }
  `;
}

