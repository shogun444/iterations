import type { ChatStorage, Message, Thread, UserMessage } from "@openuidev/react-headless";

const THREADS_STORAGE_KEY = "openui:local:threads";
const MESSAGES_STORAGE_PREFIX = "openui:local:messages:";

export function getStoredLocalMessages(threadId: string): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${MESSAGES_STORAGE_PREFIX}${threadId}`);
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredLocalMessages(threadId: string, messages: Message[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${MESSAGES_STORAGE_PREFIX}${threadId}`, JSON.stringify(messages));
  } catch {}
}

export function createLocalStorageChatStorage(): ChatStorage {
  return {
    thread: {
      async listThreads() {
        if (typeof window === "undefined") return { threads: [] };
        try {
          const raw = window.localStorage.getItem(THREADS_STORAGE_KEY);
          const threads: Thread[] = raw ? (JSON.parse(raw) as Thread[]) : [];
          return { threads };
        } catch {
          return { threads: [] };
        }
      },

      async createThread(firstMessage: UserMessage) {
        const id = crypto.randomUUID();
        const contentStr =
          typeof firstMessage.content === "string"
            ? firstMessage.content
            : JSON.stringify(firstMessage.content ?? "");
        const title = contentStr.slice(0, 40) || "New thread";
        const thread: Thread = {
          id,
          title,
          createdAt: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem(THREADS_STORAGE_KEY);
            const threads: Thread[] = raw ? (JSON.parse(raw) as Thread[]) : [];
            window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify([thread, ...threads]));

            const initialMsg: Message = {
              ...firstMessage,
              id: firstMessage.id ?? crypto.randomUUID(),
            };
            window.localStorage.setItem(
              `${MESSAGES_STORAGE_PREFIX}${id}`,
              JSON.stringify([initialMsg]),
            );
          } catch {}
        }

        return thread;
      },

      async getMessages(threadId: string) {
        return getStoredLocalMessages(threadId);
      },

      async updateThread(thread: Thread) {
        if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem(THREADS_STORAGE_KEY);
            const threads: Thread[] = raw ? (JSON.parse(raw) as Thread[]) : [];
            const next = threads.map((t) => (t.id === thread.id ? thread : t));
            window.localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(next));
          } catch {}
        }
        return thread;
      },

      async deleteThread(id: string) {
        if (typeof window !== "undefined") {
          try {
            const raw = window.localStorage.getItem(THREADS_STORAGE_KEY);
            const threads: Thread[] = raw ? (JSON.parse(raw) as Thread[]) : [];
            window.localStorage.setItem(
              THREADS_STORAGE_KEY,
              JSON.stringify(threads.filter((t) => t.id !== id)),
            );
            window.localStorage.removeItem(`${MESSAGES_STORAGE_PREFIX}${id}`);
          } catch {}
        }
      },
    },
  };
}

