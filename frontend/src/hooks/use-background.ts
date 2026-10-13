import { apiFetch } from "@/api/client";
import { useEffect, useState } from "react";

type SiteBackgroundSettings = {
  homeDesktopBackground?: string;
  homeMobileBackground?: string;
};

export function useBackground() {
  const [desktopBackgroundImage, setDesktopBackgroundImage] = useState<string | null>(null);
  const [mobileBackgroundImage, setMobileBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchBackgrounds = async () => {
      try {
        const [backgroundResponse, settingsResponse] = await Promise.all([
          apiFetch("/api/background/"),
          apiFetch("/api/settings/"),
        ]);
        if (!backgroundResponse.ok || !settingsResponse.ok) {
          throw new Error("Failed to load homepage backgrounds.");
        }

        const background = (await backgroundResponse.json()) as { image?: string } | null;
        const settings = (await settingsResponse.json()) as SiteBackgroundSettings;
        if (!mounted) return;

        setDesktopBackgroundImage(
          settings.homeDesktopBackground !== undefined
            ? settings.homeDesktopBackground || null
            : background?.image || null,
        );
        setMobileBackgroundImage(settings.homeMobileBackground || null);
      } catch (error: unknown) {
        console.error("Failed to load homepage backgrounds:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchBackgrounds();
    window.addEventListener("prg-background-updated", fetchBackgrounds);
    window.addEventListener("prg-settings-updated", fetchBackgrounds);
    return () => {
      mounted = false;
      window.removeEventListener("prg-background-updated", fetchBackgrounds);
      window.removeEventListener("prg-settings-updated", fetchBackgrounds);
    };
  }, []);

  return { desktopBackgroundImage, mobileBackgroundImage, isLoading };
}
