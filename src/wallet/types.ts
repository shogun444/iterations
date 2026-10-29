/**
 * Stellar Domain Model and Types for X Wallet
 * Section 10 of PRD
 */

export type WalletTab = "overview" | "send" | "receive" | "assets" | "activity" | "explore";

export interface DemoAsset {
  id: string;
  code: string;
  name: string;
  issuerLabel?: string;
  balance: string;
  numericBalance: number;
  fiatValue: string;
  numericFiat: number;
  changeLabel: string;
  isPositiveChange: boolean;
  network: "stellar-testnet";
  isDemo: true;
  iconKey: "xlm" | "usdc" | "aqua" | "eurc" | "generic";
  inWatchlist: boolean;
}

export type TransactionStatus = "simulated" | "pending" | "success" | "failed";

export interface DemoTransaction {
  id: string;
  direction: "sent" | "received";
  assetCode: string;
  amount: string;
  counterpartyLabel: string;
  counterpartyAddress: string;
  dateLabel: string;
  timestamp: string;
  status: TransactionStatus;
  feeLabel: string;
  hash: string;
  ledger: number;
  isDemo: true;
}

export interface ConnectedApp {
  id: string;
  name: string;
  category: string;
  description: string;
  badge?: string;
  externalUrlPlaceholder: string;
  iconKey: "swap" | "vault" | "dex" | "lending";
}

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  shortAddress: string;
  networkLabel: string;
  totalFiatBalance: string;
  totalXlmEquivalent: string;
  isDemo: true;
}

export interface SendState {
  step: "recipient" | "amount" | "review" | "receipt";
  recipient: string;
  recipientLabel?: string;
  assetCode: string;
  amount: string;
  estimatedFee: string;
  memo?: string;
  txHash?: string;
}

export interface WalletMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: "address" | "contact" | "bridge" | "qr";
  disabled?: boolean;
}

export interface DemoCollectible {
  id: string;
  name: string;
  collection: string;
  bgGradient: string;
  avatarType: "pixel-hacker" | "cyber-stellar" | "arcade-lumen";
}

