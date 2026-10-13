import { useRef, useState, type ChangeEvent } from "react";
import { useBackground } from "@/hooks/use-background";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { uploadFileToR2 } from "./upload-helper";
import { CloudUpload, Image as ImageIcon, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type BackgroundTarget = "desktop" | "mobile";

export function BackgroundManager() {
  const {
    desktopBackgroundImage,
    mobileBackgroundImage,
    isLoading: isBackgroundLoading,
  } = useBackground();
  const { settings, isLoading: areSettingsLoading, updateSettings } = useSiteSettings();
  const [processingTarget, setProcessingTarget] = useState<BackgroundTarget | null>(null);
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  const saveImage = async (target: BackgroundTarget, file?: File) => {
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB). Please pick a smaller image.");
      return;
    }

    const settingKey = target === "desktop" ? "homeDesktopBackground" : "homeMobileBackground";
    try {
      setProcessingTarget(target);
      const imageUrl = file ? await uploadFileToR2(file) : "";
      const saved = await updateSettings({ ...settings, [settingKey]: imageUrl });
      if (!saved) throw new Error("Failed to save background image setting.");

      window.dispatchEvent(new Event("prg-background-updated"));
      toast.success(`${target === "desktop" ? "Desktop" : "Mobile"} background updated.`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update background.");
    } finally {
      setProcessingTarget(null);
    }
  };

  const handleFile = (target: BackgroundTarget) => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await saveImage(target, file);
  };

  if (isBackgroundLoading || areSettingsLoading) {
    return (
      <div className="mt-12 flex items-center justify-center gap-2 text-foreground/60">
        <Loader2 className="animate-spin text-brand-blue" size={24} />
        <p className="text-sm">Loading background data…</p>
      </div>
    );
  }

  const backgrounds: {
    target: BackgroundTarget;
    title: string;
    image: string | null;
    fallback: string;
    fileRef: typeof desktopFileRef;
  }[] = [
    {
      target: "desktop",
      title: "Desktop Background",
      image: desktopBackgroundImage,
      fallback: "/background.jpeg",
      fileRef: desktopFileRef,
    },
    {
      target: "mobile",
      title: "Mobile Background",
      image: mobileBackgroundImage,
      fallback: "/mobilebg.jpeg",
      fileRef: mobileFileRef,
    },
  ];

  return (
    <section className="mt-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-2">
        <ImageIcon size={20} className="text-brand-orange-deep" />
        <div>
          <h2 className="text-xl font-semibold">Home Background Images</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Set separate images for desktop and mobile screens.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {backgrounds.map(({ target, title, image, fallback, fileRef }) => {
          const isProcessing = processingTarget === target;
          const previewImage = image || fallback;

          return (
            <div key={target} className="card-soft p-6">
              <label className="mb-2 block text-sm font-medium">{title}</label>
              <div
                className={`w-full overflow-hidden rounded-lg border border-dashed border-border bg-secondary/50 ${
                  target === "desktop" ? "aspect-video" : "mx-auto aspect-[9/16] max-h-[32rem]"
                }`}
              >
                {isProcessing ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-foreground/60">
                    <Loader2 className="animate-spin text-brand-blue" size={28} />
                    <span>Uploading and saving…</span>
                  </div>
                ) : (
                  <img
                    src={previewImage}
                    alt={`${title} preview`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile(target)}
                className="hidden"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={processingTarget !== null}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold btn-primary disabled:opacity-50"
                >
                  <CloudUpload size={16} /> {image ? "Change image" : "Upload image"}
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => void saveImage(target)}
                    disabled={processingTarget !== null}
                    className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Remove override
                  </button>
                )}
              </div>
              {!image && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground/50">
                  <ImagePlus size={14} /> Showing the built-in default image.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-foreground/50">
        Max 10MB per image. Uploaded images are stored online in Cloudflare R2.
      </p>
    </section>
  );
}
