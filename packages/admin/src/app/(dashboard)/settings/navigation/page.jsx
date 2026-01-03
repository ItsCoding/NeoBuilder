export default function NavigationSettingsPage() {
    return (<div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Navigation & redirects</h1>
        <p className="text-sm text-slate-600">Manage header/footer menus and redirect rules with validation.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Header menu</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p>Home → /</p>
            <p>Menu → /menu</p>
            <p>Reservations → /book</p>
          </div>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            Edit menu
          </button>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Footer menu</h2>
          <p className="text-sm text-slate-700">Add contact, privacy, terms, and social links.</p>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            Edit footer
          </button>
        </section>

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Redirects</h2>
            <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Add redirect
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">From</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">To</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-4 py-2 text-slate-700">/old-menu</td>
                  <td className="px-4 py-2 text-slate-700">/menu</td>
                  <td className="px-4 py-2 text-slate-700">301</td>
                  <td className="px-4 py-2 text-emerald-700">Valid</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
            Redirect chain validation prevents 301→301 loops and flags missing targets.
          </div>
          <div className="rounded-md border border-dashed border-slate-200 p-3 text-xs text-slate-600">
            Import CSV for bulk redirects and run validation before save to block broken chains.
          </div>
        </section>
      </div>
    </div>);
}
