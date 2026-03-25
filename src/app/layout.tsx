import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Daily",
  description: "A public log of one AI-generated project per day."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
