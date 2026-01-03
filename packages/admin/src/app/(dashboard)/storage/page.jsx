export default function StoragePage() {
    return (<div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Storage & quotas</h1>
        <p className="text-sm text-slate-600">Monitor usage, quotas, and orphaned assets.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Used</p>
          <p className="text-2xl font-semibold text-slate-900">1.2 GB</p>
          <p className="text-xs text-slate-500">of 5 GB quota</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Uploads today</p>
          <p className="text-2xl font-semibold text-slate-900">162 MB</p>
          <p className="text-xs text-slate-500">Rate limits enforced per workspace</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Orphaned assets</p>
          <p className="text-2xl font-semibold text-slate-900">3</p>
          <p className="text-xs text-slate-500">Safe to delete</p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Orphan cleanup</h2>
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Delete unused
          </button>
        </div>
        <p className="text-sm text-slate-700">
          Detect unused media and reclaim space. Variants are deleted when originals are removed.
        </p>
        <p className="text-xs text-amber-700">Uploads are blocked automatically when quota is exceeded.</p>
      </section>
    </div>);
}
