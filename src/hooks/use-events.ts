import { useEffect, useState, useCallback } from "react";
import { getAdminAuthHeaders } from "./use-admin-auth";
import { toast } from "sonner";

export type TrustEvent = {
  id: string;
  title: string;
  description: string;
  image?: string;
  location?: string;
  eventDate: string;
  createdAt: string;
  updatedAt?: string;
};

export function useEvents() {
  const [items, setItems] = useState<TrustEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/events/");
      if (!res.ok) throw new Error("Failed to load events.");
      const data = (await res.json()) as TrustEvent[];
      setItems(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load events.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    // Listen for custom broadcast events across components
    const handleUpdate = () => {
      fetchEvents();
    };
    window.addEventListener("prg-events-updated", handleUpdate);
    return () => {
      window.removeEventListener("prg-events-updated", handleUpdate);
    };
  }, [fetchEvents]);

  const add = useCallback(
    async (e: Omit<TrustEvent, "id" | "createdAt">): Promise<TrustEvent | null> => {
      try {
        const res = await fetch("/api/events/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify(e),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to create event.");
        }

        const created = (await res.json()) as TrustEvent;
        setItems((prev) => [created, ...prev]);
        window.dispatchEvent(new Event("prg-events-updated"));
        toast.success("Event created successfully!");
        return created;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create event.";
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const update = useCallback(
    async (id: string, patch: Partial<TrustEvent>): Promise<TrustEvent | null> => {
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify(patch),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to update event.");
        }

        const updated = (await res.json()) as TrustEvent;
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        window.dispatchEvent(new Event("prg-events-updated"));
        toast.success("Event updated successfully!");
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update event.";
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to delete event.");
      }

      setItems((prev) => prev.filter((it) => it.id !== id));
      window.dispatchEvent(new Event("prg-events-updated"));
      toast.success("Event deleted successfully!");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete event.";
      toast.error(msg);
      return false;
    }
  }, []);

  return { items, isLoading, error, add, update, remove, refetch: fetchEvents };
}
