export default function BackupsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Backups</h1>
        <p className="text-sm text-slate-600">Schedule automatic backups and restore safely with confirmations.</p>
      </header>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Auto-backup schedule</p>
            <p className="text-sm text-slate-600">Daily at 03:00 UTC • keep last 14 backups</p>
          </div>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            Edit schedule
          </button>
        </div>
        <div className="flex gap-3 text-sm text-slate-700">
          <button className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
            Create backup now
          </button>
          <button className="rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-100">
            Download latest
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">History</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Date</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Size</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Type</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr>
                <td className="px-4 py-2 text-slate-700">2026-01-03 03:00 UTC</td>
                <td className="px-4 py-2 text-slate-700">420 MB</td>
                <td className="px-4 py-2 text-slate-700">Auto</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2 text-sm">
                    <button className="rounded bg-slate-100 px-2 py-1 text-slate-700">Download</button>
                    <button className="rounded bg-rose-100 px-2 py-1 text-rose-700">Restore</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-md bg-rose-50 p-3 text-xs text-rose-800">
          Restores require confirmation and will create a new backup before overwriting content.
        </div>
        <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-700">
          Bulk operations (theme switch, plugin updates) trigger pre-flight backups automatically.
        </div>
      </section>
    </div>
  );
}
