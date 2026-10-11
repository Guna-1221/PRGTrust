import { apiFetch } from "@/api/client";
import { useEffect, useState, useCallback } from "react";
import { getAdminAuthHeaders } from "./use-admin-auth";
import { toast } from "sonner";

export type GalleryImage = {
  id: string;
  title: string;
  description?: string;
  image: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type GalleryImageInput = Pick<
  GalleryImage,
  "title" | "description" | "image" | "displayOrder"
>;

export function useGallery() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/api/gallery/");
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(errData.error || errData.message || "Failed to load gallery images.");
      }
      const data = (await res.json()) as GalleryImage[];
      setItems(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load gallery images.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();

    const handleUpdate = () => {
      fetchGallery();
    };
    window.addEventListener("prg-gallery-updated", handleUpdate);
    return () => {
      window.removeEventListener("prg-gallery-updated", handleUpdate);
    };
  }, [fetchGallery]);

  const add = useCallback(async (e: GalleryImageInput): Promise<GalleryImage | null> => {
    try {
      const res = await apiFetch("/api/gallery/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify(e),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to create gallery image.");
      }

      const created = (await res.json()) as GalleryImage;
      setItems((prev) => [created, ...prev]);
      window.dispatchEvent(new Event("prg-gallery-updated"));
      toast.success("Gallery image added successfully!");
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add gallery image.";
      toast.error(msg);
      return null;
    }
  }, []);

  const update = useCallback(
    async (id: string, patch: Partial<GalleryImage>): Promise<GalleryImage | null> => {
      try {
        const res = await apiFetch(`/api/gallery/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify(patch),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to update gallery image.");
        }

        const updated = (await res.json()) as GalleryImage;
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        window.dispatchEvent(new Event("prg-gallery-updated"));
        toast.success("Gallery image updated successfully!");
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update gallery image.";
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/gallery/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to delete gallery image.");
      }

      setItems((prev) => prev.filter((it) => it.id !== id));
      window.dispatchEvent(new Event("prg-gallery-updated"));
      toast.success("Gallery image deleted successfully!");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete gallery image.";
      toast.error(msg);
      return false;
    }
  }, []);

  return { items, isLoading, error, add, update, remove, refetch: fetchGallery };
}
