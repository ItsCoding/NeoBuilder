import "../styles/globals.css";
import type { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NeoBuilder Admin",
  description: "Admin surface for NeoBuilder CMS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-white text-slate-900">{children}</main>
      </body>
    </html>
  );
}
