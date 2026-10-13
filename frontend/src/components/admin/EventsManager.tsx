import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useEvents, type TrustEvent } from "@/hooks/use-events";
import {
  Trash2,
  Pencil,
  Plus,
  ImagePlus,
  Save,
  X,
  CalendarDays,
  Loader2,
  CloudUpload,
} from "lucide-react";
import { uploadFileToR2 } from "./upload-helper";

export function EventsManager() {
  const { items, isLoading, add, update, remove } = useEvents();
  const [editing, setEditing] = useState<TrustEvent | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarDays size={20} className="text-brand-orange-deep" /> Events
        </h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary"
        >
          <Plus size={16} /> New event
        </button>
      </div>

      {showForm && (
        <EventForm
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
          <p className="text-sm">Loading events from database…</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && (
            <p className="text-foreground/60 col-span-full">
              No events yet. Click "New event" to add one.
            </p>
          )}
          {items.map((e) => (
            <article key={e.id} className="card-soft overflow-hidden flex flex-col">
              {e.image && (
                <div className="aspect-[16/9] bg-secondary overflow-hidden">
                  <img
                    src={e.image}
                    alt={e.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold">{e.title}</h3>
                <p className="mt-1 text-xs text-foreground/60">
                  {e.eventDate}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                <p className="mt-2 text-sm text-foreground/70 line-clamp-3">{e.description}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(e);
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-border hover:bg-secondary"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${e.title}"?`)) remove(e.id);
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

function EventForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: TrustEvent | null;
  onSave: (d: Omit<TrustEvent, "id" | "createdAt">) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [eventDate, setEventDate] = useState(initial?.eventDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [startTime, setStartTime] = useState(initial?.startTime ?? "");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "");
  const [registrationLink, setRegistrationLink] = useState(initial?.registrationLink ?? "");
  const [contactInfo, setContactInfo] = useState(initial?.contactInfo ?? "");
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
    if (!title.trim() || !description.trim() || !eventDate.trim()) {
      setErr("Title, start date and description are required.");
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || undefined,
        eventDate: eventDate.trim(),
        endDate: endDate.trim() || undefined,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        registrationLink: registrationLink.trim() || undefined,
        contactInfo: contactInfo.trim() || undefined,
        image: image || undefined,
      });
    } catch (saveErr: unknown) {
      const msg = saveErr instanceof Error ? saveErr.message : "Failed to save event.";
      setErr(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 card-soft p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{initial ? "Edit event" : "New event"}</h3>
        <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-secondary">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Event title *</label>
            <input
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="e.g. Free Medical Camp"
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Start Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(ev) => setEventDate(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(ev) => setEndDate(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(ev) => setStartTime(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(ev) => setEndTime(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              value={location}
              onChange={(ev) => setLocation(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Athmakur, Anantapur"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Registration Link (optional)</label>
            <input
              type="url"
              value={registrationLink}
              onChange={(ev) => setRegistrationLink(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="https://..."
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contact Info</label>
            <input
              type="text"
              value={contactInfo}
              onChange={(ev) => setContactInfo(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Phone or email"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="What is the event about, who can join."
              disabled={isSaving}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Image (optional)</label>
          <div className="mt-1.5 aspect-[16/9] w-full rounded-lg border border-dashed border-border bg-secondary/50 overflow-hidden flex items-center justify-center relative">
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
          {isSaving ? "Saving…" : "Save event"}
        </button>
      </div>
    </form>
  );
}
