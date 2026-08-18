"use client";

import { useState } from "react";

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function RecurringModal({ basePath, onClose, onApplied }) {
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(value) {
    setDaysOfWeek((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Subject name is required");
    if (daysOfWeek.length === 0) return setError("Pick at least one day of the week");
    if (!startDate || !endDate) return setError("Start and end date are required");

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${basePath}/recurring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, time, note, daysOfWeek, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply recurring schedule");
      onApplied(data.datesFilled);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-card text-card-foreground rounded-xl w-full max-w-md p-6 flex flex-col gap-3 max-h-[90vh] overflow-y-auto border border-border"
      >
        <h2 className="text-lg font-semibold flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary" aria-hidden="true">
            <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
          </svg>
          Add Recurring Schedule
        </h2>

        <input
          className="border border-border rounded-md px-2 py-1.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border border-border rounded-md px-2 py-1.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Time (e.g. 9:00 AM - 3:00 PM)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <textarea
          className="border border-border rounded-md px-2 py-1.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <fieldset>
          <legend className="text-sm font-medium text-foreground mb-1">Days of week</legend>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <label
                key={d.value}
                className={`text-xs px-2.5 py-1.5 rounded-md border cursor-pointer select-none transition-colors
                  ${daysOfWeek.includes(d.value) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={daysOfWeek.includes(d.value)}
                  onChange={() => toggleDay(d.value)}
                />
                {d.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0">
            <label className="text-xs text-muted-foreground mb-1 block">
              Start date
              <input
                type="date"
                className="border border-border rounded-md px-2 py-1.5 text-sm bg-card w-full mt-1 focus:outline-none focus:ring-2 focus:ring-ring"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs text-muted-foreground mb-1 block">
              End date
              <input
                type="date"
                className="border border-border rounded-md px-2 py-1.5 text-sm bg-card w-full mt-1 focus:outline-none focus:ring-2 focus:ring-ring"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1.5 border border-border rounded-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {saving ? "Applying..." : "Apply"}
          </button>
        </div>
      </form>
    </div>
  );
}
