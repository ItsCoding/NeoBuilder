export default function DatabasesPage() {
    return (<div className="space-y-3">
      <h1 className="text-2xl font-semibold text-slate-900">Custom databases</h1>
      <p className="text-sm text-slate-600">User-defined tables with JSONB rows and filters.</p>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700">
        Table cards, schema editor, and records grid will live here.
      </div>
    </div>);
}
