"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminUserTimetablesPage({ params }) {
  const { userId } = params;
  const [user, setUser] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/timetables/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
      } else {
        setUser(data.user);
        setTimetables(data.timetables);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <p className="p-6 text-muted-foreground">Loading...</p>;
  if (error) return <p className="p-6 text-destructive">{error}</p>;

  return (
    <main className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <Link href="/admin" className="text-sm text-primary hover:underline w-fit">
        &larr; All users
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{user.name}&apos;s Timetables</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="flex flex-col gap-2">
        {timetables.length === 0 && <p className="text-sm text-muted-foreground">This user has no timetables yet.</p>}
        {timetables.map((t) => (
          <Link
            key={t.id}
            href={`/admin/${userId}/${t.id}`}
            className="border border-border rounded-xl p-4 bg-card transition-colors hover:border-primary/50 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <p className="font-medium text-card-foreground">{t.name}</p>
            <p className="text-xs text-muted-foreground">
              Updated {new Date(t.updatedAt).toLocaleDateString()} &middot; {t.entryCount} date{t.entryCount === 1 ? "" : "s"} filled
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
