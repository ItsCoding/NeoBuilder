import type { ReactNode } from "react";
import { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "NeoBuilder Web",
  description: "Public site surface for NeoBuilder",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-slate-50 text-slate-900">{children}</main>
      </body>
    </html>
  );
}
