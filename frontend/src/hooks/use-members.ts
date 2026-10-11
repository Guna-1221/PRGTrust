import { apiFetch } from "@/api/client";
import { useEffect, useState, useCallback } from "react";
import { getAdminAuthHeaders } from "./use-admin-auth";
import { toast } from "sonner";

export type Member = {
  id: string;
  name: string;
  position: string;
  image?: string;
  biography?: string;
  qualification?: string;
  experience?: string;
  phone?: string;
  email?: string;
  isLeadership: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function useMembers(activeOnly: boolean = false) {
  const [items, setItems] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = activeOnly ? "/api/members/?active=true" : "/api/members/";
      const res = await apiFetch(url);
      if (!res.ok) throw new Error("Failed to load members.");
      const data = (await res.json()) as Member[];
      setItems(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load members.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchMembers();

    const handleUpdate = () => {
      fetchMembers();
    };
    window.addEventListener("prg-members-updated", handleUpdate);
    return () => {
      window.removeEventListener("prg-members-updated", handleUpdate);
    };
  }, [fetchMembers]);

  const add = useCallback(
    async (m: Omit<Member, "id" | "createdAt" | "updatedAt">): Promise<Member | null> => {
      try {
        const res = await apiFetch("/api/members/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify(m),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to create member.");
        }

        const created = (await res.json()) as Member;
        setItems((prev) => [created, ...prev]);
        window.dispatchEvent(new Event("prg-members-updated"));
        toast.success("Member added successfully!");
        return created;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to add member.";
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  const update = useCallback(async (id: string, patch: Partial<Member>): Promise<Member | null> => {
    try {
      const res = await apiFetch(`/api/members/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to update member.");
      }

      const updated = (await res.json()) as Member;
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      window.dispatchEvent(new Event("prg-members-updated"));
      toast.success("Member updated successfully!");
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update member.";
      toast.error(msg);
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/members/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to delete member.");
      }

      setItems((prev) => prev.filter((it) => it.id !== id));
      window.dispatchEvent(new Event("prg-members-updated"));
      toast.success("Member deleted successfully!");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete member.";
      toast.error(msg);
      return false;
    }
  }, []);

  return { items, isLoading, error, add, update, remove, refetch: fetchMembers };
}
