import { apiFetch } from "@/api/client";
import { useEffect, useState, useCallback } from "react";
import { getAdminAuthHeaders } from "./use-admin-auth";
import { toast } from "sonner";

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/api/settings/");
      if (!res.ok) throw new Error("Failed to load settings.");
      const data = (await res.json()) as Record<string, string>;
      setSettings(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load settings.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };
    window.addEventListener("prg-settings-updated", handleUpdate);
    return () => {
      window.removeEventListener("prg-settings-updated", handleUpdate);
    };
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (newSettings: Record<string, string>): Promise<boolean> => {
      try {
        const res = await apiFetch("/api/settings/", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify(newSettings),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to update settings.");
        }

        const updated = (await res.json()) as Record<string, string>;
        setSettings(updated);
        window.dispatchEvent(new Event("prg-settings-updated"));
        toast.success("Settings updated successfully!");
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update settings.";
        toast.error(msg);
        return false;
      }
    },
    [],
  );

  return { settings, isLoading, error, updateSettings, refetch: fetchSettings };
}
