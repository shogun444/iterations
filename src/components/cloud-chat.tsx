"use client";

import { useMemo, useRef } from "react";
import { OpenUIWordmark } from "@/components/openui-wordmark";
import { usePersistedModel } from "@/hooks/use-persisted-model";
import { createLocalStorageChatStorage, saveStoredLocalMessages } from "@/lib/local-storage";
import { isLocalModel, MODEL_OPTIONS } from "@/lib/models";
import { OPENUI_LOGO, STARTERS } from "@/lib/starters";
import type { AssistantMessage, ChatLLM, Message } from "@openuidev/react-headless";
import {
  AgentInterface,
  fetchLLM,
  langGraphAdapter,
  langGraphMessageFormat,
  ModelSwitcher,
  openuiLibrary,
  useOpenuiCloudStorage,
  useThemeModePreference,
  WelcomeMascot,
} from "@openuidev/react-ui";

export default function CloudChat() {
  // Follows the system theme until the footer toggle is first used, then
  // remembers the choice.
  const { setPreference, mode } = useThemeModePreference();
  const [selectedModel, setSelectedModel] = usePersistedModel();
  const isLocal = isLocalModel(selectedModel);

  const activeThreadRef = useRef<{ threadId: string; messages: Message[] }>({
    threadId: "",
    messages: [],
  });

  // The /api/chat route runs the LangGraph agent in-process and streams its
  // native `messages`-mode SSE. Outgoing messages are converted to LangChain
  // shape here so the route can pass them to the graph as-is.
  const baseLLM = useMemo(
    () =>
      fetchLLM({
        url: "/api/chat",
        streamAdapter: langGraphAdapter(),
        messageFormat: langGraphMessageFormat,
        body: { model: selectedModel },
      }),
    [selectedModel],
  );

  const llm = useMemo<ChatLLM>(() => {
    if (!isLocal) return baseLLM;

    return {
      async send(params) {
        activeThreadRef.current = {
          threadId: params.threadId,
          messages: params.messages,
        };
        return baseLLM.send(params);
      },
      streamProtocol: {
        async *parse(response: Response) {
          let accumulatedText = "";
          let messageId = crypto.randomUUID();

          for await (const event of baseLLM.streamProtocol.parse(response)) {
            if (event.type === "TEXT_MESSAGE_START" && event.messageId) {
              messageId = event.messageId;
            }
            if (event.type === "TEXT_MESSAGE_CONTENT" && event.delta) {
              accumulatedText += event.delta;
            }
            yield event;
          }

          const { threadId, messages } = activeThreadRef.current;
          if (threadId && accumulatedText) {
            const assistantMsg: AssistantMessage = {
              id: messageId,
              role: "assistant",
              content: accumulatedText,
            };
            saveStoredLocalMessages(threadId, [...messages, assistantMsg]);
          }
        },
      },
    };
  }, [baseLLM, isLocal]);

  const localStorage = useMemo(() => createLocalStorageChatStorage(), []);
  const cloudStorage = useOpenuiCloudStorage({
    token: "/api/frontend-token",
    apiBaseUrl: "https://api.thesys.dev",
    features: { artifact: false },
  });

  const storage = isLocal ? localStorage : cloudStorage;

  return (
    <AgentInterface
      storage={storage}
      llm={llm}
      componentLibrary={openuiLibrary}
      logoUrl={OPENUI_LOGO}
      theme={{ mode }}
      starters={STARTERS}
    >
      <AgentInterface.SidebarHeader agentName={<OpenUIWordmark mode={mode} />} />
      <AgentInterface.SidebarFooter>
        <AgentInterface.ThemeModeToggle mode={mode} onModeChange={setPreference} />
      </AgentInterface.SidebarFooter>
      <AgentInterface.MobileHeader
        agentName=""
        logo={
          <ModelSwitcher
            models={MODEL_OPTIONS}
            value={selectedModel}
            onValueChange={setSelectedModel}
          />
        }
      />
      <AgentInterface.ThreadHeader
        showChatTitle={false}
        start={
          <ModelSwitcher
            models={MODEL_OPTIONS}
            value={selectedModel}
            onValueChange={setSelectedModel}
          />
        }
      />
      <AgentInterface.Welcome
        image={<WelcomeMascot />}
        title="What's on your mind today?"
        starterVariant="card"
        glowAnimation
      />
    </AgentInterface>
  );
}
