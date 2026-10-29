/**
 * Entry point for `openui generate src/lib/library.ts --spec --out src/generated/spec.json`
 * Exports the server-safe X Wallet component library and prompt options.
 */
export { walletLibrarySpec as library, walletPromptOptions as promptOptions } from "../wallet/schema";
