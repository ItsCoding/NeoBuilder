export default function NewPageForm() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Create page</h1>
        <p className="text-sm text-slate-600">Set slug, status, schedule, and SEO before publishing.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label className="text-sm text-slate-700">
            Title
            <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="About us" />
          </label>
          <label className="text-sm text-slate-700">
            Slug
            <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="/about" />
          </label>
          <label className="text-sm text-slate-700">
            Template
            <select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
              <option>Blank page</option>
              <option>About</option>
              <option>Menu</option>
              <option>Landing (hero + CTA)</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Status
            <select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
              <option>Draft</option>
              <option>Published</option>
              <option>Scheduled</option>
            </select>
          </label>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Scheduling</h2>
          <label className="text-sm text-slate-700">
            Publish at
            <input type="datetime-local" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="text-sm text-slate-700">
            Unpublish at
            <input type="datetime-local" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            Conflicts are flagged if publish/unpublish windows overlap existing schedules.
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">SEO</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Meta title
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-sm text-slate-700">
              Meta description
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-sm text-slate-700">
              Canonical URL
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="https://example.com/about" />
            </label>
            <label className="text-sm text-slate-700">
              OG image URL
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" placeholder="https://cdn.example.com/og-about.png" />
            </label>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-700">
            SEO score checker will flag missing meta, alt text, heading structure, and redirect chains before publish.
          </div>
          <div className="flex gap-2">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Save draft
            </button>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
              Preview
            </button>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
              Validate redirects
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
