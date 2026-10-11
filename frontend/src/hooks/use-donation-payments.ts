import { apiFetch } from "@/api/client";
import { useEffect, useState, useCallback } from "react";
import { getAdminAuthHeaders } from "./use-admin-auth";
import { toast } from "sonner";

export type DonationPayment = {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  message?: string;
  paymentStatus: "pending" | "successful" | "failed" | "cancelled";
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
};

export function useDonationPayments(statusFilter?: string) {
  const [items, setItems] = useState<DonationPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = statusFilter
        ? `/api/payments/?status=${encodeURIComponent(statusFilter)}`
        : "/api/payments/";
      const res = await apiFetch(url, {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load donation payments.");
      const data = (await res.json()) as DonationPayment[];
      setItems(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load donation payments.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();

    const handleUpdate = () => {
      fetchPayments();
    };
    window.addEventListener("prg-payments-updated", handleUpdate);
    return () => {
      window.removeEventListener("prg-payments-updated", handleUpdate);
    };
  }, [fetchPayments]);

  const updateStatus = useCallback(
    async (
      id: string,
      status: DonationPayment["paymentStatus"],
      transactionId?: string,
    ): Promise<DonationPayment | null> => {
      try {
        const patch: Partial<DonationPayment> = { paymentStatus: status };
        if (transactionId !== undefined) {
          patch.transactionId = transactionId;
        }

        const res = await apiFetch(`/api/payments/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify(patch),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to update payment status.");
        }

        const updated = (await res.json()) as DonationPayment;
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        window.dispatchEvent(new Event("prg-payments-updated"));
        toast.success("Payment status updated!");
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update payment status.";
        toast.error(msg);
        return null;
      }
    },
    [],
  );

  return { items, isLoading, error, updateStatus, refetch: fetchPayments };
}

export function useSubmitDonation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DonationPayment | null>(null);

  const submit = useCallback(
    async (data: {
      donorName: string;
      donorEmail?: string;
      donorPhone?: string;
      amount: number;
      message?: string;
    }) => {
      try {
        setIsSubmitting(true);
        setError(null);

        const res = await apiFetch("/api/payments/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to submit donation.");
        }

        const created = (await res.json()) as DonationPayment;
        setResult(created);
        window.dispatchEvent(new Event("prg-payments-updated"));
        // We don't show a toast here because it's a public form, the UI will likely redirect or show a success message
        return created;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to submit donation.";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { submit, isSubmitting, error, result };
}
