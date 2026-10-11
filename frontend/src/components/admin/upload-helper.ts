import { apiFetch } from "@/api/client";
import { getAdminAuthHeaders } from "@/hooks/use-admin-auth";

export async function uploadFileToR2(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch("/api/upload", {
    method: "POST",
    headers: getAdminAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const errData = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errData.error || "Failed to upload image to R2 storage.");
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
