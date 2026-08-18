"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CalendarGrid from "./CalendarGrid";
import DayPanel from "./DayPanel";
import RecurringModal from "./RecurringModal";
import { formatDateKey } from "@/lib/dateUtils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TimetableView({ fetchUrl, basePath, readOnly, backHref, backLabel, ownerLabel }) {
  const [timetable, setTimetable] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [now] = useState(() => new Date());
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  async function load() {
    try {
      const res = await fetch(fetchUrl);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load timetable");
      setTimetable(data.timetable);
      setTitleDraft(data.timetable.name);
    } catch (e) {
      setLoadError(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl]);

  const entriesByDateKey = useMemo(() => {
    const map = new Map();
    if (timetable) {
      for (const entry of timetable.dateEntries) {
        map.set(formatDateKey(entry.date), entry.subjects);
      }
    }
    return map;
  }, [timetable]);

  function goToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  function goPrev() {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function goNext() {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  async function saveTitle() {
    if (!titleDraft.trim() || titleDraft === timetable.name) {
      setEditingTitle(false);
      setTitleDraft(timetable.name);
      return;
    }
    const res = await fetch(basePath, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: titleDraft.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setTimetable((t) => ({ ...t, name: data.timetable.name }));
    }
    setEditingTitle(false);
  }

  if (loadError) {
    return <p className="text-destructive p-6">{loadError}</p>;
  }
  if (!timetable) {
    return <p className="text-muted-foreground p-6">Loading...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={backHref} className="text-sm text-primary hover:underline">
          &larr; {backLabel}
        </Link>
        {ownerLabel && <span className="text-sm text-muted-foreground">{ownerLabel}</span>}
      </div>

      {editingTitle && !readOnly ? (
        <input
          autoFocus
          className="w-full text-2xl font-bold bg-transparent border-b-2 border-border focus:outline-none focus:border-primary"
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => e.key === "Enter" && saveTitle()}
        />
      ) : (
        <h1
          className={`text-2xl font-bold text-foreground ${!readOnly ? "cursor-text hover:text-primary" : ""}`}
          onClick={() => !readOnly && setEditingTitle(true)}
        >
          {timetable.name}
        </h1>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            aria-label="Previous month"
            className="p-2 border border-border rounded-md text-sm bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={goToday}
            className="px-3 py-2 border border-border rounded-md text-sm bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Today
          </button>
          <button
            onClick={goNext}
            aria-label="Next month"
            className="p-2 border border-border rounded-md text-sm bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <span className="font-medium text-foreground">
          {MONTH_NAMES[month]} {year}
        </span>
        {!readOnly ? (
          <button
            onClick={() => setShowRecurring(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
            </svg>
            Add Recurring Schedule
          </button>
        ) : (
          <span />
        )}
      </div>

      <CalendarGrid
        year={year}
        month={month}
        entriesByDateKey={entriesByDateKey}
        onSelectDate={(key) => setSelectedDateKey(key)}
      />

      {selectedDateKey && (
        <DayPanel
          dateKey={selectedDateKey}
          subjects={entriesByDateKey.get(selectedDateKey) || []}
          basePath={basePath}
          readOnly={readOnly}
          onClose={() => setSelectedDateKey(null)}
          onSaved={() => load()}
        />
      )}

      {showRecurring && (
        <RecurringModal
          basePath={basePath}
          onClose={() => setShowRecurring(false)}
          onApplied={() => {
            setShowRecurring(false);
            load();
          }}
        />
      )}
    </div>
  );
}
