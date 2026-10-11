import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useDonations } from "@/hooks/use-donations";
import { useGallery } from "@/hooks/use-gallery";
import { combineImages, type CombinedImage } from "@/lib/combined-images";
import {
  CloudUpload,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { uploadFileToR2 } from "./upload-helper";

type ImageSource = CombinedImage["source"];

export function GalleryManager() {
  const donations = useDonations();
  const gallery = useGallery();
  const [editing, setEditing] = useState<CombinedImage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const images = combineImages(gallery.items, donations.items);
  const isLoading = gallery.isLoading || donations.isLoading;
  const error = gallery.error || donations.error;

  const saveImage = async (
    source: ImageSource,
    data: { title: string; description: string; image: string; displayOrder: number },
  ): Promise<boolean> => {
    if (editing) {
      if (editing.source === "donation") {
        return Boolean(
          await donations.update(editing.sourceId, {
            title: data.title,
            description: data.description,
            image: data.image,
          }),
        );
      }
      return Boolean(
        await gallery.update(editing.sourceId, {
          title: data.title,
          description: data.description || undefined,
          image: data.image,
          displayOrder: data.displayOrder,
        }),
      );
    }

    if (source === "donation") {
      return Boolean(
        await donations.add({
          title: data.title,
          description: data.description,
          image: data.image,
        }),
      );
    }
    return Boolean(
      await gallery.add({
        title: data.title,
        description: data.description || undefined,
        image: data.image,
        displayOrder: data.displayOrder,
      }),
    );
  };

  const deleteImage = async (item: CombinedImage) => {
    if (item.source === "donation") {
      await donations.remove(item.sourceId);
    } else {
      await gallery.remove(item.sourceId);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <ImageIcon size={20} className="text-brand-orange-deep" /> Images &amp; Gallery
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            Donation activity and gallery images are managed together.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary"
          >
            <Plus size={16} /> New image
          </button>
          <button
            onClick={() => {
              if (confirm("Reset donation activities to the default seed entries?")) {
                void donations.resetToSeed();
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
            title="Reset donation activities to default seed entries"
            aria-label="Reset donation activities"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {showForm && (
        <ImageForm
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={saveImage}
        />
      )}

      {isLoading ? (
        <div className="mt-12 flex items-center justify-center gap-2 text-foreground/60">
          <Loader2 className="animate-spin text-brand-blue" size={24} />
          <p className="text-sm">Loading donation and gallery images…</p>
        </div>
      ) : error ? (
        <p role="alert" className="mt-8 text-sm text-destructive">
          Could not load all images: {error}
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {images.length === 0 && (
            <p className="col-span-full text-foreground/60">
              No images yet. Click “New image” to add one.
            </p>
          )}
          {images.map((item) => (
            <article key={item.key} className="card-soft flex flex-col overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="w-fit rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground/70">
                  {item.source === "donation" ? "Donation activity" : "Gallery image"}
                </span>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/70">{item.description}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${item.title}"?`)) void deleteImage(item);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
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

function ImageForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: CombinedImage | null;
  onSave: (
    source: ImageSource,
    data: { title: string; description: string; image: string; displayOrder: number },
  ) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [source, setSource] = useState<ImageSource>(initial?.source ?? "gallery");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(initial?.displayOrder ?? 0);
  const [image, setImage] = useState(initial?.image ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large (max 10MB). Please pick a smaller image.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setImage(await uploadFileToR2(file));
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !image || (source === "donation" && !description.trim())) {
      setError(
        source === "donation"
          ? "Title, description and image are required for a donation activity."
          : "Title and image are required.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const saved = await onSave(source, {
        title: title.trim(),
        description: description.trim(),
        image,
        displayOrder,
      });
      if (saved) onCancel();
      else setError("Could not save this image. Please try again.");
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save image.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 card-soft p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{initial ? "Edit image" : "New image"}</h3>
        <button type="button" onClick={onCancel} className="rounded-full p-2 hover:bg-secondary">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="image-source">
            Image type
          </label>
          <select
            id="image-source"
            value={source}
            onChange={(event) => setSource(event.target.value as ImageSource)}
            disabled={Boolean(initial) || isSaving}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-70"
          >
            <option value="gallery">Gallery image</option>
            <option value="donation">Donation activity</option>
          </select>

          <label className="mt-4 block text-sm font-medium" htmlFor="image-title">
            Title *
          </label>
          <input
            id="image-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            disabled={isSaving}
          />

          <label className="mt-4 block text-sm font-medium" htmlFor="image-description">
            Description {source === "donation" ? "*" : "(optional)"}
          </label>
          <textarea
            id="image-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            disabled={isSaving}
          />

          {source === "gallery" && (
            <>
              <label className="mt-4 block text-sm font-medium" htmlFor="image-order">
                Display order
              </label>
              <input
                id="image-order"
                type="number"
                value={displayOrder}
                onChange={(event) => setDisplayOrder(Number.parseInt(event.target.value, 10) || 0)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Image *</label>
          <div className="mt-1.5 relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-secondary/50">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 p-4 text-sm text-foreground/60">
                <Loader2 className="animate-spin text-brand-blue" size={28} />
                <span>Uploading to Cloudflare R2…</span>
              </div>
            ) : image ? (
              <img src={image} alt="Image preview" className="h-full w-full object-cover" />
            ) : (
              <div className="p-4 text-center text-sm text-foreground/50">
                <ImagePlus className="mx-auto mb-2" />
                No image selected
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading || isSaving}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
          >
            <CloudUpload size={16} /> {image ? "Change image" : "Upload image"}
          </button>
          <p className="mt-2 text-xs text-foreground/50">
            Max 10MB. Stored online in Cloudflare R2.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving || isUploading}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving…" : "Save image"}
        </button>
      </div>
    </form>
  );
}
