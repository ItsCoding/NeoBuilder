const tabs = ["Meta defaults", "Sitemap", "Robots.txt", "Structured data"];

export default function SeoSettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">SEO settings</h1>
        <p className="text-sm text-slate-600">
          Manage meta defaults, sitemaps, robots rules, and structured data templates.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Meta defaults</h2>
          <label className="block text-sm text-slate-700">
            Title pattern
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="%page_title% | Acme Bistro"
            />
          </label>
          <label className="block text-sm text-slate-700">
            Default description
            <textarea
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="Craft a short summary for search and social previews"
            />
          </label>
          <label className="block text-sm text-slate-700">
            OG image URL
            <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <div className="flex justify-end">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Save defaults
            </button>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            Canonical URL patterns and trailing slash preferences apply automatically to all pages.
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Sitemap</h2>
          <p className="text-sm text-slate-600">Auto-generated daily; respects publish status and locales.</p>
          <div className="flex gap-3 text-sm text-slate-700">
            <button className="rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-100">
              Regenerate
            </button>
            <a className="text-blue-600" href="/api/sitemap.xml">
              View sitemap
            </a>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            Redirect loops are validated before publish to avoid broken SEO signals.
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Robots.txt</h2>
          <textarea
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
            rows={6}
            defaultValue={`User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml`}
          />
          <div className="flex gap-2">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Save robots.txt
            </button>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
              Restore default
            </button>
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Structured data (LocalBusiness)</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Business name
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-sm text-slate-700">
              Phone
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-sm text-slate-700">
              Address
              <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="text-sm text-slate-700">
              Opening hours
              <input
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                placeholder="Mon-Fri 9:00-18:00"
              />
            </label>
          </div>
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            JSON-LD preview will render here when values are provided.
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">SEO score & checks</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✔️ Meta title length OK</li>
            <li>⚠️ 2 images missing alt text on /catering</li>
            <li>✔️ H1/H2 hierarchy valid</li>
            <li>✔️ No redirect chains detected</li>
          </ul>
          <p className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-800">Score: 92/100 • publish allowed</p>
        </section>
      </div>
    </div>
  );
}
