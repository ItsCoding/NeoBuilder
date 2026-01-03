"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

type Stats = { usedBytes: number; limitBytes: number; orphanCount: number };

export default function StoragePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/media/stats", { cache: "no-store" });
    const data = await res.json();
    setStats(data.stats ?? null);
  };

  useEffect(() => {
    refresh();
  }, []);

  const cleanup = async () => {
    setLoading(true);
    const res = await fetch("/api/media/orphans", { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted orphaned assets");
      refresh();
    } else {
      toast.error("Cleanup failed", { description: await res.text() });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Storage & quotas</h1>
        <p className="text-sm text-slate-600">Monitor usage, quotas, and orphaned assets.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Used</p>
          <p className="text-2xl font-semibold text-slate-900">{stats ? formatBytes(stats.usedBytes) : "—"}</p>
          <p className="text-xs text-slate-500">of {stats ? formatBytes(stats.limitBytes) : "—"} quota</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Uploads today</p>
          <p className="text-2xl font-semibold text-slate-900">Tracked</p>
          <p className="text-xs text-slate-500">Rate limits enforced per workspace</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Orphaned assets</p>
          <p className="text-2xl font-semibold text-slate-900">{stats ? stats.orphanCount : "—"}</p>
          <p className="text-xs text-slate-500">Safe to delete</p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Orphan cleanup</h2>
          <button
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            onClick={cleanup}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete unused"}
          </button>
        </div>
        <p className="text-sm text-slate-700">
          Detect unused media and reclaim space. Variants are deleted when originals are removed.
        </p>
        <p className="text-xs text-amber-700">Uploads are blocked automatically when quota is exceeded.</p>
      </section>
    </div>
  );
}
