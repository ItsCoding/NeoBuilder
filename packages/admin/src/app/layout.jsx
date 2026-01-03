import "../styles/globals.css";
import { Toaster } from "sonner";

export const metadata = {
    title: "NeoBuilder Admin",
    description: "Admin surface for NeoBuilder CMS",
};

export default function RootLayout({ children }) {
    return (<html lang="en">
      <body>
        <main className="min-h-screen bg-white text-slate-900">
          {children}
          <Toaster position="top-right" richColors closeButton duration={3500}/>
        </main>
      </body>
    </html>);
}
