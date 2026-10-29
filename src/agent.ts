import { createRequire } from "node:module";
import { tool } from "@langchain/core/tools";
import { StateSchema } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { generateSystemPrompt } from "@openuidev/lang-core";
import { storeLangGraphHistory } from "@openuidev/server/langgraph";
import { createAgent, createMiddleware } from "langchain";
import { z } from "zod";
import { DEFAULT_MODEL, isLocalModel } from "./lib/models";
import { Oui1ChatModel } from "./lib/oui1-model";
import { executeGetWeather, getWeatherTool } from "./lib/tools/get-weather";

const require = createRequire(import.meta.url);
const librarySpec = require("./generated/spec.json");

// The generated spec carries the library and its prompt options; generateSystemPrompt takes them separately.
const { promptOptions, ...library } = librarySpec;

// Local OpenUI system prompt generated from the component library (without cloud-specific config wrapper)
const localSystemPrompt = generateSystemPrompt({ library, promptOptions });

const getWeather = tool(
  async ({ location }, config) =>
    executeGetWeather(JSON.stringify({ location }), { signal: config.signal }),
  {
    name: "get_weather",
    description: getWeatherTool.description,
    schema: z.object({
      location: z.string().trim().min(1).describe("City or place name, e.g. Berlin."),
    }),
  },
);

const CloudAgentState = new StateSchema({
  conversationId: z.string(),
  turnStart: z.number().int().nonnegative(),
  model: z.string().default(DEFAULT_MODEL),
});

function resolveModel(modelName: string) {
  if (isLocalModel(modelName)) {
    return new Oui1ChatModel({ systemPrompt: localSystemPrompt });
  }

  const apiKey = process.env.THESYS_API_KEY;
  if (!apiKey) {
    throw new Error(
      `THESYS_API_KEY is required to use cloud model "${modelName}". To run locally, select "OUI-1 Local".`,
    );
  }

  return new ChatOpenAI({
    model: modelName,
    apiKey,
    streaming: true,
    useResponsesApi: false,
    configuration: { baseURL: "https://api.thesys.dev/v1/embed" },
  });
}

const selectedModel = createMiddleware({
  name: "OpenUISelectedModel",
  stateSchema: CloudAgentState,
  wrapModelCall: async (request, handler) => {
    const { model } = request.state as unknown as { model: string };
    return handler({ ...request, model: resolveModel(model) });
  },
});

const persistTurn = createMiddleware({
  name: "OpenUICloudHistory",
  stateSchema: CloudAgentState,
  afterAgent: async (state) => {
    const { model } = state as unknown as { model: string };
    // Skip remote cloud persistence for local OUI-1 or when no API key is provided
    if (isLocalModel(model) || !process.env.THESYS_API_KEY) {
      return;
    }

    // Save the completed turn in one call: new user message, assistant messages,
    // tool calls, and tool results. Exclude all replayed history.
    await storeLangGraphHistory({
      apiKey: process.env.THESYS_API_KEY,
      conversationId: state.conversationId,
      messages: state.messages.slice(state.turnStart),
    });
  },
});

/** LangGraph owns the tool loop; OUI-1 (local) or OpenUI Cloud provides model inference. */
export const graph = createAgent({
  model: resolveModel(DEFAULT_MODEL),
  tools: [getWeather],
  systemPrompt: localSystemPrompt,
  stateSchema: CloudAgentState,
  middleware: [selectedModel, persistTurn],
});
