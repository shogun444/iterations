import { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import { type BaseMessage, AIMessageChunk } from "@langchain/core/messages";
import { ChatGenerationChunk } from "@langchain/core/outputs";
import type { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";

export interface Oui1ChatModelOptions {
  systemPrompt: string;
  baseUrl?: string;
  maxNewTokens?: number;
}

export function getOui1GenerateUrl(overrideBaseUrl?: string): string {
  const raw = overrideBaseUrl || process.env.OPENUI_BASE_URL || "http://127.0.0.1:8005";
  if (raw.endsWith("/generate")) return raw;
  const trimmed = raw.replace(/\/+$/, "").replace(/\/v1$/, "");
  return `${trimmed}/generate`;
}

/**
 * Extracts and formats messages for the OUI-1 diffusion model.
 * - Initial generation: returns the user's latest prompt.
 * - Follow-up edit: injects the previous openui-lang screen code alongside the user's edit request.
 */
export function formatOui1Prompt(messages: BaseMessage[]): string {
  const nonSystem = messages.filter((m) => m._getType() !== "system");
  if (nonSystem.length <= 1) {
    const last = nonSystem.at(-1);
    if (!last) return "";
    return typeof last.content === "string" ? last.content : JSON.stringify(last.content);
  }

  // Find the most recent assistant message containing the previous UI DSL code
  const lastAiIndex = nonSystem.findLastIndex((m) => m._getType() === "ai");
  const currentHuman = nonSystem.at(-1);
  const currentText =
    currentHuman && typeof currentHuman.content === "string"
      ? currentHuman.content
      : JSON.stringify(currentHuman?.content ?? "");

  if (lastAiIndex !== -1) {
    const lastAiMessage = nonSystem[lastAiIndex];
    const previousUi =
      typeof lastAiMessage.content === "string"
        ? lastAiMessage.content
        : JSON.stringify(lastAiMessage.content ?? "");
    return `Previous UI:\n${previousUi.trim()}\n\nUser: ${currentText.trim()}`;
  }

  return currentText;
}

/**
 * Custom LangChain ChatModel connecting to the local OUI-1 FastAPI endpoint.
 * Inherits from SimpleChatModel and implements line-by-line chunk streaming.
 */
export class Oui1ChatModel extends SimpleChatModel {
  private systemPrompt: string;
  private endpointUrl: string;
  private maxNewTokens: number;

  constructor(options: Oui1ChatModelOptions) {
    super({});
    this.systemPrompt = options.systemPrompt;
    this.endpointUrl = getOui1GenerateUrl(options.baseUrl);
    this.maxNewTokens = options.maxNewTokens ?? 2048;
  }

  _llmType(): string {
    return "oui-1";
  }

  /**
   * Required by LangGraph createAgent when binding tools.
   * OUI-1 directly outputs OpenUI Lang DSL code rather than function calls.
   */
  bindTools(): this {
    return this;
  }

  async _call(messages: BaseMessage[]): Promise<string> {
    const prompt = formatOui1Prompt(messages);

    const res = await fetch(this.endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_prompt: this.systemPrompt,
        prompt,
        max_new_tokens: this.maxNewTokens,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(
        `OUI-1 generation failed at ${this.endpointUrl} (HTTP ${res.status}): ${errText}`,
      );
    }

    const data = (await res.json()) as { model?: string; output?: string };
    return data.output ?? "";
  }

  async *_streamResponseChunks(
    messages: BaseMessage[],
    _options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun,
  ): AsyncGenerator<ChatGenerationChunk> {
    const fullText = await this._call(messages);
    if (!fullText) return;

    // Stream line by line to feed OpenUI's streaming parser
    const lines = fullText.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const chunk = i < lines.length - 1 ? lines[i] + "\n" : lines[i];
      yield new ChatGenerationChunk({
        text: chunk,
        message: new AIMessageChunk({ content: chunk }),
      });
      await runManager?.handleLLMNewToken(chunk);
    }
  }
}

