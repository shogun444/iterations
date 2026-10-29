"use client";

import React, { useState, useRef, useEffect } from "react";
import { Renderer } from "@openuidev/react-lang";
import { walletLibrary } from "@/wallet/library";
import { WalletScreenView, StellarLogo, TransactionListView } from "@/wallet/renderers";
import { DEMO_ACCOUNT } from "@/wallet/demo-data";
import type { WalletTab } from "@/wallet/types";

// ==========================================
// SVGs & Icons
// ==========================================

function WalletIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function ChatIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ActivityIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ArrowUpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function CopyIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type MainMode = "wallet" | "assistant" | "activity";

// Suggestions matching OpenUI Trip Planner pattern
const SUGGESTIONS = [
  {
    icon: "💼",
    title: "Show wallet overview",
    prompt: "Create the default desktop Stellar wallet overview. Show the demo balance hero, Send, Receive and Add Asset actions, a compact list of assets and the latest transactions.",
  },
  {
    icon: "↗️",
    title: "Send 25 XLM",
    prompt: "Open the Send XLM flow. Start at recipient selection with a clear three-step progression: Recipient, Amount, Review. Show demo mode and do not submit anything.",
  },
  {
    icon: "📲",
    title: "Receive with QR",
    prompt: "Show a Receive XLM panel with the demo public address, QR area, Copy Address action and a short note that this is a demo address.",
  },
  {
    icon: "🧭",
    title: "Explore Stellar Apps",
    prompt: "Show curated ecosystem apps on Stellar, including Soroban AMM, StellarX and LOBSTR Vault.",
  },
];

export function AppShell() {
  const [mode, setMode] = useState<MainMode>("wallet");
  const [walletSubTab, setWalletSubTab] = useState<WalletTab>("overview");
  const [copiedAddr, setCopiedAddr] = useState(false);

  // Assistant & Chat State
  const [inputPrompt, setInputPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatTurns, setChatTurns] = useState<
    Array<{ prompt: string; code?: string; role: "user" | "assistant" }>
  >([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatTurns, isStreaming]);

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(DEMO_ACCOUNT.address);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isStreaming) return;

    setInputPrompt("");
    setMode("assistant");
    setIsStreaming(true);

    const userTurn = { role: "user" as const, prompt: text };
    const nextTurns = [...chatTurns, userTurn];
    setChatTurns(nextTurns);

    try {
      const messagesForApi = nextTurns.map((m) => ({
        role: m.role,
        content: m.role === "user" ? m.prompt : (m.code || "Generated view"),
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForApi,
          threadId: "desktop-xwallet-session",
          model: "thesysdev/OUI-1",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Generation failed: ${errText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let accumulatedCode = "";
      let sseBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n\n");
        sseBuffer = lines.pop() ?? "";

        for (const block of lines) {
          const trimmed = block.trim();
          if (!trimmed) continue;

          for (const line of trimmed.split("\n")) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (dataStr && dataStr !== "[DONE]") {
                try {
                  const parsed = JSON.parse(dataStr);
                  const msg = Array.isArray(parsed) ? parsed[0] : parsed;
                  if (msg && typeof msg.content === "string") {
                    accumulatedCode = msg.content;
                    // Update turn live
                    setChatTurns([
                      ...nextTurns,
                      { role: "assistant", prompt: "Updated view", code: accumulatedCode },
                    ]);
                  }
                } catch {
                  // chunk parsing
                }
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error("Assistant generation error:", err);
      setChatTurns([
        ...nextTurns,
        {
          role: "assistant",
          prompt: "Snag occurred",
          code: `root = Notice("danger", "Generation Notice", "${
            err instanceof Error ? err.message : String(err)
          }")`,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="ambient-page">
      {/* ========================================================
          Floating Header Nav (Trip Planner Segmented Control)
      ======================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 pointer-events-none">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <StellarLogo className="w-7 h-7 drop-shadow-sm" />
          <span className="font-black text-sm tracking-tight text-[#0B1020]">
            X WALLET
          </span>
        </div>

        {/* Center Floating Pill Tabs (.pl-tabs) */}
        <div className="pointer-events-auto">
          <div className="pl-tabs">
            <span
              className="pl-tabs__thumb"
              style={{
                transform: `translateX(${
                  mode === "wallet" ? "0%" : mode === "assistant" ? "100%" : "200%"
                })`,
              }}
            />
            <button
              type="button"
              onClick={() => setMode("wallet")}
              className={`pl-tab ${mode === "wallet" ? "is-active" : ""}`}
            >
              <WalletIcon />
              <span>Wallet</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("assistant")}
              className={`pl-tab ${mode === "assistant" ? "is-active" : ""}`}
            >
              <ChatIcon />
              <span>Assistant</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("activity")}
              className={`pl-tab ${mode === "activity" ? "is-active" : ""}`}
            >
              <ActivityIcon />
              <span>Activity</span>
            </button>
          </div>
        </div>

        {/* Right Status Badge */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-blue-600 shadow-sm transition"
            title="Copy address"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px]">{DEMO_ACCOUNT.shortAddress}</span>
            {copiedAddr ? <CheckIcon className="text-emerald-600" /> : <CopyIcon />}
          </button>
        </div>
      </header>

      {/* ========================================================
          Main Content Container
      ======================================================== */}
      <main className="w-full flex justify-center">
        {/* ----------------------------------------------------
            MODE 1: WALLET OVERVIEW (Dense, Telegram/Apple Style)
        ---------------------------------------------------- */}
        {mode === "wallet" && (
          <div className="max-w-[540px] w-full pt-20 pb-28 px-4">
            <WalletScreenView
              activeTab={walletSubTab}
              onNavigateTab={(tab) => {
                if (tab === "activity") {
                  setMode("activity");
                } else {
                  setWalletSubTab(tab);
                }
              }}
            />
          </div>
        )}

        {/* ----------------------------------------------------
            MODE 2: ASSISTANT (OpenUI Trip Planner Chat Interface)
        ---------------------------------------------------- */}
        {mode === "assistant" && (
          <div className="max-w-[760px] w-full pt-20 pb-36 px-4">
            {chatTurns.length === 0 ? (
              /* Welcome Screen (Matches Trip Planner Home / ChatWelcome) */
              <div className="text-center pt-8 pb-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Stellar Testnet · OUI-1 Local BF16</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  Ask me anything about X Wallet.
                </h1>

                <p className="text-slate-500 text-base max-w-lg mx-auto">
                  I can compose your wallet view, prepare transfers, search assets, and inspect Stellar transactions in real time.
                </p>

                {/* 4 Elevated Suggestion Cards (.pl-chip) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4">
                  {SUGGESTIONS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendPrompt(item.prompt)}
                      className="pl-chip group"
                    >
                      <span className="text-3xl block group-hover:scale-110 transition">
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Conversational Turns */
              <div className="space-y-8">
                {chatTurns.map((turn, idx) => (
                  <div key={idx} className="space-y-3">
                    {turn.role === "user" ? (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          You
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                          {turn.prompt}
                        </h2>
                      </div>
                    ) : (
                      /* Model Generated View */
                      <div className="pl-11 space-y-2">
                        {turn.code && (
                          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md">
                            <Renderer library={walletLibrary} response={turn.code} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking / Streaming Indicator */}
                {isStreaming && (
                  <div className="flex items-center gap-3 pl-11 text-xs text-blue-600 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                    <span>OUI-1 writing back...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            MODE 3: ACTIVITY (Dense Transaction History)
        ---------------------------------------------------- */}
        {mode === "activity" && (
          <div className="max-w-[540px] w-full pt-20 pb-28 px-4">
            <TransactionListView />
          </div>
        )}
      </main>

      {/* ========================================================
          Floating Bottom Prompt Input Bar (.pl-board__bar)
          Always accessible across all modes!
      ======================================================== */}
      <div className="pl-board__dock">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputPrompt);
          }}
          className="pl-board__bar"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask anything about X Wallet, e.g. 'Send 25 XLM' or 'Show overview'..."
            className="pl-home__input"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="pl-home__send"
            title="Send prompt"
          >
            <ArrowUpIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
