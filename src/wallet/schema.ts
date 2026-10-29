import { defineComponent, createLibrary } from "@openuidev/lang-core";
import { z } from "zod";

/**
 * Server-safe Component Schemas for X Wallet
 * Defined according to Section 9 of X_Wallet_Stellar_OpenUI_PRD.docx
 */

export const WalletScreenSchema = defineComponent({
  name: "WalletScreen",
  description:
    "Root container for the X Wallet desktop canvas. Composes child sections into a cohesive wallet view.",
  props: z.object({
    title: z.string().describe("Screen title, e.g. 'Stellar Wallet Overview'"),
    activeTab: z
      .enum(["overview", "send", "receive", "assets", "activity", "explore"])
      .describe("Active wallet tab"),
    sections: z
      .array(z.any())
      .describe("List of child wallet components (BalanceHero, AssetList, etc.)"),
  }),
  component: () => null,
});

export const BalanceHeroSchema = defineComponent({
  name: "BalanceHero",
  description:
    "Displays the main account card with total balance, Stellar testnet badge, and action buttons.",
  props: z.object({
    accountId: z.string().describe("Account identifier, e.g. 'acc-stellar-primary'"),
    balanceKey: z.string().describe("Formatted balance string, e.g. '$3,842.50'"),
    fiatCurrency: z.string().describe("Fiat currency code, e.g. 'USD'"),
    networkLabel: z.string().describe("Network display label, e.g. 'Stellar Testnet · Demo'"),
    actions: z
      .array(z.string())
      .describe("Array of visible action button keys: ['send', 'receive', 'add', 'explore']"),
  }),
  component: () => null,
});

export const AssetListSchema = defineComponent({
  name: "AssetList",
  description: "Displays the list of held and tracked Stellar assets (XLM, USDC, AQUA, etc.).",
  props: z.object({
    assets: z
      .array(z.string())
      .describe("Asset codes or identifiers to display, e.g. ['XLM', 'USDC', 'AQUA']"),
    showSearch: z.boolean().optional().describe("Whether to display the asset search input"),
  }),
  component: () => null,
});

export const AssetRowSchema = defineComponent({
  name: "AssetRow",
  description: "Single asset row showing balance, fiat value, icon, and 24h change.",
  props: z.object({
    assetId: z.string().describe("Asset code or identifier, e.g. 'XLM' or 'USDC'"),
    emphasis: z.boolean().optional().describe("Whether to visually emphasize this row"),
  }),
  component: () => null,
});

export const ActionGroupSchema = defineComponent({
  name: "ActionGroup",
  description: "Row of quick action buttons for Send, Receive, Add Asset, and Explore.",
  props: z.object({
    actions: z
      .array(z.enum(["send", "receive", "add", "swap", "history"]))
      .describe("List of action shortcuts to render"),
  }),
  component: () => null,
});

export const WalletMethodListSchema = defineComponent({
  name: "WalletMethodList",
  description:
    "Presents selectable payment/transfer options inspired by Telegram Wallet's choice screens.",
  props: z.object({
    title: z.string().describe("Method group title, e.g. 'Choose how to send'"),
    methods: z
      .array(z.string())
      .describe("List of method identifiers: ['address', 'contact', 'bridge', 'qr']"),
  }),
  component: () => null,
});

export const SendFlowSchema = defineComponent({
  name: "SendFlow",
  description:
    "Interactive 3-step Send flow: Recipient entry -> Amount selection -> Review & Demo confirmation.",
  props: z.object({
    step: z
      .enum(["recipient", "amount", "review", "receipt"])
      .describe("Active progression step"),
    selectedAssetId: z.string().describe("Asset code being sent, e.g. 'XLM' or 'USDC'"),
    recipientRef: z.string().optional().describe("Recipient Stellar address or contact label"),
    amount: z.string().optional().describe("Amount to send, e.g. '25'"),
  }),
  component: () => null,
});

export const ReceivePanelSchema = defineComponent({
  name: "ReceivePanel",
  description:
    "Displays the public Stellar address for receiving payments, with QR code and Copy Address button.",
  props: z.object({
    assetId: z.string().describe("Asset to receive, e.g. 'XLM'"),
    addressKey: z.string().describe("Public Stellar testnet address"),
    showQr: z.boolean().optional().describe("Whether to show the QR code visual"),
  }),
  component: () => null,
});

export const TransactionListSchema = defineComponent({
  name: "TransactionList",
  description:
    "Activity feed showing recent Stellar payments with filter tabs (All, Sent, Received).",
  props: z.object({
    filter: z.enum(["all", "sent", "received"]).describe("Active filter tab"),
    transactions: z
      .array(z.string())
      .optional()
      .describe("Optional list of specific transaction IDs to display"),
  }),
  component: () => null,
});

export const TransactionDetailSchema = defineComponent({
  name: "TransactionDetail",
  description: "Detailed view of an individual transaction showing hash, ledger, fee, and status.",
  props: z.object({
    transactionId: z.string().describe("Transaction identifier, e.g. 'tx-1'"),
  }),
  component: () => null,
});

export const AddAssetPanelSchema = defineComponent({
  name: "AddAssetPanel",
  description:
    "Curated asset catalog to search, discover, and add Stellar asset trustlines to the watchlist.",
  props: z.object({
    query: z.string().optional().describe("Search query filter"),
    assets: z.array(z.string()).describe("List of available asset codes to browse"),
  }),
  component: () => null,
});

export const ConnectedAppsSchema = defineComponent({
  name: "ConnectedApps",
  description: "Curated directory of Stellar ecosystem apps, smart contracts, and tools.",
  props: z.object({
    apps: z.array(z.string()).describe("List of app identifiers to showcase"),
  }),
  component: () => null,
});

export const NoticeSchema = defineComponent({
  name: "Notice",
  description: "Contextual demo badge or disclaimer informing the user of simulated testnet mode.",
  props: z.object({
    tone: z.enum(["info", "warning", "success", "danger"]).describe("Visual tone of the notice"),
    title: z.string().describe("Notice headline"),
    description: z.string().describe("Notice explanatory text"),
  }),
  component: () => null,
});

export const walletLibrarySpec = createLibrary({
  components: [
    WalletScreenSchema,
    BalanceHeroSchema,
    AssetListSchema,
    AssetRowSchema,
    ActionGroupSchema,
    WalletMethodListSchema,
    SendFlowSchema,
    ReceivePanelSchema,
    TransactionListSchema,
    TransactionDetailSchema,
    AddAssetPanelSchema,
    ConnectedAppsSchema,
    NoticeSchema,
  ],
});

export const walletPromptOptions = {
  preamble:
    "You are X Wallet, an intelligent desktop self-custodial wallet assistant for the Stellar network. " +
    "You compose polished, high-contrast desktop wallet screens using OpenUI Lang. " +
    "Every UI hierarchy starts with `root = WalletScreen(...)`.",
  additionalRules: [
    "Always set root = WalletScreen(title, activeTab, [sections]).",
    "For the wallet overview: compose BalanceHero, AssetList, TransactionList, and optionally ConnectedApps.",
    "For sending funds: compose SendFlow with the asset and destination, or WalletMethodList.",
    "For receiving funds: compose ReceivePanel with the public Stellar address.",
    "For activity/history: compose TransactionList with filter ('all', 'sent', or 'received').",
    "Use Stellar native assets: XLM, USDC, AQUA, EURC.",
    "All values are deterministic testnet fixtures; never claim real money is moving.",
  ],
};
