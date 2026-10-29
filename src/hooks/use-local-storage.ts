"use client";

import { useEffect, useMemo } from "react";
import { useThread, useThreadList } from "@openuidev/react-ui";

export const KEY_THREADS = "openui:local:threads:v1";
export const KEY_MSGS = "openui:local:messages:v1:";

export function getStoredThreads(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const item = localStorage.getItem(KEY_THREADS);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function setStoredThreads(threads: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_THREADS, JSON.stringify(threads));
  } catch {}
}

export function getStoredMessages(threadId: string): any[] {
  if (typeof window === "undefined") return [];
  try {
    const item = localStorage.getItem(KEY_MSGS + threadId);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

export function setStoredMessages(threadId: string, messages: any[]) {
  if (typeof window === "undefined" || !threadId) return;
  try {
    localStorage.setItem(KEY_MSGS + threadId, JSON.stringify(messages));
  } catch {}
}

/**
 * Robust local storage adapter for AgentInterface.
 * Eliminates Thesys Cloud 401 errors and keeps all chat history saved locally in the browser.
 */
export function useLocalThreadStorage() {
  return useMemo(() => {
    return {
      thread: {
        async listThreads() {
          return { threads: getStoredThreads() };
        },
        async createThread(firstMessage: any) {
          const id = crypto.randomUUID();
          let title = "New Todo Plan";
          if (typeof firstMessage?.content === "string" && firstMessage.content.trim()) {
            title = firstMessage.content.slice(0, 36);
          } else if (Array.isArray(firstMessage?.content)) {
            const txt = firstMessage.content.find((p: any) => p.type === "text");
            if (txt?.text) title = txt.text.slice(0, 36);
          }
          const thread = { id, title, createdAt: new Date().toISOString() };
          const threads = [thread, ...getStoredThreads()];
          setStoredThreads(threads);
          setStoredMessages(id, [{ ...firstMessage, id: firstMessage?.id || crypto.randomUUID() }]);
          return thread;
        },
        async getMessages(threadId: string) {
          return getStoredMessages(threadId);
        },
        async updateThread(thread: any) {
          const threads = getStoredThreads().map((t: any) => (t.id === thread.id ? { ...t, ...thread } : t));
          setStoredThreads(threads);
          return thread;
        },
        async deleteThread(id: string) {
          const threads = getStoredThreads().filter((t: any) => t.id !== id);
          setStoredThreads(threads);
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem(KEY_MSGS + id);
            } catch {}
          }
        },
      },
    };
  }, []);
}

/**
 * Keeps current thread messages automatically synced to localStorage as they stream in.
 */
export function LocalStorageMessageSync() {
  const messages = useThread((s) => s.messages);
  const selectedThreadId = useThreadList((s) => s.selectedThreadId);

  useEffect(() => {
    if (selectedThreadId && messages && messages.length > 0) {
      setStoredMessages(selectedThreadId, messages);
    }
  }, [selectedThreadId, messages]);

  return null;
}
