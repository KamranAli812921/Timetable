"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tempPassword, setTempPassword] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers((await res.json()).users);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReset(userId) {
    if (!confirm("Reset this user's password? A temporary password will be generated.")) return;
    setResettingId(userId);
    setError("");
    try {
      const res = await fetch(`/api/admin/reset-password/${userId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setTempPassword({ userId, password: data.tempPassword });
    } catch (err) {
      setError(err.message);
    } finally {
      setResettingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) return <p className="p-6 text-muted-foreground">Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Admin &middot; All Users</h1>
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/dashboard" className="text-sm text-primary hover:underline">
            My timetables
          </Link>
          <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            Log out
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {tempPassword && (
        <div className="border border-accent/40 bg-accent/10 rounded-xl p-4 flex flex-col sm:flex-row items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-accent">Temporary password generated</p>
            <p className="text-sm text-foreground break-words">
              Share this with the user now &mdash; it will not be shown again:{" "}
              <span className="font-mono font-semibold break-all">{tempPassword.password}</span>
            </p>
          </div>
          <button
            onClick={() => setTempPassword(null)}
            aria-label="Dismiss"
            className="text-accent hover:opacity-70 text-lg leading-none px-1 shrink-0"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <div key={u._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border rounded-xl p-4 bg-card">
            <div className="min-w-0">
              <p className="font-medium text-card-foreground">
                {u.name}{" "}
                {u.role === "admin" && (
                  <span className="text-xs text-primary font-normal align-middle bg-primary/10 rounded px-1.5 py-0.5">admin</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground break-words">
                {u.email} &middot; joined {new Date(u.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href={`/admin/${u._id}`} className="text-sm text-primary hover:underline">
                View Timetables
              </Link>
              <button
                onClick={() => handleReset(u._id)}
                disabled={resettingId === u._id}
                className="text-sm text-accent hover:underline disabled:opacity-50"
              >
                Reset Password
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
