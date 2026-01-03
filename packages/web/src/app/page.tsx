export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold text-slate-900">NeoBuilder Public Site</h1>
      <p className="text-slate-600">
        SSR-first rendering surface for published Easyblocks pages. This scaffold will be wired to the
        database and caching layer in later phases.
      </p>
    </section>
  );
}
