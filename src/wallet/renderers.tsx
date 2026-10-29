"use client";

import React, { useState } from "react";
import {
  DEMO_ACCOUNT,
  DEMO_ACCOUNT_SECONDARY,
  DEMO_ASSETS,
  DEMO_TRANSACTIONS,
  CONNECTED_APPS,
  SEND_METHODS,
  DEMO_COLLECTIBLES,
} from "./demo-data";
import type { WalletTab } from "./types";

// ==========================================
// Icons & Graphics
// ==========================================

export function StellarLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#0B1020" />
      <path
        d="M6 12C9.31371 12 12 9.31371 12 6C12 9.31371 14.6863 12 18 12C14.6863 12 12 14.6863 12 18C12 14.6863 9.31371 12 6 12Z"
        fill="#36C5F0"
      />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

export function AssetIcon({ code, className = "w-10 h-10" }: { code: string; className?: string }) {
  switch (code.toUpperCase()) {
    case "EARN":
      return (
        <div className={`${className} rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center p-2 text-white shadow-sm flex-shrink-0`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
            <ellipse cx="12" cy="6" rx="8" ry="3" />
            <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
            <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
          </svg>
        </div>
      );
    case "XLM":
      return (
        <div className={`${className} rounded-full bg-[#0B1020] flex items-center justify-center p-2 text-white shadow-sm flex-shrink-0`}>
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path
              d="M5 12C8.866 12 12 8.866 12 5C12 8.866 15.134 12 19 12C15.134 12 12 15.134 12 19C12 15.134 8.866 12 5 12Z"
              fill="#36C5F0"
            />
          </svg>
        </div>
      );
    case "USDC":
      return (
        <div className={`${className} rounded-full bg-[#2775CA] flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0`}>
          $
        </div>
      );
    case "AQUA":
      return (
        <div className={`${className} rounded-full bg-gradient-to-tr from-[#0052FF] to-[#00D4FF] flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0`}>
          AQ
        </div>
      );
    case "EURC":
      return (
        <div className={`${className} rounded-full bg-[#003399] flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0`}>
          €
        </div>
      );
    case "MORE":
      return (
        <div className={`${className} rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-sm flex-shrink-0 gap-0.5`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
        </div>
      );
    default:
      return (
        <div className={`${className} rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
          {code.slice(0, 3)}
        </div>
      );
  }
}

export function PixelAvatar({ type, className = "w-12 h-12" }: { type: string; className?: string }) {
  if (type === "pixel-hacker") {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <rect x="4" y="2" width="8" height="2" fill="#052e16" />
        <rect x="2" y="4" width="12" height="6" fill="#065f46" />
        <rect x="4" y="6" width="3" height="2" fill="#34d399" />
        <rect x="9" y="6" width="3" height="2" fill="#34d399" />
        <rect x="6" y="10" width="4" height="2" fill="#ecfdf5" />
        <rect x="3" y="12" width="10" height="3" fill="#10b981" />
      </svg>
    );
  }
  if (type === "cyber-stellar") {
    return (
      <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <rect x="5" y="2" width="6" height="2" fill="#1e1b4b" />
        <rect x="3" y="4" width="10" height="6" fill="#4338ca" />
        <rect x="2" y="6" width="12" height="2" fill="#38bdf8" />
        <rect x="6" y="10" width="4" height="1" fill="#ffffff" />
        <rect x="4" y="12" width="8" height="3" fill="#6366f1" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <rect x="4" y="3" width="8" height="3" fill="#0284c7" />
      <rect x="3" y="6" width="10" height="5" fill="#0369a1" />
      <rect x="5" y="7" width="2" height="2" fill="#ffffff" />
      <rect x="9" y="7" width="2" height="2" fill="#ffffff" />
      <rect x="6" y="11" width="4" height="2" fill="#f0f9ff" />
    </svg>
  );
}

function ArrowUpIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function PlusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SwapIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10h14l-4-4" />
      <path d="M17 14H3l4 4" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function QrIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function SettingsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CopyIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ==========================================
// 1. BalanceHero (Apple Wallet & Telegram Stacked Cards Deck)
// ==========================================

export function BalanceHeroView({
  balanceKey,
  onActionSelect,
}: {
  accountId?: string;
  balanceKey?: string;
  fiatCurrency?: string;
  networkLabel?: string;
  actions?: string[];
  onActionSelect?: (action: WalletTab) => void;
}) {
  const [activeCard, setActiveCard] = useState<"primary" | "secondary">("secondary");
  const [copied, setCopied] = useState(false);

  const frontAccount = activeCard === "secondary" ? DEMO_ACCOUNT_SECONDARY : DEMO_ACCOUNT;
  const backAccount = activeCard === "secondary" ? DEMO_ACCOUNT : DEMO_ACCOUNT_SECONDARY;

  const currentBalance = balanceKey || frontAccount.totalFiatBalance;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(frontAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      {/* Stacked Card Deck */}
      <div className="wallet-deck-container pt-3">
        {/* Back Card (peeking up) */}
        <div
          onClick={() => setActiveCard(activeCard === "secondary" ? "primary" : "secondary")}
          className="wallet-card-back"
          title="Click to switch card"
        >
          <div className="flex items-center gap-2">
            <StellarLogo className="w-5 h-5" />
            <span className="font-bold text-xs tracking-tight">{backAccount.name}</span>
          </div>
          <span className="font-extrabold text-sm tabular-nums tracking-tight">
            {backAccount.totalFiatBalance}
          </span>
        </div>

        {/* Front Active Card */}
        <div
          className={`wallet-card-front ${
            activeCard === "primary"
              ? "!bg-gradient-to-br !from-[#0D59C2] !via-[#1677FF] !to-[#36C5F0]"
              : "!bg-gradient-to-br !from-[#242A38] !to-[#181D27]"
          }`}
        >
          {/* Subtle Stellar Orbit Watermark */}
          <div className="absolute right-0 top-0 w-64 h-64 -mr-16 -mt-16 rounded-full bg-white/[0.04] pointer-events-none blur-2xl" />
          <div className="absolute left-8 bottom-4 w-40 h-40 rounded-full bg-cyan-400/[0.05] pointer-events-none blur-xl" />

          {/* Header Row */}
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-md">
                <StellarLogo className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                {frontAccount.name}
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20">
              {frontAccount.shortAddress}
            </span>
          </div>

          {/* Balance Amount */}
          <div className="text-center my-6 relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white tabular-nums drop-shadow-sm">
              {currentBalance}
            </h1>
            <p className="text-xs font-semibold text-white/70 mt-1 tabular-nums">
              ≈ {frontAccount.totalXlmEquivalent}
            </p>
          </div>

          {/* 3 Circular Actions (Send, Deposit, Swap) */}
          <div className="flex items-center justify-center gap-8 pt-2 relative z-10">
            <button
              onClick={() => onActionSelect?.("send")}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white text-[#181D27] flex items-center justify-center shadow-md group-hover:scale-105 group-active:scale-95 transition">
                <ArrowUpIcon className="w-5 h-5 text-[#181D27]" />
              </div>
              <span className="text-xs font-semibold text-white/90 group-hover:text-white transition">
                Send
              </span>
            </button>

            <button
              onClick={() => onActionSelect?.("receive")}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white text-[#181D27] flex items-center justify-center shadow-md group-hover:scale-105 group-active:scale-95 transition">
                <PlusIcon className="w-5 h-5 text-[#181D27]" />
              </div>
              <span className="text-xs font-semibold text-white/90 group-hover:text-white transition">
                Deposit
              </span>
            </button>

            <button
              onClick={() => onActionSelect?.("explore")}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white text-[#181D27] flex items-center justify-center shadow-md group-hover:scale-105 group-active:scale-95 transition">
                <SwapIcon className="w-5 h-5 text-[#181D27]" />
              </div>
              <span className="text-xs font-semibold text-white/90 group-hover:text-white transition">
                Swap
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Address Bar Affordance with Settings & QR */}
      <div className="flex items-center justify-between px-2 py-1 mb-4">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-xl font-black text-slate-900 hover:text-blue-600 transition"
          title="Click to copy public address"
        >
          <span>{frontAccount.shortAddress}</span>
          <span className="text-slate-400 text-xs">
            {copied ? <CheckIcon className="text-emerald-600" /> : <CopyIcon className="w-3.5 h-3.5" />}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onActionSelect?.("receive")}
            className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 transition"
            title="Scan or display QR Code"
          >
            <QrIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onActionSelect?.("explore")}
            className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 transition"
            title="Settings and Network info"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. AssetList & AssetRow (Dense Inset Grouped Table)
// ==========================================

export function AssetRowView({
  assetId,
  onSelect,
}: {
  assetId: string;
  emphasis?: boolean;
  onSelect?: () => void;
}) {
  const asset = DEMO_ASSETS.find((a) => a.code.toLowerCase() === assetId.toLowerCase() || a.id === assetId) || DEMO_ASSETS[0];

  return (
    <div onClick={onSelect} className="wallet-row group">
      <div className="flex items-center gap-3 min-w-0">
        <AssetIcon code={asset.code} className="w-10 h-10" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-sm tracking-tight">{asset.code}</span>
            <span className="text-xs text-slate-400 font-medium truncate">{asset.name}</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">{asset.balance}</p>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-bold text-slate-900 text-sm tabular-nums tracking-tight">{asset.fiatValue}</p>
        <p className={`text-[11px] font-semibold tabular-nums ${asset.isPositiveChange ? "text-emerald-600" : "text-rose-600"}`}>
          {asset.changeLabel}
        </p>
      </div>
    </div>
  );
}

export function AssetListView({
  showSearch = true,
  onAssetClick,
  onEarnClick,
}: {
  assets?: string[];
  showSearch?: boolean;
  onAssetClick?: (code: string) => void;
  onEarnClick?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const q = searchQuery.toLowerCase().trim();

  // Search filter
  const isSearching = q.length > 0;
  const filteredAssets = DEMO_ASSETS.filter((a) => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
  const filteredApps = CONNECTED_APPS.filter((a) => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));

  return (
    <div className="space-y-4">
      {/* Top Search Bar */}
      {showSearch && (
        <div className="relative w-full">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, apps..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* If Searching, show Grouped Search Results */}
      {isSearching ? (
        <div className="space-y-4">
          {filteredAssets.length > 0 && (
            <div>
              <div className="wallet-group-header">ASSETS</div>
              <div className="wallet-inset-group">
                {filteredAssets.map((asset) => (
                  <AssetRowView
                    key={asset.id}
                    assetId={asset.code}
                    onSelect={() => onAssetClick?.(asset.code)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredApps.length > 0 && (
            <div>
              <div className="wallet-group-header">CONNECTED APPS</div>
              <div className="wallet-inset-group">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => onAssetClick?.("explore")}
                    className="wallet-row group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                        {app.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{app.name}</h4>
                        <p className="text-[11px] text-slate-400">{app.category}</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="text-slate-400 group-hover:text-blue-600 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Standard View: Inset Group with Wallet Earn + All Assets */
        <div>
          <div className="wallet-group-header">ASSETS</div>
          <div className="wallet-inset-group">
            {/* Wallet Earn Row */}
            <div onClick={onEarnClick} className="wallet-row group">
              <div className="flex items-center gap-3 min-w-0">
                <AssetIcon code="EARN" className="w-10 h-10" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm tracking-tight">Wallet Earn</span>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full">
                      Up to 6.2% APY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Automated USDC yield</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-2">
                <div>
                  <p className="font-bold text-slate-900 text-sm tabular-nums tracking-tight">$142.50</p>
                  <p className="text-[11px] font-semibold text-emerald-600 tabular-nums">Active</p>
                </div>
                <ChevronRightIcon className="text-slate-400 group-hover:text-blue-600 transition" />
              </div>
            </div>

            {/* Crypto Assets Rows */}
            {DEMO_ASSETS.map((asset) => (
              <AssetRowView
                key={asset.id}
                assetId={asset.code}
                onSelect={() => onAssetClick?.(asset.code)}
              />
            ))}

            {/* More Assets Row */}
            <div onClick={() => onAssetClick?.("assets")} className="wallet-row group">
              <div className="flex items-center gap-3 min-w-0">
                <AssetIcon code="MORE" className="w-10 h-10" />
                <div>
                  <span className="font-bold text-slate-900 text-sm tracking-tight">More Assets</span>
                  <p className="text-[11px] text-slate-400">Discover Stellar trustlines</p>
                </div>
              </div>
              <ChevronRightIcon className="text-slate-400 group-hover:text-blue-600 transition" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. Collectibles / Pixel Avatars Section
// ==========================================

export function CollectiblesSectionView({ onSelect }: { onSelect?: () => void }) {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="wallet-group-header !mb-0 !pl-0">COLLECTIBLES</span>
        <button
          onClick={onSelect}
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
        >
          <span>More</span>
          <ChevronRightIcon className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {DEMO_COLLECTIBLES.map((c) => (
          <div
            key={c.id}
            onClick={onSelect}
            className="rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer transition hover:scale-[1.02] border border-black/[0.04]"
            style={{ background: c.bgGradient }}
          >
            <div className="w-14 h-14 flex items-center justify-center drop-shadow-md">
              <PixelAvatar type={c.avatarType} className="w-12 h-12" />
            </div>
            <p className="text-[11px] font-bold text-white mt-1.5 truncate max-w-full">{c.name}</p>
            <span className="text-[9px] text-white/70 font-medium">{c.collection}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. Floating Earn Banner (Persistent bottom pill)
// ==========================================

export function FloatingEarnBanner({ onClick }: { onClick?: () => void }) {
  return (
    <div onClick={onClick} className="wallet-earn-pill">
      <div className="flex items-center gap-2.5">
        <span className="text-base">💎</span>
        <div>
          <p className="text-xs font-bold tracking-tight text-white leading-snug">
            Start earning up to 6.2% APY with Stellar USDC Yield
          </p>
          <p className="text-[10px] text-white/80">No lockup · Testnet simulated rewards</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-extrabold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition">
        <span>Start</span>
        <ChevronRightIcon className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

// ==========================================
// 5. Earn Campaign Modal / Details (Screenshot 2)
// ==========================================

export function EarnCampaignModal({ onClose }: { onClose: () => void }) {
  const [deposited, setDeposited] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Top Hero Banner */}
        <div className="relative p-6 bg-gradient-to-br from-[#4338CA] via-[#6366F1] to-[#8B5CF6] text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full"
          >
            ✕ Close
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
            <span>💎</span>
            <span>Earn USDC Yield</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Earn up to 6.2% APY with X Wallet
          </h2>
          <p className="text-xs text-purple-100 mt-1">
            Automated compounding on Stellar Testnet
          </p>
        </div>

        {/* Campaign Points */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              💰
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Daily automated distributions</h4>
              <p className="text-slate-500 text-[11px]">Accrues continuously based on Stellar liquidity pools.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              ⏱
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Deposit & withdraw anytime</h4>
              <p className="text-slate-500 text-[11px]">Zero penalty or lockup requirements on your trustline.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              🔒
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Non-custodial smart contracts</h4>
              <p className="text-slate-500 text-[11px]">Audited Soroban contracts with native multi-signature support.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
            <strong>Demo Notice:</strong> Yield is simulated for testing purposes. APY stands for Annual Percentage Yield.
          </div>

          <button
            onClick={() => {
              setDeposited(true);
              setTimeout(() => onClose(), 1500);
            }}
            className="w-full py-3 rounded-xl bg-[#1677FF] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-[0.98]"
          >
            {deposited ? "Deposit Simulated Successfully! ✓" : "Start Earning (Demo)"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. WalletMethodList (Screenshot 1: Choose how to send crypto)
// ==========================================

export function WalletMethodListView({
  title = "Choose how to send crypto",
  onSelectMethod,
}: {
  title?: string;
  methods?: string[];
  onSelectMethod?: (methodId: string) => void;
}) {
  return (
    <div className="space-y-4 max-w-lg mx-auto w-full">
      <h2 className="text-xl font-extrabold text-slate-900 text-center">{title}</h2>
      <div className="wallet-inset-group">
        {SEND_METHODS.map((method) => {
          let iconBg = "bg-blue-100 text-blue-600";
          if (method.id.includes("bank")) iconBg = "bg-cyan-500 text-white";
          if (method.id.includes("contact")) iconBg = "bg-amber-500 text-white";
          if (method.id.includes("address")) iconBg = "bg-slate-700 text-white";
          if (method.id.includes("soroban")) iconBg = "bg-[#0B1020] text-[#36C5F0]";

          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod?.(method.id)}
              className="wallet-row group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-sm ${iconBg}`}>
                  {method.id.includes("bank") && <span className="text-base">💳</span>}
                  {method.id.includes("contact") && <span className="text-base">👤</span>}
                  {method.id.includes("address") && <span className="text-base">💼</span>}
                  {method.id.includes("soroban") && <StellarLogo className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">{method.title}</h3>
                  <p className="text-xs text-slate-500">{method.subtitle}</p>
                </div>
              </div>
              <ChevronRightIcon className="text-slate-400 group-hover:text-blue-600 transition" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 7. SendFlow (3 Steps + Simulated Receipt)
// ==========================================

export function SendFlowView({
  selectedAssetId = "XLM",
  onComplete,
}: {
  step?: "recipient" | "amount" | "review" | "receipt";
  selectedAssetId?: string;
  recipientRef?: string;
  amount?: string;
  onComplete?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState<"method" | "recipient" | "amount" | "review" | "receipt">("method");
  const [recipient, setRecipient] = useState("");
  const [amountVal, setAmountVal] = useState("");
  const [chosenAsset, setChosenAsset] = useState(selectedAssetId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const asset = DEMO_ASSETS.find((a) => a.code.toLowerCase() === chosenAsset.toLowerCase()) || DEMO_ASSETS[0];

  const handleQuickPercent = (pct: number) => {
    const total = asset.numericBalance;
    setAmountVal(((total * pct) / 100).toFixed(2));
  };

  const handleSimulatedSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep("receipt");
    }, 800);
  };

  return (
    <div className="max-w-lg mx-auto w-full space-y-4">
      {/* Step 0: Method Selection */}
      {currentStep === "method" && (
        <WalletMethodListView
          onSelectMethod={(methodId) => {
            if (methodId.includes("contact")) {
              setRecipient("alex*stellar.org");
            } else if (methodId.includes("soroban")) {
              setRecipient("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC");
            } else {
              setRecipient("GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");
            }
            setCurrentStep("amount");
          }}
        />
      )}

      {/* Step 1 & 2: Recipient & Amount Form */}
      {currentStep === "amount" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">Send {asset.code}</h3>
            <button
              onClick={() => setCurrentStep("method")}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Change Method
            </button>
          </div>

          {/* Recipient Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recipient Stellar Address or Contact
              </label>
              <select
                value={chosenAsset}
                onChange={(e) => setChosenAsset(e.target.value)}
                className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-slate-800"
              >
                {DEMO_ASSETS.map((a) => (
                  <option key={a.id} value={a.code}>{a.code}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. G... or username*stellar.org"
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Amount ({asset.code})
              </label>
              <span className="text-xs text-slate-500">
                Available: <strong className="text-slate-800">{asset.balance}</strong>
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                value={amountVal}
                onChange={(e) => setAmountVal(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 text-2xl font-bold text-slate-900 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                {asset.code}
              </span>
            </div>

            {/* Percentage Chips */}
            <div className="flex items-center gap-2 mt-2.5">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleQuickPercent(p)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold transition"
                >
                  {p === 100 ? "MAX" : `${p}%`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentStep("review")}
            disabled={!recipient || !amountVal || parseFloat(amountVal) <= 0}
            className="w-full py-3 rounded-xl bg-[#1677FF] hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-sm shadow-md transition"
          >
            Review Transfer
          </button>
        </div>
      )}

      {/* Step 3: Review Summary */}
      {currentStep === "review" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-5">
          <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Review Transaction Details
          </h3>

          <div className="text-center py-4 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sending</span>
            <h2 className="text-3xl font-black text-slate-900 tabular-nums">
              {amountVal} {asset.code}
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex justify-between py-2.5">
              <span className="text-slate-500">Recipient</span>
              <span className="font-mono font-bold text-slate-800 truncate max-w-[200px]">{recipient}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-500">Network Fee</span>
              <span className="font-bold text-slate-800">0.00001 XLM (Estimated Demo)</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-500">Execution Mode</span>
              <span className="font-bold text-blue-600">Stellar Testnet Simulated</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep("amount")}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Back
            </button>
            <button
              onClick={handleSimulatedSubmit}
              disabled={isSubmitting}
              className="flex-[2] py-3 rounded-xl bg-[#1677FF] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              {isSubmitting ? "Simulating..." : "Confirm Simulated Send"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Simulated Receipt */}
      {currentStep === "receipt" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h3 className="text-lg font-black text-slate-900">Simulated Transfer Successful</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Sent <strong>{amountVal} {asset.code}</strong> to <strong>{recipient.slice(0, 10)}...</strong> on Stellar Testnet Demo.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl text-left font-mono text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-emerald-600 font-bold">Simulated Success</span>
            </div>
            <div className="flex justify-between">
              <span>Ledger:</span>
              <span>48921854</span>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-3 rounded-xl bg-[#1677FF] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            Back to Wallet Overview
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. ReceivePanelView
// ==========================================

export function ReceivePanelView({
  addressKey = DEMO_ACCOUNT.address,
}: {
  assetId?: string;
  addressKey?: string;
  showQr?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(addressKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 text-center space-y-5">
      <h3 className="font-black text-lg text-slate-900">Receive Assets on Stellar</h3>
      <p className="text-xs text-slate-500">
        Share your public address to receive XLM, USDC, and verified Stellar tokens.
      </p>

      {/* Stylized QR Code */}
      <div className="w-52 h-52 mx-auto bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 shadow-inner relative group">
        <div className="grid grid-cols-6 gap-2 w-36 h-36">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-sm ${
                i % 2 === 0 || i % 5 === 0 || i === 0 || i === 5 || i === 30 || i === 35
                  ? "bg-slate-900"
                  : "bg-transparent"
              }`}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center p-1.5 border border-slate-100">
            <StellarLogo className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Address String */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Public Stellar Address
        </span>
        <p className="font-mono text-xs text-slate-800 break-all select-all font-semibold">
          {addressKey}
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-3 rounded-xl bg-[#1677FF] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <CheckIcon className="w-4 h-4" />
            <span>Address Copied to Clipboard!</span>
          </>
        ) : (
          <>
            <CopyIcon className="w-4 h-4" />
            <span>Copy Stellar Address</span>
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-400 font-medium">
        Demo Notice: Stellar Testnet only. Do not send mainnet funds.
      </p>
    </div>
  );
}

// ==========================================
// 9. TransactionListView & TransactionDetailView
// ==========================================

export function TransactionListView({
  filter: initialFilter = "all",
  onSelectTx,
}: {
  filter?: "all" | "sent" | "received";
  transactions?: string[];
  onSelectTx?: (txId: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "sent" | "received">(initialFilter);

  const filtered = DEMO_TRANSACTIONS.filter((tx) => {
    if (filter === "sent") return tx.direction === "sent";
    if (filter === "received") return tx.direction === "received";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter Pills */}
      <div className="flex items-center justify-between px-2">
        <span className="wallet-group-header !mb-0 !pl-0">RECENT TRANSACTIONS</span>
        <div className="flex bg-slate-100 p-1 rounded-full text-xs">
          {(["all", "sent", "received"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full font-bold transition capitalize ${
                filter === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Inset Group */}
      <div className="wallet-inset-group">
        {filtered.map((tx) => {
          const isSent = tx.direction === "sent";
          return (
            <div
              key={tx.id}
              onClick={() => onSelectTx?.(tx.id)}
              className="wallet-row group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-sm ${
                    isSent ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {isSent ? "↑" : "↓"}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{tx.counterpartyLabel}</h4>
                  <p className="text-[11px] text-slate-400">{tx.dateLabel}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className={`font-bold text-xs tabular-nums ${
                    isSent ? "text-slate-900" : "text-emerald-600"
                  }`}
                >
                  {tx.amount}
                </p>
                <span className="text-[10px] text-slate-400 font-medium capitalize">
                  {tx.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TransactionDetailView({
  transactionId,
}: {
  transactionId: string;
}) {
  const tx = DEMO_TRANSACTIONS.find((t) => t.id === transactionId) || DEMO_TRANSACTIONS[0];
  const isSent = tx.direction === "sent";

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 max-w-md mx-auto space-y-4">
      <div className="text-center py-4 bg-slate-50 rounded-2xl">
        <div
          className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl ${
            isSent ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {isSent ? "↑" : "↓"}
        </div>
        <h2 className="text-2xl font-black text-slate-900 tabular-nums">{tx.amount}</h2>
        <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
          {tx.status}
        </span>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        <div className="flex justify-between py-2">
          <span className="text-slate-500">Counterparty</span>
          <span className="font-bold text-slate-800">{tx.counterpartyLabel}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">Address</span>
          <span className="font-mono text-slate-700">{tx.counterpartyAddress}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">Timestamp</span>
          <span className="text-slate-800">{tx.dateLabel}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">Transaction Hash</span>
          <span className="font-mono text-blue-600">{tx.hash}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. ConnectedAppsView & AddAssetPanelView
// ==========================================

export function ConnectedAppsView({
  apps,
}: {
  apps?: string[];
} = {}) {
  const displayApps =
    apps && apps.length > 0
      ? CONNECTED_APPS.filter((a) =>
          apps.some(
            (appId) =>
              a.id.toLowerCase().includes(appId.toLowerCase()) ||
              a.name.toLowerCase().includes(appId.toLowerCase())
          )
        )
      : CONNECTED_APPS;

  return (
    <div className="space-y-4">
      <span className="wallet-group-header !mb-0 !pl-2">STELLAR ECOSYSTEM APPS</span>
      <div className="wallet-inset-group">
        {displayApps.map((app) => (
          <div key={app.id} className="wallet-row group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {app.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-slate-900">{app.name}</h4>
                  {app.badge && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded-full">
                      {app.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{app.description}</p>
              </div>
            </div>
            <ChevronRightIcon className="text-slate-400 group-hover:text-blue-600 transition" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddAssetPanelView({
  assets,
  query,
}: {
  assets?: string[];
  query?: string;
} = {}) {
  const displayAssets =
    assets && assets.length > 0
      ? DEMO_ASSETS.filter((a) =>
          assets.some((code) => a.code.toLowerCase() === code.toLowerCase())
        )
      : DEMO_ASSETS;

  const filtered = query
    ? displayAssets.filter(
        (a) =>
          a.code.toLowerCase().includes(query.toLowerCase()) ||
          a.name.toLowerCase().includes(query.toLowerCase())
      )
    : displayAssets;

  return (
    <div className="space-y-4">
      <span className="wallet-group-header !mb-0 !pl-2">DISCOVER STELLAR TRUSTLINES</span>
      <div className="wallet-inset-group">
        {filtered.map((asset) => (
          <div key={asset.id} className="wallet-row group">
            <div className="flex items-center gap-3">
              <AssetIcon code={asset.code} className="w-10 h-10" />
              <div>
                <h4 className="font-bold text-xs text-slate-900">{asset.code}</h4>
                <p className="text-[11px] text-slate-400">{asset.issuerLabel}</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full font-bold text-xs transition">
              + Trustline
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


// ==========================================
// 11. NoticeView & ActionGroupView
// ==========================================

export function NoticeView({
  tone = "info",
  title,
  description,
}: {
  tone?: "info" | "warning" | "success" | "danger";
  title: string;
  description: string;
}) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    danger: "bg-rose-50 border-rose-200 text-rose-900",
  }[tone];

  return (
    <div className={`p-4 rounded-2xl border text-xs ${styles} shadow-sm space-y-1`}>
      <h4 className="font-bold">{title}</h4>
      <p className="opacity-90 leading-relaxed">{description}</p>
    </div>
  );
}

export function ActionGroupView({
  onAction,
}: {
  actions?: string[];
  onAction?: (action: WalletTab) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <button
        onClick={() => onAction?.("send")}
        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-sm transition"
      >
        <span className="text-lg block mb-1">↑</span>
        <span className="text-xs font-bold text-slate-800">Send</span>
      </button>
      <button
        onClick={() => onAction?.("receive")}
        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-sm transition"
      >
        <span className="text-lg block mb-1">↓</span>
        <span className="text-xs font-bold text-slate-800">Receive</span>
      </button>
      <button
        onClick={() => onAction?.("assets")}
        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-sm transition"
      >
        <span className="text-lg block mb-1">+</span>
        <span className="text-xs font-bold text-slate-800">Add Asset</span>
      </button>
      <button
        onClick={() => onAction?.("explore")}
        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-sm transition"
      >
        <span className="text-lg block mb-1">🧭</span>
        <span className="text-xs font-bold text-slate-800">Explore</span>
      </button>
    </div>
  );
}

// ==========================================
// 12. WalletScreenView (Root Desktop View)
// ==========================================

export function WalletScreenView({
  title = "Stellar Wallet Overview",
  activeTab = "overview",
  sections,
  onNavigateTab,
}: {
  title?: string;
  activeTab?: WalletTab;
  sections?: React.ReactNode[];
  onNavigateTab?: (tab: WalletTab) => void;
}) {
  const [showEarnModal, setShowEarnModal] = useState(false);

  return (
    <div className="w-full space-y-6">
      {title && title !== "Stellar Wallet Overview" && (
        <h2 className="text-xl font-black text-slate-900 pb-1">{title}</h2>
      )}
      {/* If child sections were composed dynamically by OpenUI Lang, render them directly */}
      {sections && sections.length > 0 ? (
        <div className="space-y-6">{sections}</div>
      ) : (
        /* Native High-Density View */
        <div className="space-y-5">
          {activeTab === "overview" && (
            <>
              {/* Stacked Cards Hero with Quick Actions */}
              <BalanceHeroView onActionSelect={onNavigateTab} />

              {/* Dense Inset Grouped Table (Assets + Earn) */}
              <AssetListView
                onAssetClick={() => onNavigateTab?.("send")}
                onEarnClick={() => setShowEarnModal(true)}
              />

              {/* Collectibles Row */}
              <CollectiblesSectionView onSelect={() => onNavigateTab?.("explore")} />

              {/* Floating Persistent Earn Banner */}
              <FloatingEarnBanner onClick={() => setShowEarnModal(true)} />
            </>
          )}

          {activeTab === "send" && (
            <SendFlowView onComplete={() => onNavigateTab?.("overview")} />
          )}

          {activeTab === "receive" && <ReceivePanelView />}

          {activeTab === "assets" && <AddAssetPanelView />}

          {activeTab === "activity" && <TransactionListView />}

          {activeTab === "explore" && <ConnectedAppsView />}
        </div>
      )}

      {/* Earn Campaign Modal */}
      {showEarnModal && <EarnCampaignModal onClose={() => setShowEarnModal(false)} />}
    </div>
  );
}
