import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { LogOut, Loader2 } from "lucide-react";

import { EventsManager } from "@/components/admin/EventsManager";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { MembersManager } from "@/components/admin/MembersManager";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { BackgroundManager } from "@/components/admin/BackgroundManager";
import { PaymentsManager } from "@/components/admin/PaymentsManager";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — PRG Trust" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAuthenticated, isChecking, error, login, logout, setError } = useAdminAuth();

  if (isChecking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
        <p className="text-sm text-foreground/60">Verifying administrator session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} error={error} onClearError={() => setError("")} />;
  }

  return <Dashboard onLogout={logout} />;
}

function Login({
  onLogin,
  error,
  onClearError,
}: {
  onLogin: (pass: string) => Promise<boolean>;
  error: string;
  onClearError: () => void;
}) {
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pass.trim()) return;
    setLoading(true);
    await onLogin(pass);
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm card-soft p-8">
        <h1 className="text-2xl font-semibold">Administrator Access</h1>
        <p className="mt-1 text-sm text-foreground/70">Enter the admin passcode to continue.</p>
        <input
          type="password"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            onClearError();
          }}
          placeholder="Passcode"
          className="mt-5 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          autoFocus
          disabled={loading}
        />
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full px-5 py-2.5 text-sm font-semibold btn-primary inline-flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Verifying…" : "Sign in"}
        </button>
        <p className="mt-4 text-xs text-foreground/50">
          This page is intentionally hidden from navigation. Authenticated securely on Cloudflare
          Workers.
        </p>
      </form>
    </div>
  );
}

type AdminTab = "events" | "gallery" | "members" | "payments" | "background" | "settings";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("events");

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "events", label: "Events" },
    { key: "gallery", label: "Images & Gallery" },
    { key: "members", label: "Members" },
    { key: "payments", label: "Payments" },
    { key: "background", label: "Background" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="accent-bar" />
          <h1 className="mt-3 text-3xl font-display">Content Manager</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Manage events and donation activities. Stored in Cloudflare D1 and R2, synced live
            across all devices.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold border border-border hover:bg-secondary transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="mt-6 inline-flex rounded-full border border-border p-1 overflow-x-auto max-w-full hide-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
              tab === t.key ? "btn-primary" : "text-foreground/70 hover:bg-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsManager />}
      {tab === "gallery" && <GalleryManager />}
      {tab === "members" && <MembersManager />}
      {tab === "payments" && <PaymentsManager />}
      {tab === "background" && <BackgroundManager />}
      {tab === "settings" && <SettingsManager />}
    </div>
  );
}
