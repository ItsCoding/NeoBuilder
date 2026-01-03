"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
const nav = [
    {
        title: "Overview",
        items: [{ label: "Dashboard", href: "/" }],
    },
    {
        title: "Content",
        items: [
            { label: "Pages", href: "/pages" },
            { label: "Global Sections", href: "/sections" },
            { label: "Media", href: "/media" },
        ],
    },
    {
        title: "Data",
        items: [
            { label: "Databases", href: "/databases" },
            { label: "Forms", href: "/forms" },
            { label: "Comments", href: "/comments" },
        ],
    },
    {
        title: "Site",
        items: [
            { label: "Analytics", href: "/analytics" },
            { label: "Redirects", href: "/redirects" },
        ],
    },
    {
        title: "Design",
        items: [
            { label: "Themes", href: "/themes" },
            { label: "Templates", href: "/templates" },
        ],
    },
    {
        title: "Settings",
        items: [
            { label: "SEO", href: "/settings/seo" },
            { label: "Navigation", href: "/settings/navigation" },
            { label: "Domains", href: "/domains" },
            { label: "Backups", href: "/backups" },
            { label: "Storage", href: "/storage" },
        ],
    },
];
function Sidebar({ open, onClose }) {
    return (<>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden/>}
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0`}>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">NeoBuilder Admin</p>
            <p className="text-xs text-slate-500">Workspace: Acme Bistro</p>
          </div>
          <button className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 lg:hidden" onClick={onClose}>
            Close
          </button>
        </div>
        <nav className="space-y-6 px-3 pb-6">
          {nav.map((section) => (<div key={section.title} className="space-y-2">
              <p className="px-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (<Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={onClose}>
                    <span>{item.label}</span>
                  </Link>))}
              </div>
            </div>))}
        </nav>
      </aside>
    </>);
}
function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname?.split("/").filter(Boolean) ?? [];
  if (!parts.length)
    return null;
  const crumbs = parts.map((part, index) => {
    const href = "/" + parts.slice(0, index + 1).join("/");
    const label = part.replace(/[-_]/g, " ");
    return { href, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });
  return (<nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-slate-500">
    <Link href="/" className="hover:text-slate-700">
    Home
    </Link>
    {crumbs.map((crumb, idx) => (<span key={crumb.href} className="flex items-center gap-2">
      <span className="text-slate-300">/</span>
      {idx === crumbs.length - 1 ? (<span className="font-semibold text-slate-800">{crumb.label}</span>) : (<Link href={crumb.href} className="hover:text-slate-700">
        {crumb.label}
      </Link>)}
    </span>))}
  </nav>);
}
function Topbar({ onToggleSidebar }) {
    return (<header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <button className="rounded-md border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 lg:hidden" onClick={onToggleSidebar}>
          Menu
        </button>
        <span className="hidden items-center gap-3 lg:flex">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Production</span>
          <span className="text-slate-400">•</span>
          <span>Workspace switcher (placeholder)</span>
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <Link className="text-blue-600" href="/notifications">
          Notifications
        </Link>
        <div className="h-6 w-px bg-slate-200"/>
        <span className="font-semibold">Demo Admin</span>
      </div>
    </header>);
}
export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (<div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)}/>
          <main className="flex-1 p-6 lg:p-8">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </div>);
}
