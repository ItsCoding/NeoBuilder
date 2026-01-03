import type { ReactNode } from "react";
import { Metadata } from "next";
import { draftMode } from "next/headers";
import "./styles.css";

export const metadata: Metadata = {
  title: "NeoBuilder Web",
  description: "Public site surface for NeoBuilder",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const { isEnabled } = draftMode();
  const lang = process.env.DEFAULT_LOCALE ?? "en";
  return (
    <html lang={lang}>
      <body>
        {isEnabled && (
          <div className="bg-amber-100 px-4 py-3 text-sm text-amber-900">
            Preview mode enabled. Changes are visible only to you. <a className="underline" href="/api/exit-preview">Exit preview</a>
          </div>
        )}
        <main className="min-h-screen bg-slate-50 text-slate-900">{children}</main>
      </body>
    </html>
  );
}
