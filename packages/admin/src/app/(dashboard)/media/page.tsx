"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { toast } from "sonner";

type MediaVariant = { id: string; variantType: string; format: string; storageKey: string; width?: number | null; height?: number | null };
type MediaTagRef = { tag?: { id: string; name: string } };
type MediaAsset = {
  id: string;
  fileName: string;
  mime: string;
  sizeBytes: number;
  storageKey: string;
  alt?: string | null;
  status: string;
  folder?: { id: string; name: string } | null;
  variants?: MediaVariant[];
  tagRefs?: MediaTagRef[];
  usageCount?: number;
  createdAt?: string;
};

type MediaFolder = { id: string; name: string; path: string; parent?: { id: string } | null };

const cdnBase = (process.env.NEXT_PUBLIC_CDN_BASE_URL ?? process.env.NEXT_PUBLIC_MINIO_URL ?? "").replace(/\/$/, "");

const cdnUrl = (key?: string) => {
  if (!key) return "";
  if (!cdnBase) return `https://placehold.co/600x400?text=${encodeURIComponent(key)}`;
  return `${cdnBase}/${key}`;
};

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const readImageSize = (file: File) =>
  new Promise<{ width?: number; height?: number }>((resolve) => {
    if (!file.type.startsWith("image/")) return resolve({});
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({});
    img.src = URL.createObjectURL(file);
  });

const pickPreview = (asset: MediaAsset) => {
  const thumb = asset.variants?.find((variant) => variant.variantType === "thumb") ?? asset.variants?.[0];
  return cdnUrl(thumb?.storageKey ?? asset.storageKey);
};

export default function MediaPage() {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"grid" | "list">("grid");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "other">("all");
  const [showOrphans, setShowOrphans] = useState(false);
  const [stats, setStats] = useState<{ usedBytes: number; limitBytes: number; orphanCount: number } | null>(null);
  const [uploading, setUploading] = useState<{ name: string; progress: number }[]>([]);
  const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null);

  const loadFolders = useCallback(async () => {
    const res = await fetch("/api/media/folders", { cache: "no-store" });
    const data = await res.json();
    setFolders(data.folders ?? []);
  }, []);

  const loadAssets = useCallback(async () => {
    const params = new URLSearchParams();
    if (folderId) params.set("folderId", folderId);
    if (search) params.set("search", search);
    if (tagFilter) params.set("tags", tagFilter);
    if (showOrphans) params.set("orphans", "true");
    const res = await fetch(`/api/media?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    setAssets(data.assets ?? []);
  }, [folderId, search, tagFilter, showOrphans]);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/media/stats", { cache: "no-store" });
    const data = await res.json();
    setStats(data.stats ?? null);
  }, []);

  useEffect(() => {
    loadFolders();
    loadStats();
  }, [loadFolders, loadStats]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const mime = asset.mime ?? "";
      if (typeFilter === "image" && !mime.startsWith("image/")) return false;
      if (typeFilter === "video" && !mime.startsWith("video/")) return false;
      if (typeFilter === "other" && (mime.startsWith("image/") || mime.startsWith("video/"))) return false;
      if (tagFilter) {
        const tags = (asset.tagRefs ?? []).map((ref) => ref.tag?.name).filter(Boolean) as string[];
        if (!tags.some((tag) => tag?.toLowerCase().includes(tagFilter.toLowerCase()))) return false;
      }
      return true;
    });
  }, [assets, typeFilter, tagFilter]);

  const selectedAsset = filteredAssets.find((asset) => asset.id === selected) ?? filteredAssets[0] ?? null;

  const handleUpload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    for (const file of list) {
      const uploadLabel = { name: file.name, progress: 0 };
      setUploading((prev) => [...prev, uploadLabel]);
      try {
        const dims = await readImageSize(file);
        const signRes = await fetch("/api/media/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, mime: file.type, sizeBytes: file.size, folderId }),
        });
        if (!signRes.ok) throw new Error(await signRes.text());
        const signed = await signRes.json();
        await fetch(signed.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        await fetch(`/api/media/${signed.asset.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ width: dims.width, height: dims.height }),
        });
        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`, { description: error instanceof Error ? error.message : "" });
      } finally {
        setUploading((prev) => prev.filter((item) => item.name !== file.name));
        loadAssets();
        loadStats();
      }
    }
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) handleUpload(files);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files?.length) handleUpload(files);
  };

  const toggleSelection = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    if (!selection.size) return;
    await fetch("/api/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: Array.from(selection) }) });
    toast.success("Deleted selected assets");
    setSelection(new Set());
    setSelected(null);
    loadAssets();
    loadStats();
  };

  const deleteAsset = async (id: string) => {
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    toast.success("Deleted asset");
    setSelection((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setSelected(null);
    loadAssets();
    loadStats();
  };

  const moveSelection = async (targetFolderId: string | null) => {
    if (!selection.size) return;
    for (const id of selection) {
      await fetch(`/api/media/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folderId: targetFolderId }) });
    }
    toast.success("Moved assets");
    loadAssets();
  };

  const downloadSelection = () => {
    selection.forEach((id) => {
      const asset = assets.find((a) => a.id === id);
      if (asset) window.open(cdnUrl(asset.storageKey), "_blank");
    });
  };

  const saveDetails = async (asset: MediaAsset, alt: string, tagsValue: string) => {
    const tagList = tagsValue
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await fetch(`/api/media/${asset.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt, tags: tagList }) });
    toast.success("Saved metadata");
    loadAssets();
  };

  const handleFolderDrop = async (event: DragEvent<HTMLButtonElement>, targetFolderId: string | null) => {
    event.preventDefault();
    const assetId = draggedAssetId ?? event.dataTransfer.getData("text/plain");
    if (!assetId) return;
    await fetch(`/api/media/${assetId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folderId: targetFolderId }) });
    setDraggedAssetId(null);
    loadAssets();
  };

  const createFolder = async () => {
    const name = prompt("Folder name");
    if (!name) return;
    await fetch("/api/media/folders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, parentId: folderId }) });
    toast.success("Folder created");
    loadFolders();
  };

  const assetCards = filteredAssets.map((asset) => (
    <div
      key={asset.id}
      draggable
      onDragStart={() => setDraggedAssetId(asset.id)}
      onClick={() => setSelected(asset.id)}
      className={`cursor-pointer rounded-lg border ${selected === asset.id ? "border-blue-500" : "border-slate-200"} bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="aspect-video overflow-hidden rounded-t-lg bg-slate-100">
        <img src={pickPreview(asset)} alt={asset.alt ?? asset.fileName} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="space-y-1 p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-slate-900">{asset.fileName}</p>
          <input type="checkbox" checked={selection.has(asset.id)} onChange={() => toggleSelection(asset.id)} />
        </div>
        <p className="text-xs text-slate-600">{asset.mime}</p>
        <p className="text-xs text-slate-600">{formatBytes(asset.sizeBytes)}</p>
      </div>
    </div>
  ));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Media library</h1>
          <p className="text-sm text-slate-600">MinIO-backed uploads with folders, tags, and responsive variants.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            Usage: {stats ? `${formatBytes(stats.usedBytes)} / ${formatBytes(stats.limitBytes)}` : "—"}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white shadow-sm hover:bg-blue-700">
            <span>Upload</span>
            <input type="file" multiple className="hidden" onChange={handleFileInput} />
          </label>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[260px,1fr,360px]">
        <aside className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Folders</p>
            <button className="text-xs text-blue-600" onClick={createFolder}>
              New folder
            </button>
          </div>
          <div className="space-y-1">
            <button
              className={`w-full rounded-md px-2 py-1 text-left text-sm ${folderId ? "text-slate-700" : "bg-slate-100 font-semibold"}`}
              onClick={() => setFolderId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleFolderDrop(event, null)}
            >
              All media
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                className={`w-full rounded-md px-2 py-1 text-left text-sm ${folderId === folder.id ? "bg-slate-100 font-semibold" : "text-slate-700"}`}
                onClick={() => setFolderId(folder.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleFolderDrop(event, folder.id)}
              >
                {folder.path}
              </button>
            ))}
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <label className="block text-xs font-semibold text-slate-700">Search</label>
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filename"
            />
            <label className="block text-xs font-semibold text-slate-700">Tag filter</label>
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              placeholder="tag, another"
            />
            <label className="block text-xs font-semibold text-slate-700">Type</label>
            <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as any)}>
              <option value="all">All</option>
              <option value="image">Images</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={showOrphans} onChange={(event) => setShowOrphans(event.target.checked)} /> Show orphaned only
            </label>
          </div>
        </aside>

        <section className="space-y-3">
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <div>
              <p className="font-semibold text-slate-900">Upload files</p>
              <p className="text-xs text-slate-600">Drag and drop or use the Upload button. Variants generate after completion.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-slate-200 px-3 py-1 text-xs" onClick={downloadSelection}>
                Download selected
              </button>
              <button className="rounded-md border border-slate-200 px-3 py-1 text-xs" onClick={bulkDelete}>
                Delete selected
              </button>
              <select className="rounded-md border border-slate-200 px-3 py-1 text-xs" onChange={(e) => moveSelection(e.target.value || null)} defaultValue="">
                <option value="">Move to…</option>
                <option value="">Root</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.path}
                  </option>
                ))}
              </select>
              <div className="flex rounded-md border border-slate-200 bg-white p-1 text-xs shadow-sm">
                <button className={`rounded px-3 py-1 ${view === "grid" ? "bg-slate-900 text-white" : "text-slate-700"}`} onClick={() => setView("grid")}>
                  Grid
                </button>
                <button className={`rounded px-3 py-1 ${view === "list" ? "bg-slate-900 text-white" : "text-slate-700"}`} onClick={() => setView("list")}>
                  List
                </button>
              </div>
            </div>
          </div>

          {uploading.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Uploading</p>
              <ul className="mt-1 space-y-1 text-xs">
                {uploading.map((item) => (
                  <li key={item.name} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-slate-500">In progress…</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{assetCards}</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">File</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Tags</th>
                    <th className="px-3 py-2">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="border-b border-slate-100 text-slate-800 hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={selection.has(asset.id)} onChange={() => toggleSelection(asset.id)} />
                          <button className="text-left" onClick={() => setSelected(asset.id)}>
                            <p className="font-semibold">{asset.fileName}</p>
                            <p className="text-xs text-slate-500">{asset.folder?.name ?? "Root"}</p>
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">{asset.mime}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{formatBytes(asset.sizeBytes)}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{(asset.tagRefs ?? []).map((ref) => ref.tag?.name).filter(Boolean).join(", ")}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{asset.usageCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {selectedAsset ? (
            <AssetDetail asset={selectedAsset} onSave={saveDetails} onDelete={() => deleteAsset(selectedAsset.id)} />
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Select an asset to edit metadata, tags, and variants.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function AssetDetail({ asset, onSave, onDelete }: { asset: MediaAsset; onSave: (asset: MediaAsset, alt: string, tags: string) => void; onDelete: () => void }) {
  const [alt, setAlt] = useState(asset.alt ?? "");
  const [tags, setTags] = useState((asset.tagRefs ?? []).map((ref) => ref.tag?.name).filter(Boolean).join(", "));

  useEffect(() => {
    setAlt(asset.alt ?? "");
    setTags((asset.tagRefs ?? []).map((ref) => ref.tag?.name).filter(Boolean).join(", "));
  }, [asset]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg bg-slate-50">
        <img src={pickPreview(asset)} alt={alt || asset.fileName} className="h-48 w-full object-cover" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{asset.fileName}</p>
        <p className="text-xs text-slate-600">{asset.mime}</p>
        <p className="text-xs text-slate-600">{formatBytes(asset.sizeBytes)}</p>
      </div>
      <div className="space-y-2 text-sm">
        <label className="block text-xs font-semibold text-slate-700">Alt text</label>
        <input className="w-full rounded-md border border-slate-200 px-3 py-2" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <label className="block text-xs font-semibold text-slate-700">Tags</label>
        <input className="w-full rounded-md border border-slate-200 px-3 py-2" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma separated" />
        <button className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => onSave(asset, alt, tags)}>
          Save metadata
        </button>
        <button className="w-full rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700" onClick={onDelete}>
          Delete asset
        </button>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Variants</p>
        <ul className="mt-2 space-y-1">
          {(asset.variants ?? []).map((variant) => (
            <li key={variant.id} className="flex items-center justify-between">
              <span>
                {variant.variantType} · {variant.format}
              </span>
              <a className="text-blue-600" href={cdnUrl(variant.storageKey)} target="_blank" rel="noreferrer">
                View
              </a>
            </li>
          ))}
          {!asset.variants?.length && <li className="text-slate-500">Variants will appear after processing.</li>}
        </ul>
        <p className="mt-2 text-slate-500">Usage count: {asset.usageCount ?? 0}</p>
      </div>
    </div>
  );
}
