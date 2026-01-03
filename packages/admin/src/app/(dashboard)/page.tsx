import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Environment</p>
          <p className="text-lg font-semibold text-slate-900">Admin (protected)</p>
        </div>
        <div className="flex gap-3 text-sm text-blue-600">
          <Link href="/api/auth/signout">Sign out</Link>
          <Link href="/api/auth/signin">Switch workspace</Link>
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Pages</p>
          <p className="text-sm text-slate-600">Coming soon: publishing workflow</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Media</p>
          <p className="text-sm text-slate-600">MinIO-backed media library</p>
        </div>
      </section>
    </div>
  );
}
