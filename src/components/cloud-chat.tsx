"use client";

import { useEffect } from "react";
import { OpenUIWordmark } from "@/components/openui-wordmark";
import { usePersistedModel } from "@/hooks/use-persisted-model";
import { LocalStorageMessageSync, useLocalThreadStorage } from "@/hooks/use-local-storage";
import { MODEL_OPTIONS } from "@/lib/models";
import { OPENUI_LOGO, STARTERS } from "@/lib/starters";
import { todoLibrary } from "@/lib/todo-library";
import {
  AgentInterface,
  fetchLLM,
  ModelSwitcher,
  useThemeModePreference,
  vercelAIAdapter,
  vercelAIMessageFormat,
  WelcomeMascot,
} from "@openuidev/react-ui";

export default function CloudChat() {
  const { setPreference, mode } = useThemeModePreference();
  const [selectedModel, setSelectedModel] = usePersistedModel();

  // Default to light mode for the magazine editorial aesthetic if unset
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("openui-theme-mode")) {
      setPreference("light");
    }
  }, [setPreference]);

  const llm = fetchLLM({
    url: "/api/chat",
    streamAdapter: vercelAIAdapter(),
    messageFormat: vercelAIMessageFormat,
    body: { model: selectedModel },
  });

  // Pure local thread storage that preserves all threads and messages in localStorage without cloud 401s
  const storage = useLocalThreadStorage();

  return (
    <AgentInterface
      storage={storage}
      llm={llm}
      componentLibrary={todoLibrary}
      logoUrl={OPENUI_LOGO}
      theme={{ mode }}
      starters={STARTERS}
    >
      <LocalStorageMessageSync />
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
        title="What's your focus for today?"
        starterVariant="card"
        glowAnimation
      />
    </AgentInterface>
  );
}
