import { useState, useEffect, useCallback } from "react";

const TOKEN_STORAGE_KEY = "prg_admin_token_session";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function getAdminAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getStoredToken();
  });
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Verify session on mount
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          if (mounted) setIsAuthenticated(true);
        } else {
          setStoredToken(null);
          if (mounted) setIsAuthenticated(false);
        }
      } catch {
        // If network error, keep current state
      } finally {
        if (mounted) setIsChecking(false);
      }
    };

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (passcode: string): Promise<boolean> => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        token?: string;
        error?: string;
      };

      if (res.ok && data.token) {
        setStoredToken(data.token);
        setIsAuthenticated(true);
        setError("");
        return true;
      } else {
        setError(data.error || "Incorrect passcode.");
        return false;
      }
    } catch {
      setError("Network error. Could not reach server.");
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: getAdminAuthHeaders(),
      }).catch(() => {});
    } finally {
      setStoredToken(null);
      setIsAuthenticated(false);
      setError("");
    }
  }, []);

  return {
    isAuthenticated,
    isChecking,
    error,
    login,
    logout,
    setError,
  };
}
