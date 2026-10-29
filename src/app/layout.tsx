import type { Metadata } from "next";
import { appFontVariables } from "@/design-system/fonts";
import { tokensCss } from "@/design-system/tokens";
import "./globals.css";
import "./todo.css";

export const metadata: Metadata = {
  title: "Editorial Todo — Powered by OUI-1",
  description: "Magazine-grade task planner and generative todo board powered by OUI-1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={appFontVariables}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: tokensCss(":root") }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
