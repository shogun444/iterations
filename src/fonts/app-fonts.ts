import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const displaySerif = localFont({
  src: [
    { path: "./timeless/TimelessSerifVF.woff2", weight: "200 700", style: "normal" },
    { path: "./timeless/TimelessSerifItalicVF.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const uiSans = localFont({
  src: [{ path: "./timeless/TimelessSansVF.woff2", weight: "300 800", style: "normal" }],
  variable: "--font-ui",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
