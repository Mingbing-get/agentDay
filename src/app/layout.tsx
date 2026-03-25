import type { Metadata } from "next";

import { buildSiteMetadata } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = buildSiteMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
