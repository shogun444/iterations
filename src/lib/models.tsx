import type { ModelOption } from "@openuidev/react-ui";

export const DEFAULT_MODEL = "thesys/oui-1-local";

// Per-model { light, dark } logo pairs — the switcher swaps them by theme.
const logo = {
  anthropic: {
    light: <img src="/logos/anthropic-light.svg" alt="" />,
    dark: <img src="/logos/anthropic-dark.svg" alt="" />,
  },
  openai: {
    light: <img src="/logos/openai-light.svg" alt="" />,
    dark: <img src="/logos/openai-dark.svg" alt="" />,
  },
  google: {
    light: <img src="/logos/google-light.svg" alt="" />,
    dark: <img src="/logos/google-dark.svg" alt="" />,
  },
};

// The app's model menu — `group` drives the dropdown sections, in this order.
export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "thesys/oui-1-local",
    name: "OUI-1 (Cloud/Local)",
    group: "Local Model",
    badge: "Connected",
    logo: logo.google,
  },
  {
    id: "google/gemini-3.6-flash-free",
    name: "Gemini 3.6 Flash",
    group: "Cloud Included",
    badge: "Free",
    logo: logo.google,
  },
  {
    id: "google/gemini-3.1-pro-free",
    name: "Gemini 3.1 Pro",
    group: "Cloud Included",
    badge: "Free",
    logo: logo.google,
  },
  {
    id: "google/gemini-3.1-flash-lite-free",
    name: "Gemini 3.1 Flash Lite",
    group: "Cloud Included",
    badge: "Free",
    logo: logo.google,
  },
  {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    group: "Anthropic",
    logo: logo.anthropic,
  },
  {
    id: "openai/gpt-5.5",
    name: "GPT-5.5",
    group: "OpenAI",
    logo: logo.openai,
  },
];

const MODEL_IDS = new Set(MODEL_OPTIONS.map((model) => model.id));

/** Absent → default; unknown → null (the route rejects it). */
export function resolveRequestedModel(model: unknown): string | null {
  if (model === undefined || model === null || model === "") return DEFAULT_MODEL;
  return typeof model === "string" && MODEL_IDS.has(model) ? model : null;
}
