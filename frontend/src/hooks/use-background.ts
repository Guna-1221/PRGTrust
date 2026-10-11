import { apiFetch } from "@/api/client";
import { useEffect, useState } from "react";

export function useBackground() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchBackground = () => {
      apiFetch("/api/background/")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (mounted && data && data.image) {
            setBackgroundImage(data.image);
          } else if (mounted && data && data.active && data.active.image) {
            // handle both single object or { active: object } formats
            setBackgroundImage(data.active.image);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    };

    fetchBackground();

    const handler = () => {
      fetchBackground();
    };

    window.addEventListener("prg-background-updated", handler);
    return () => {
      mounted = false;
      window.removeEventListener("prg-background-updated", handler);
    };
  }, []);

  return { backgroundImage, isLoading };
}
