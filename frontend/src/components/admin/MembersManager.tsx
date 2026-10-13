import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useMembers, type Member } from "@/hooks/use-members";
import {
  Trash2,
  Pencil,
  Plus,
  ImagePlus,
  Save,
  X,
  Users,
  Loader2,
  CloudUpload,
} from "lucide-react";
import { uploadFileToR2 } from "./upload-helper";
import { DEFAULT_FOUNDER_PROFILE, findFounderMember } from "@/lib/member-display";

const founderFormDefaults: Partial<Member> = {
  ...DEFAULT_FOUNDER_PROFILE,
  isLeadership: true,
  isActive: true,
  displayOrder: 0,
};

export function MembersManager() {
  const { items, isLoading, add, update, remove } = useMembers(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [isAddingFounder, setIsAddingFounder] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const founder = findFounderMember(items);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users size={20} className="text-brand-orange-deep" /> Members
        </h2>
        <button
          onClick={() => {
            setEditing(null);
            setIsAddingFounder(false);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary"
        >
          <Plus size={16} /> New member
        </button>
      </div>

      {!isLoading && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-brand-orange/25 bg-brand-orange/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-4">
            {founder?.image ? (
              <img
                src={founder.image}
                alt=""
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-orange/15 text-brand-orange-deep">
                <Users size={27} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-orange-deep">
                Founder profile
              </p>
              <h3 className="mt-1 truncate font-semibold">
                {founder?.name ?? "Founder profile not set"}
              </h3>
              <p className="mt-1 text-sm text-foreground/65">
                {founder
                  ? "Manage the profile shown on the Home and About pages."
                  : "Add the founder as a member to publish their profile on the Home and About pages."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(founder ?? null);
              setIsAddingFounder(!founder);
              setShowForm(true);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-brand-orange/30 bg-background px-4 py-2.5 text-sm font-semibold text-brand-blue-deep hover:bg-brand-orange/10 sm:self-auto"
          >
            {founder ? <Pencil size={15} /> : <Plus size={16} />}
            {founder ? "Edit founder details" : "Add founder profile"}
          </button>
        </div>
      )}

      {showForm && (
        <MemberForm
          key={editing?.id ?? (isAddingFounder ? "new-founder" : "new-member")}
          initial={editing ?? (isAddingFounder ? founderFormDefaults : null)}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
            setIsAddingFounder(false);
          }}
          onSave={async (data) => {
            const saved = editing ? await update(editing.id, data) : await add(data);
            if (saved) {
              setShowForm(false);
              setEditing(null);
              setIsAddingFounder(false);
            }
            return saved !== null;
          }}
        />
      )}

      {isLoading ? (
        <div className="mt-12 flex justify-center items-center gap-2 text-foreground/60">
          <Loader2 className="animate-spin text-brand-blue" size={24} />
          <p className="text-sm">Loading members from database…</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && (
            <p className="text-foreground/60 col-span-full">
              No members yet. Click "New member" to add one.
            </p>
          )}
          {items.map((m) => (
            <article
              key={m.id}
              className={`card-soft overflow-hidden flex flex-col ${!m.isActive ? "opacity-70" : ""}`}
            >
              <div className="aspect-[4/3] bg-secondary overflow-hidden">
                {m.image ? (
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-foreground/30">
                    <Users size={48} />
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{m.name}</h3>
                  {m.isLeadership && (
                    <span className="bg-brand-blue/10 text-brand-blue text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      Leadership
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-brand-orange-deep">{m.position}</p>
                <div className="mt-2 text-xs text-foreground/70 space-y-1">
                  {m.phone && <p>📞 {m.phone}</p>}
                  {m.email && <p>✉️ {m.email}</p>}
                  {!m.isActive && <p className="text-destructive font-medium">Inactive</p>}
                </div>
                <div className="mt-4 flex gap-2 pt-2 border-t border-border mt-auto">
                  <button
                    onClick={() => {
                      setEditing(m);
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-border hover:bg-secondary"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete member "${m.name}"?`)) remove(m.id);
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

function MemberForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<Member> | null;
  onSave: (d: Omit<Member, "id" | "createdAt" | "updatedAt">) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [biography, setBiography] = useState(initial?.biography ?? "");
  const [qualification, setQualification] = useState(initial?.qualification ?? "");
  const [experience, setExperience] = useState(initial?.experience ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [isLeadership, setIsLeadership] = useState(initial?.isLeadership ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState<number>(initial?.displayOrder ?? 0);

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
    try {
      setIsSaving(true);
      const saved = await onSave({
        name: name.trim(),
        position: position.trim(),
        biography: biography.trim() || undefined,
        qualification: qualification.trim() || undefined,
        experience: experience.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        isLeadership,
        isActive,
        displayOrder,
        image: image || undefined,
      });
      if (!saved) setErr("Could not save the member. Review the error notification and try again.");
    } catch (saveErr: unknown) {
      const msg = saveErr instanceof Error ? saveErr.message : "Failed to save member.";
      setErr(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 card-soft p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {initial?.id
            ? "Edit member"
            : initial?.isLeadership
              ? "Add founder profile"
              : "New member"}
        </h3>
        <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-secondary">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Name (optional)</label>
            <input
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Full name"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Position (optional)</label>
            <input
              value={position}
              onChange={(ev) => setPosition(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="e.g. Founder, Volunteer"
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Phone (optional)</label>
              <input
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Qualification (optional)</label>
              <input
                value={qualification}
                onChange={(ev) => setQualification(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Experience (optional)</label>
              <input
                value={experience}
                onChange={(ev) => setExperience(ev.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Biography (optional)</label>
            <textarea
              value={biography}
              onChange={(ev) => setBiography(ev.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              disabled={isSaving}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Image (optional)</label>
          <div className="mt-1.5 aspect-[3/4] w-48 rounded-lg border border-dashed border-border bg-secondary/50 overflow-hidden flex items-center justify-center relative">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-foreground/60 text-sm p-4">
                <Loader2 className="animate-spin text-brand-blue" size={28} />
                <span>Uploading…</span>
              </div>
            ) : image ? (
              <img src={image} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-foreground/50 text-sm p-4">
                <ImagePlus className="mx-auto mb-2" />
                No image
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

          <div className="mt-6 flex flex-col gap-4 p-4 border border-border rounded-xl bg-secondary/20">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLeadership}
                onChange={(e) => setIsLeadership(e.target.checked)}
                className="rounded border-border text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <span className="text-sm font-medium">Leadership Team</span>
            </label>
            <p className="text-xs text-foreground/65">
              Leadership members appear in the About page leadership section; other active members
              appear under Our Team.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-border text-brand-blue focus:ring-brand-blue w-4 h-4"
              />
              <span className="text-sm font-medium">Active Member</span>
            </label>
            <div>
              <label className="text-sm font-medium block">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(ev) => setDisplayOrder(parseInt(ev.target.value) || 0)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isSaving}
              />
            </div>
          </div>
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
