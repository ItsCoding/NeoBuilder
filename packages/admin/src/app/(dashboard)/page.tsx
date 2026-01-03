const metrics = [
  { label: "Pages", value: "18", detail: "5 drafts / 12 published / 1 scheduled" },
  { label: "Storage used", value: "1.2 GB", detail: "of 5 GB quota" },
  { label: "Visitors (7d)", value: "4.3k", detail: "+8% vs prior" },
  { label: "Pending comments", value: "6", detail: "Moderation queue" },
];

const activity = [
  "Homepage published by Demo Admin",
  "Menu page scheduled for tomorrow 9:00 AM",
  "Media asset banner.jpg uploaded",
  "Redirect /old-menu → /menu created",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-2xl font-semibold text-slate-900">Site overview</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <a
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            href="/pages/new"
          >
            Create page
          </a>
          <a
            className="rounded-md border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            href="/media"
          >
            Upload media
          </a>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
            <p className="text-xs text-slate-500">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Recent activity</h2>
            <a className="text-sm text-blue-600" href="/activity">
              View all
            </a>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {activity.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Site health</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>✔️ Domain connected</p>
            <p>✔️ Sitemap generated</p>
            <p>⚠️ 1 scheduled page pending content review</p>
          </div>
        </div>
      </section>
    </div>
  );
}
