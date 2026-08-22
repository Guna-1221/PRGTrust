import { useEffect, useState, useCallback } from "react";
import food1 from "@/assets/food-donation-1.jpg";
import food2 from "@/assets/food-donation-2.jpg";
import food3 from "@/assets/food-donation-3.jpg";
import { getAdminAuthHeaders } from "./use-admin-auth";
import { toast } from "sonner";

export type Donation = {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
};

const SEED_IMAGE_MAP: Record<string, string> = {
  "seed-1": food1,
  "/assets/food-donation-1.jpg": food1,
  "seed-2": food2,
  "/assets/food-donation-2.jpg": food2,
  "seed-3": food3,
  "/assets/food-donation-3.jpg": food3,
};

export function resolveDonationImage(image: string, id?: string): string {
  if (id && SEED_IMAGE_MAP[id]) return SEED_IMAGE_MAP[id];
  if (SEED_IMAGE_MAP[image]) return SEED_IMAGE_MAP[image];
  return image;
}

export function useDonations() {
  const [items, setItems] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/donations/");
      if (!res.ok) throw new Error("Failed to load donations.");
      const data = (await res.json()) as Donation[];
      const mapped = data.map((d) => ({
        ...d,
        image: resolveDonationImage(d.image, d.id),
      }));
      setItems(mapped);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load donations.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();

    const handleUpdate = () => {
      fetchDonations();
    };
    window.addEventListener("prg-donations-updated", handleUpdate);
    return () => {
      window.removeEventListener("prg-donations-updated", handleUpdate);
    };
  }, [fetchDonations]);

  const add = useCallback(
    async (d: Omit<Donation, "id" | "date"> & { date?: string }): Promise<Donation | null> => {
      try {
        const res = await fetch("/api/donations/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify(d),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to create donation entry.");
        }

        const created = (await res.json()) as Donation;
        const normalized = {
          ...created,
          image: resolveDonationImage(created.image, created.id),
        };

        setItems((prev) => [normalized, ...prev]);
        window.dispatchEvent(new Event("prg-donations-updated"));
        toast.success("Donation activity saved!");
        return normalized;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create donation entry.";
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Donation>): Promise<Donation | null> => {
      try {
        const res = await fetch(`/api/donations/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify(patch),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to update donation entry.");
        }

        const updated = (await res.json()) as Donation;
        const normalized = {
          ...updated,
          image: resolveDonationImage(updated.image, updated.id),
        };

        setItems((prev) => prev.map((it) => (it.id === id ? normalized : it)));
        window.dispatchEvent(new Event("prg-donations-updated"));
        toast.success("Donation activity updated!");
        return normalized;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update donation entry.";
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/donations/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to delete donation entry.");
      }

      setItems((prev) => prev.filter((it) => it.id !== id));
      window.dispatchEvent(new Event("prg-donations-updated"));
      toast.success("Donation activity deleted!");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete donation entry.";
      toast.error(msg);
      return false;
    }
  }, []);

  const resetToSeed = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/donations/seed", {
        method: "POST",
        headers: getAdminAuthHeaders(),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to reset donation entries.");
      }

      const data = (await res.json()) as { items: Donation[] };
      const normalized = (data.items || []).map((d) => ({
        ...d,
        image: resolveDonationImage(d.image, d.id),
      }));

      setItems(normalized);
      window.dispatchEvent(new Event("prg-donations-updated"));
      toast.success("Reset to default seed donation entries.");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset donations.";
      toast.error(msg);
      return false;
    }
  }, []);

  return { items, isLoading, error, add, update, remove, resetToSeed, refetch: fetchDonations };
}
