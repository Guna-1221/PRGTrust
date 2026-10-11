import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useDonations, type Donation } from "@/hooks/use-donations";
import {
  Trash2,
  Pencil,
  Plus,
  RotateCcw,
  ImagePlus,
  Save,
  X,
  Loader2,
  CloudUpload,
} from "lucide-react";
import { uploadFileToR2 } from "./upload-helper";

export function DonationsManager() {
  const { items, isLoading, add, update, remove, resetToSeed } = useDonations();
  const [editing, setEditing] = useState<Donation | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Donation activities</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary"
          >
            <Plus size={16} /> New entry
          </button>
          <button
            onClick={() => {
              if (confirm("Reset to default seed entries in online database?")) resetToSeed();
            }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold border border-border hover:bg-secondary"
            title="Reset to default seed"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {showForm && (
        <DonationForm
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={async (data) => {
            if (editing) {
              await update(editing.id, data);
            } else {
              await add(data);
            }
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {isLoading ? (
        <div className="mt-12 flex justify-center items-center gap-2 text-foreground/60">
          <Loader2 className="animate-spin text-brand-blue" size={24} />
          <p className="text-sm">Loading donation activities from database…</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && (
            <p className="text-foreground/60 col-span-full">
              No donations yet. Click "New entry" to add one.
            </p>
          )}
          {items.map((d) => (
            <article key={d.id} className="card-soft overflow-hidden flex flex-col">
              <div className="aspect-[4/3] bg-secondary overflow-hidden">
                <img
                  src={d.image}
                  alt={d.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold">{d.title}</h3>
                <p className="mt-1 text-sm text-foreground/70 line-clamp-3">{d.description}</p>
                <p className="mt-2 text-xs text-foreground/50">
                  {new Date(d.date).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(d);
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-border hover:bg-secondary"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${d.title}"?`)) remove(d.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DonationForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Donation | null;
  onSave: (d: Omit<Donation, "id" | "date">) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErr("Image too large (max 10MB). Please pick a smaller image.");
      return;
    }

    try {
      setIsUploading(true);
      setErr("");
      const url = await uploadFileToR2(file);
      setImage(url);
    } catch (uploadErr: unknown) {
      const msg = uploadErr instanceof Error ? uploadErr.message : "Failed to upload image.";
      setErr(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !image) {
      setErr("Please fill in all fields and select an image.");
      return;
    }

    try {
      setIsSaving(true);
      await onSave({ title: title.trim(), description: description.trim(), image });
    } catch (saveErr: unknown) {
      const msg = saveErr instanceof Error ? saveErr.message : "Failed to save donation entry.";
      setErr(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 card-soft p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{initial ? "Edit entry" : "New donation entry"}</h3>
        <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-secondary">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder="e.g. Food drive at Athmakur"
            disabled={isSaving}
          />

          <label className="mt-4 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder="What was done, where, and who benefitted."
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Image</label>
          <div className="mt-1.5 aspect-[4/3] w-full rounded-lg border border-dashed border-border bg-secondary/50 overflow-hidden flex items-center justify-center relative">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-foreground/60 text-sm p-4">
                <Loader2 className="animate-spin text-brand-blue" size={28} />
                <span>Uploading to Cloudflare R2…</span>
              </div>
            ) : image ? (
              <img src={image} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-foreground/50 text-sm p-4">
                <ImagePlus className="mx-auto mb-2" />
                No image selected
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading || isSaving}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-border hover:bg-secondary disabled:opacity-50"
            >
              <CloudUpload size={16} /> {image ? "Change image" : "Upload image"}
            </button>
            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                disabled={isUploading || isSaving}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold border border-border text-foreground/70 hover:bg-secondary disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-foreground/50">
            Max 10MB. Stored online in Cloudflare R2 bucket.
          </p>
        </div>
      </div>

      {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving || isUploading}
          className="rounded-full px-5 py-2.5 text-sm font-semibold border border-border hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
