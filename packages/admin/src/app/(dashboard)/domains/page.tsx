export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Domains</h1>
        <p className="text-sm text-slate-600">Connect custom domains, verify DNS, and manage www canonicalization.</p>
      </header>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Primary domain</p>
            <p className="text-sm text-slate-600">www.acme-bistro.com</p>
          </div>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            Test DNS
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            Canonicalization
            <select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
              <option>Force www → root</option>
              <option>Force root → www</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Preview domain
            <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue="preview.acme-bistro.com" />
          </label>
        </div>
        <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          DNS verification runs automatically and surfaces actionable errors here.
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Environment domains</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Domain</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Type</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="px-4 py-2 text-slate-700">staging.acme-bistro.com</td>
                <td className="px-4 py-2 text-slate-700">Staging</td>
                <td className="px-4 py-2 text-emerald-700">Verified</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-slate-700">preview.acme-bistro.com</td>
                <td className="px-4 py-2 text-slate-700">Preview</td>
                <td className="px-4 py-2 text-amber-700">Needs DNS</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600">SSL handled by reverse proxy; keep DNS records synced after publish.</p>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Connect new domain</p>
          <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Start wizard
          </button>
        </div>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>1. Add DNS A/CNAME record as instructed</li>
          <li>2. Click "Test DNS" to verify</li>
          <li>3. Activate and purge caches</li>
        </ul>
      </section>
    </div>
  );
}
