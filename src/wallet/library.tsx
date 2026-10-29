"use client";

import React from "react";
import { defineComponent, createLibrary } from "@openuidev/react-lang";
import { z } from "zod";
import {
  WalletScreenView,
  BalanceHeroView,
  AssetListView,
  AssetRowView,
  ActionGroupView,
  WalletMethodListView,
  SendFlowView,
  ReceivePanelView,
  TransactionListView,
  TransactionDetailView,
  AddAssetPanelView,
  ConnectedAppsView,
  NoticeView,
} from "./renderers";

// ========================================================
// Component Definitions with Zod Schemas & React Renderers
// ========================================================

const WalletScreenProps = z.object({
  title: z.string().describe("Screen title, e.g. 'Stellar Wallet Overview'"),
  activeTab: z
    .enum(["overview", "send", "receive", "assets", "activity", "explore"])
    .describe("Active wallet tab"),
  sections: z
    .array(z.any())
    .describe("List of child wallet components (BalanceHero, AssetList, etc.)"),
});

export const WalletScreen = defineComponent({
  name: "WalletScreen",
  description:
    "Root container for the X Wallet desktop surface. Composes child sections into a cohesive wallet view.",
  props: WalletScreenProps,
  component: ({ props, renderNode }) => (
    <WalletScreenView
      title={props.title}
      activeTab={props.activeTab}
      sections={props.sections ? props.sections.map(renderNode) : undefined}
    />
  ),
});

const BalanceHeroProps = z.object({
  accountId: z.string().describe("Account identifier, e.g. 'acc-stellar-primary'"),
  balanceKey: z.string().describe("Formatted balance string, e.g. '$3,842.50'"),
  fiatCurrency: z.string().describe("Fiat currency code, e.g. 'USD'"),
  networkLabel: z.string().describe("Network display label, e.g. 'Stellar Testnet · Demo'"),
  actions: z
    .array(z.string())
    .describe("Array of visible action button keys: ['send', 'receive', 'add', 'explore']"),
});

export const BalanceHero = defineComponent({
  name: "BalanceHero",
  description:
    "Displays the main account card with total balance, Stellar testnet badge, and action buttons.",
  props: BalanceHeroProps,
  component: ({ props }) => <BalanceHeroView {...props} />,
});

const AssetListProps = z.object({
  assets: z
    .array(z.string())
    .describe("Asset codes or identifiers to display, e.g. ['XLM', 'USDC', 'AQUA']"),
  showSearch: z.boolean().optional().describe("Whether to display the asset search input"),
});

export const AssetList = defineComponent({
  name: "AssetList",
  description: "Displays the list of held and tracked Stellar assets (XLM, USDC, AQUA, etc.).",
  props: AssetListProps,
  component: ({ props }) => <AssetListView {...props} />,
});

const AssetRowProps = z.object({
  assetId: z.string().describe("Asset code or identifier, e.g. 'XLM' or 'USDC'"),
  emphasis: z.boolean().optional().describe("Whether to visually emphasize this row"),
});

export const AssetRow = defineComponent({
  name: "AssetRow",
  description: "Single asset row showing balance, fiat value, icon, and 24h change.",
  props: AssetRowProps,
  component: ({ props }) => <AssetRowView {...props} />,
});

const ActionGroupProps = z.object({
  actions: z
    .array(z.enum(["send", "receive", "add", "swap", "history"]))
    .describe("List of action shortcuts to render"),
});

export const ActionGroup = defineComponent({
  name: "ActionGroup",
  description: "Row of quick action buttons for Send, Receive, Add Asset, and Explore.",
  props: ActionGroupProps,
  component: ({ props }) => <ActionGroupView {...props} />,
});

const WalletMethodListProps = z.object({
  title: z.string().describe("Method group title, e.g. 'Choose how to send'"),
  methods: z
    .array(z.string())
    .describe("List of method identifiers: ['address', 'contact', 'bridge', 'qr']"),
});

export const WalletMethodList = defineComponent({
  name: "WalletMethodList",
  description:
    "Presents selectable payment/transfer options inspired by Telegram Wallet's choice screens.",
  props: WalletMethodListProps,
  component: ({ props }) => <WalletMethodListView {...props} />,
});

const SendFlowProps = z.object({
  step: z
    .enum(["recipient", "amount", "review", "receipt"])
    .describe("Active progression step"),
  selectedAssetId: z.string().describe("Asset code being sent, e.g. 'XLM' or 'USDC'"),
  recipientRef: z.string().optional().describe("Recipient Stellar address or contact label"),
  amount: z.string().optional().describe("Amount to send, e.g. '25'"),
});

export const SendFlow = defineComponent({
  name: "SendFlow",
  description:
    "Interactive 3-step Send flow: Recipient entry -> Amount selection -> Review & Demo confirmation.",
  props: SendFlowProps,
  component: ({ props }) => <SendFlowView {...props} />,
});

const ReceivePanelProps = z.object({
  assetId: z.string().describe("Asset to receive, e.g. 'XLM'"),
  addressKey: z.string().describe("Public Stellar testnet address"),
  showQr: z.boolean().optional().describe("Whether to show the QR code visual"),
});

export const ReceivePanel = defineComponent({
  name: "ReceivePanel",
  description:
    "Displays the public Stellar address for receiving payments, with QR code and Copy Address button.",
  props: ReceivePanelProps,
  component: ({ props }) => <ReceivePanelView {...props} />,
});

const TransactionListProps = z.object({
  filter: z.enum(["all", "sent", "received"]).describe("Active filter tab"),
  transactions: z
    .array(z.string())
    .optional()
    .describe("Optional list of specific transaction IDs to display"),
});

export const TransactionList = defineComponent({
  name: "TransactionList",
  description:
    "Activity feed showing recent Stellar payments with filter tabs (All, Sent, Received).",
  props: TransactionListProps,
  component: ({ props }) => <TransactionListView {...props} />,
});

const TransactionDetailProps = z.object({
  transactionId: z.string().describe("Transaction identifier, e.g. 'tx-1'"),
});

export const TransactionDetail = defineComponent({
  name: "TransactionDetail",
  description: "Detailed view of an individual transaction showing hash, ledger, fee, and status.",
  props: TransactionDetailProps,
  component: ({ props }) => <TransactionDetailView {...props} />,
});

const AddAssetPanelProps = z.object({
  query: z.string().optional().describe("Search query filter"),
  assets: z.array(z.string()).describe("List of available asset codes to browse"),
});

export const AddAssetPanel = defineComponent({
  name: "AddAssetPanel",
  description:
    "Curated asset catalog to search, discover, and add Stellar asset trustlines to the watchlist.",
  props: AddAssetPanelProps,
  component: ({ props }) => <AddAssetPanelView {...props} />,
});

const ConnectedAppsProps = z.object({
  apps: z.array(z.string()).describe("List of app identifiers to showcase"),
});

export const ConnectedApps = defineComponent({
  name: "ConnectedApps",
  description: "Curated directory of Stellar ecosystem apps, smart contracts, and tools.",
  props: ConnectedAppsProps,
  component: ({ props }) => <ConnectedAppsView {...props} />,
});

const NoticeProps = z.object({
  tone: z.enum(["info", "warning", "success", "danger"]).describe("Visual tone of the notice"),
  title: z.string().describe("Notice headline"),
  description: z.string().describe("Notice explanatory text"),
});

export const Notice = defineComponent({
  name: "Notice",
  description: "Contextual demo badge or disclaimer informing the user of simulated testnet mode.",
  props: NoticeProps,
  component: ({ props }) => <NoticeView {...props} />,
});

// ========================================================
// Assemble Wallet Component Library
// ========================================================

export const walletLibrary = createLibrary({
  components: [
    WalletScreen,
    BalanceHero,
    AssetList,
    AssetRow,
    ActionGroup,
    WalletMethodList,
    SendFlow,
    ReceivePanel,
    TransactionList,
    TransactionDetail,
    AddAssetPanel,
    ConnectedApps,
    Notice,
  ],
});
