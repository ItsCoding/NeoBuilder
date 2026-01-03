const data = [
  {
    title: "Homepage",
    slug: "/",
    status: "published",
    author: "Demo Admin",
    updated: "Today, 10:12",
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
    version: 12,
    deletedAt: null,
  },
  {
    title: "Menu",
    slug: "/menu",
    status: "scheduled",
    author: "Demo Admin",
    updated: "Today, 09:00",
    scheduledPublishAt: "Tomorrow 09:00",
    scheduledUnpublishAt: null,
    version: 7,
    deletedAt: null,
  },
  {
    title: "Catering",
    slug: "/catering",
    status: "draft",
    author: "Alex Editor",
    updated: "Yesterday",
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
    version: 3,
    deletedAt: null,
  },
  {
    title: "Seasonal Promo",
    slug: "/promo",
    status: "published",
    author: "Demo Admin",
    updated: "Last week",
    scheduledPublishAt: "2025-12-20",
    scheduledUnpublishAt: "2026-01-10",
    version: 2,
    deletedAt: null,
  },
];

const versions = [
  { version: 12, author: "Demo Admin", timestamp: "Today 10:12", label: "Published" },
  { version: 11, author: "Alex Editor", timestamp: "Yesterday 17:04", label: "Draft" },
  { version: 10, author: "Demo Admin", timestamp: "Yesterday 09:31", label: "Rollback" },
];

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-amber-100 text-amber-800",
};

export default function PagesListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pages</h1>
          <p className="text-sm text-slate-600">Manage drafts, scheduled content, and published pages.</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Bulk actions
          </button>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Template gallery
          </button>
          <a
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            href="/pages/new"
          >
            New page
          </a>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-slate-600">Status</span>
              <select className="rounded-md border border-slate-200 bg-white px-2 py-1">
                <option>All</option>
                <option>Draft</option>
                <option>Scheduled</option>
                <option>Published</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-slate-600">Author</span>
              <select className="rounded-md border border-slate-200 bg-white px-2 py-1">
                <option>Any</option>
                <option>Demo Admin</option>
                <option>Alex Editor</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-slate-600">Date</span>
              <input type="date" className="rounded-md border border-slate-200 bg-white px-2 py-1" />
            </label>
            <input
              className="min-w-[200px] rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Search title or slug"
            />
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
              Calendar view
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Title</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Slug</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Schedule</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Last edited</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.map((row) => (
                  <tr key={row.slug}>
                    <td className="px-4 py-2 font-medium text-slate-900">{row.title}</td>
                    <td className="px-4 py-2 text-slate-600">{row.slug}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {row.scheduledPublishAt ? `Publish ${row.scheduledPublishAt}` : "—"}
                      {row.scheduledUnpublishAt && <div>Unpublish {row.scheduledUnpublishAt}</div>}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{row.updated}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          className="text-blue-600 hover:underline"
                          href={row.slug === "/" ? "/pages/edit" : `/pages/edit${row.slug}`}
                        >
                          Edit
                        </a>
                        <a className="text-slate-600 hover:underline" href={`/api/preview?slug=${row.slug}`}>
                          Preview
                        </a>
                        <button className="text-slate-600 hover:underline">Rename/Slug</button>
                        <button className="text-rose-600 hover:underline">Soft delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-900">Version history</p>
            <p className="text-xs text-slate-600">Restore older versions or compare changes.</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {versions.map((v) => (
              <li key={v.version} className="rounded-md border border-slate-200 p-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>v{v.version}</span>
                  <span>{v.label}</span>
                </div>
                <p className="font-medium text-slate-900">{v.author}</p>
                <p className="text-xs text-slate-500">{v.timestamp}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <button className="rounded bg-slate-100 px-2 py-1 text-slate-700">Preview</button>
                  <button className="rounded bg-emerald-100 px-2 py-1 text-emerald-800">Restore</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
            Preview links will respect Draft Mode. Use the banner to exit preview after review.
          </div>
          <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-700">
            <p className="text-sm font-semibold text-slate-900">Diff (v12 vs v11)</p>
            <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-800">
              - Hero headline: "Seasonal specials"
              + Hero headline: "Winter tasting menu"
              - Button link: /menu
              + Button link: /winter-menu
            </pre>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Schedule calendar</h2>
          <p className="text-xs text-slate-600">Auto-publish/unpublish via cron every 5 minutes.</p>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {data
            .filter((item) => item.scheduledPublishAt || item.scheduledUnpublishAt)
            .map((item) => (
              <div key={item.slug} className="rounded-md border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-slate-900">{item.title}</p>
                {item.scheduledPublishAt && (
                  <p className="text-slate-700">Publish: {item.scheduledPublishAt}</p>
                )}
                {item.scheduledUnpublishAt && (
                  <p className="text-slate-700">Unpublish: {item.scheduledUnpublishAt}</p>
                )}
                <p className="text-xs text-amber-700">Conflicts flagged before scheduling.</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
