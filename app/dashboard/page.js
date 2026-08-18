"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [meRes, ttRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/timetables")]);
    if (meRes.ok) setUser((await meRes.json()).user);
    if (ttRes.ok) setTimetables((await ttRes.json()).timetables);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Enter a name for the timetable first");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create timetable");
      router.push(`/dashboard/${data.timetable.id}`);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this timetable? This cannot be undone.")) return;
    const res = await fetch(`/api/timetables/${id}`, { method: "DELETE" });
    if (res.ok) setTimetables((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) return <p className="p-6 text-muted-foreground">Loading...</p>;

  return (
    <main className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">My Timetables</h1>
          {user && <p className="text-sm text-muted-foreground truncate">Signed in as {user.name}</p>}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {user?.role === "admin" && (
            <Link href="/admin" className="text-sm text-primary hover:underline">
              Admin panel
            </Link>
          )}
          <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            Log out
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2">
        <label className="flex-1 min-w-0">
          <span className="sr-only">New timetable name</span>
          <input
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="New timetable name (e.g. Semester 3)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
          </svg>
          Create New Timetable
        </button>
      </form>
      {error && (
        <p className="text-sm text-destructive -mt-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {timetables.length === 0 && (
          <p className="text-sm text-muted-foreground">You don&apos;t have any timetables yet. Create one above to get started.</p>
        )}
        {timetables.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 border border-border rounded-xl p-4 bg-card transition-colors hover:border-primary/50"
          >
            <Link
              href={`/dashboard/${t.id}`}
              className="flex-1 min-w-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="font-medium text-card-foreground truncate">{t.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                Updated {new Date(t.updatedAt).toLocaleDateString()} &middot; {t.entryCount} date{t.entryCount === 1 ? "" : "s"} filled
              </p>
            </Link>
            <button
              onClick={() => handleDelete(t.id)}
              className="text-xs text-destructive hover:underline shrink-0 px-2 py-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
