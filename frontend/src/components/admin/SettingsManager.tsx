import { useState, useEffect, type FormEvent } from "react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Settings, Save, Loader2 } from "lucide-react";

export function SettingsManager() {
  const { settings, isLoading, updateSettings } = useSiteSettings();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings(formData);
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="mt-12 flex justify-center items-center gap-2 text-foreground/60">
        <Loader2 className="animate-spin text-brand-blue" size={24} />
        <p className="text-sm">Loading settings…</p>
      </div>
    );
  }

  return (
    <section className="mt-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={20} className="text-brand-orange-deep" />
        <h2 className="text-xl font-semibold">Site Settings</h2>
      </div>

      <form onSubmit={submit} className="card-soft p-6 space-y-8">
        <div>
          <h3 className="text-lg font-medium border-b border-border pb-2 mb-4">Organization Info</h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Organization Name</label>
              <input
                value={formData.orgName || ""}
                onChange={(e) => handleChange("orgName", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <textarea
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Footer Description</label>
              <textarea
                value={formData.footerDescription || ""}
                onChange={(e) => handleChange("footerDescription", e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium border-b border-border pb-2 mb-4">Social Links</h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Facebook URL</label>
              <input
                value={formData.socialFacebook || ""}
                onChange={(e) => handleChange("socialFacebook", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Instagram URL</label>
              <input
                value={formData.socialInstagram || ""}
                onChange={(e) => handleChange("socialInstagram", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Twitter / X URL</label>
              <input
                value={formData.socialTwitter || ""}
                onChange={(e) => handleChange("socialTwitter", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="text-sm font-medium">YouTube URL</label>
              <input
                value={formData.socialYoutube || ""}
                onChange={(e) => handleChange("socialYoutube", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium border-b border-border pb-2 mb-4">Misc</h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Copyright Text</label>
              <input
                value={formData.copyrightText || ""}
                onChange={(e) => handleChange("copyrightText", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </section>
  );
}
