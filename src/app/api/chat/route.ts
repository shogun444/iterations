import librarySpec from "@/generated/spec.json";
import { createOpenAI } from "@ai-sdk/openai";
import { generateSystemPrompt } from "@openuidev/lang-core";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { storeTurn } from "@/lib/history";
import { resolveRequestedModel } from "@/lib/models";
import { appTools } from "@/lib/tools";

const { promptOptions, ...library } = librarySpec;

export const runtime = "nodejs";

const apiKey = process.env.THESYS_API_KEY || "";
const openai = createOpenAI({ baseURL: "https://api.thesys.dev/v1/embed", apiKey: apiKey || "dummy" });

function sanitizeOpenUIProgram(rawCode: string): string {
  let lines = rawCode
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Remove markdown fences if model added them
  lines = lines.filter((l) => !l.startsWith("```"));

  // 2. Strip any TaskCard or TaskCards statements (cards are completely removed)
  lines = lines.filter((l) => !/=\s*TaskCard\s*\(/.test(l) && !/=\s*TaskCards\s*\(/.test(l));

  // 3. Discard any unfinished trailing line (must end with closing parenthesis)
  lines = lines.filter((l) => /\)\s*$/.test(l));

  // 4. Fix duplicate trailing double quotes e.g. `=="")` -> `==")`
  lines = lines.map((l) => l.replace(/""\)/g, '")'));

  // 5. Collect all defined statement IDs (e.g. `headline = ...`, `list = ...`)
  const defined = new Set<string>();
  for (const l of lines) {
    const m = l.match(/^([a-zA-Z_]\w*)\s*=/);
    if (m) defined.add(m[1]);
  }

  // 6. Clean references in arrays: e.g. [headline, focus, cards, list, follow] -> remove undefined ones
  const sanitizedLines = lines.map((line) => {
    return line.replace(/\[(.*?)\]/g, (_match, inner) => {
      const items = inner
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const valid = items.filter((id: string) => {
        // String literal or number
        if (/^["'\d]/.test(id)) return true;
        // Must be a defined identifier
        return defined.has(id);
      });
      return `[${valid.join(", ")}]`;
    });
  });

  return sanitizedLines.join("\n");
}

export async function POST(req: Request) {
  const {
    messages,
    threadId,
    model: requestedModel,
  } = (await req.json()) as {
    messages?: UIMessage[];
    threadId?: string;
    model?: unknown;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return badRequest("messages must be a non-empty UIMessage[]");
  }

  if (typeof threadId !== "string" || !threadId.trim()) {
    return badRequest("threadId is required");
  }

  const model = resolveRequestedModel(requestedModel);
  if (!model) {
    return badRequest("model is not available in this agent");
  }

  const modelMessages = await convertToModelMessages(messages);
  const question = modelMessages.at(-1);
  if (question?.role !== "user") {
    return badRequest("messages must end with a user message");
  }

  // Hook directly into local/cloud OUI-1 endpoint on port 8005
  if (model === "thesys/oui-1-local") {
    try {
      const system = generateSystemPrompt({ cloud: false, library, promptOptions });
      let promptHistory = "";
      for (const m of modelMessages) {
        const text =
          typeof m.content === "string"
            ? m.content
            : Array.isArray(m.content)
              ? m.content.map((p) => ("text" in p && typeof p.text === "string" ? p.text : "")).join("")
              : "";
        promptHistory += `\n${m.role === "user" ? "User" : "Assistant"}: ${text}`;
      }
      const fullPrompt = `${system}\n${promptHistory}\nAssistant:`;

      const res = await fetch("http://localhost:8005/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
        signal: req.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        return Response.json(
          { error: { message: `OUI-1 generation error: ${errText}` } },
          { status: 500 },
        );
      }

      const data = (await res.json()) as { output?: string };
      const rawCode = (data.output || "").trim();
      const code = sanitizeOpenUIProgram(rawCode);

      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({ type: "start-step" });
          writer.write({ type: "text-start", id: "oui-1-msg" });

          const lines = code.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Stream token/word chunks progressively rather than dropping entire blocks at once
            const tokens = line.match(/\S+\s*|\s+/g) || [line];
            for (const token of tokens) {
              writer.write({ type: "text-delta", id: "oui-1-msg", delta: token });
              await new Promise((resolve) => setTimeout(resolve, 28));
            }
            if (i < lines.length - 1) {
              writer.write({ type: "text-delta", id: "oui-1-msg", delta: "\n" });
              await new Promise((resolve) => setTimeout(resolve, 60));
            }
          }

          writer.write({ type: "text-end", id: "oui-1-msg" });
          writer.write({ type: "finish-step" });

          if (apiKey && threadId) {
            try {
              await storeTurn({
                apiKey,
                conversationId: threadId,
                messages: [
                  question,
                  { role: "assistant", content: [{ type: "text", text: code }] } as never,
                ],
              });
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              // Ignore 404 when running with local client threads that aren't hosted on Thesys Cloud
              if (!msg.includes("404") && !msg.includes("Conversation not found")) {
                console.warn("Notice: OpenUI Cloud sync skipped:", msg);
              }
            }
          }
        },
      });

      return createUIMessageStreamResponse({ stream });
    } catch (err) {
      console.error("OUI-1 local call failed:", err);
      return Response.json(
        { error: { message: err instanceof Error ? err.message : "OUI-1 generation failed" } },
        { status: 500 },
      );
    }
  }

  // Cloud model fallback via Thesys Gateway
  const result = streamText({
    model: openai.chat(model),
    system: generateSystemPrompt({ cloud: true, library, promptOptions }),
    messages: modelMessages,
    tools: appTools,
    stopWhen: stepCountIs(5),
    abortSignal: req.signal,
    onEnd: async ({ responseMessages }) => {
      if (apiKey) {
        try {
          await storeTurn({
            apiKey,
            conversationId: threadId,
            messages: [question, ...responseMessages],
          });
        } catch (error) {
          console.error("Failed to save turn to OpenUI Cloud:", error);
        }
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}

function badRequest(message: string): Response {
  return Response.json({ error: { message } }, { status: 400 });
}
