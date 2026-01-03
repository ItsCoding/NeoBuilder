export default function MediaPage() {
    return (<div className="space-y-3">
      <h1 className="text-2xl font-semibold text-slate-900">Media library</h1>
      <p className="text-sm text-slate-600">MinIO-backed uploads with tags, folders, and variants.</p>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700">
        Grid/list toggle, folder tree, tags, and upload dropzone will appear here.
      </div>
    </div>);
}
