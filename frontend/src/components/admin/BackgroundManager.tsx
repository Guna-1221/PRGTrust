import { apiFetch } from "@/api/client";
import { useState, useRef, type ChangeEvent } from "react";
import { useBackground } from "@/hooks/use-background";
import { getAdminAuthHeaders } from "@/hooks/use-admin-auth";
import { uploadFileToR2 } from "./upload-helper";
import { ImagePlus, Trash2, CloudUpload, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function BackgroundManager() {
  const { backgroundImage, isLoading } = useBackground();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB). Please pick a smaller image.");
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadFileToR2(file);

      setIsProcessing(true);
      const res = await apiFetch("/api/background/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ image: url }),
      });

      if (!res.ok) {
        throw new Error("Failed to save background image.");
      }

      window.dispatchEvent(new Event("prg-background-updated"));
      toast.success("Background image updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update background.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove the current background image?")) return;

    try {
      setIsProcessing(true);
      const res = await apiFetch("/api/background/", {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error("Failed to remove background image.");
      }

      window.dispatchEvent(new Event("prg-background-updated"));
      toast.success("Background image removed successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove background.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12 flex justify-center items-center gap-2 text-foreground/60">
        <Loader2 className="animate-spin text-brand-blue" size={24} />
        <p className="text-sm">Loading background data…</p>
      </div>
    );
  }

  return (
    <section className="mt-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon size={20} className="text-brand-orange-deep" />
        <h2 className="text-xl font-semibold">Home Background Image</h2>
      </div>

      <div className="card-soft p-6">
        <label className="text-sm font-medium mb-2 block">Current Background</label>
        <div className="aspect-video w-full rounded-lg border border-dashed border-border bg-secondary/50 overflow-hidden flex items-center justify-center relative">
          {isUploading || isProcessing ? (
            <div className="flex flex-col items-center gap-2 text-foreground/60 text-sm p-4">
              <Loader2 className="animate-spin text-brand-blue" size={28} />
              <span>{isUploading ? "Uploading…" : "Saving…"}</span>
            </div>
          ) : backgroundImage ? (
            <img
              src={backgroundImage}
              alt="Background preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center text-foreground/50 text-sm p-4">
              <ImagePlus className="mx-auto mb-2" />
              No background image set
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading || isProcessing}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary disabled:opacity-50"
          >
            <CloudUpload size={16} /> {backgroundImage ? "Change image" : "Upload image"}
          </button>

          {backgroundImage && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading || isProcessing}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 size={16} /> Remove
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-foreground/50">
          Max 10MB. Stored online in Cloudflare R2 bucket.
        </p>
      </div>
    </section>
  );
}
