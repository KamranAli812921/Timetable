"use client";

import { useEffect, useState } from "react";
import { formatFullDate, parseDateKey } from "@/lib/dateUtils";

const emptyForm = { name: "", time: "", note: "" };

export default function DayPanel({ dateKey, subjects, basePath, readOnly, onClose, onSaved }) {
  const [localSubjects, setLocalSubjects] = useState(subjects || []);
  const [form, setForm] = useState(emptyForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocalSubjects(subjects || []);
    setForm(emptyForm);
    setEditingIndex(null);
    setError("");
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  if (!dateKey) return null;

  const fullDate = formatFullDate(parseDateKey(dateKey));
  const pdfUrl = `${basePath}/date/${dateKey}/pdf`;
  const canDownload = localSubjects.length > 0;

  function addSubject() {
    if (!form.name.trim()) {
      setError("Subject name is required");
      return;
    }
    setLocalSubjects((prev) => [...prev, { ...form, name: form.name.trim() }]);
    setForm(emptyForm);
    setError("");
    setDirty(true);
  }

  function removeSubject(idx) {
    setLocalSubjects((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }

  function startEdit(idx) {
    setEditingIndex(idx);
    setEditForm(localSubjects[idx]);
  }

  function commitEdit(idx) {
    if (!editForm.name.trim()) {
      setError("Subject name is required");
      return;
    }
    setLocalSubjects((prev) => prev.map((s, i) => (i === idx ? { ...editForm, name: editForm.name.trim() } : s)));
    setEditingIndex(null);
    setError("");
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${basePath}/date/${dateKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects: localSubjects }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setLocalSubjects(data.subjects);
      setDirty(false);
      onSaved(dateKey, data.subjects);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-card text-card-foreground overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">{fullDate}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <a
          href={canDownload ? pdfUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!canDownload}
          className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border w-fit transition-colors
            ${canDownload ? "border-primary text-primary hover:bg-primary/10" : "border-border text-muted-foreground pointer-events-none opacity-50"}`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
          Download PDF
        </a>

        <div className="flex flex-col gap-2">
          {localSubjects.length === 0 && (
            <p className="text-sm text-muted-foreground">No subjects added for this date.</p>
          )}
          {localSubjects.map((s, idx) => (
            <div key={idx} className="border border-border rounded-lg p-3">
              {editingIndex === idx ? (
                <div className="flex flex-col gap-2">
                  <input
                    className="border border-border rounded-md px-2 py-1 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Subject name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  <input
                    className="border border-border rounded-md px-2 py-1 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Time (e.g. 9:00-10:00)"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  />
                  <textarea
                    className="border border-border rounded-md px-2 py-1 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Note (optional)"
                    value={editForm.note}
                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => commitEdit(idx)}
                      className="text-xs px-2 py-1.5 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="text-xs px-2 py-1.5 border border-border rounded-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-card-foreground">{s.name}</p>
                    {s.time && <p className="text-sm text-muted-foreground">{s.time}</p>}
                    {s.note && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.note}</p>}
                  </div>
                  {!readOnly && (
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => startEdit(idx)} className="text-xs text-primary hover:underline">
                        Edit
                      </button>
                      <button onClick={() => removeSubject(idx)} className="text-xs text-destructive hover:underline">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {!readOnly && (
          <>
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Add Subject</p>
              <input
                className="border border-border rounded-md px-2 py-1.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Subject name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border border-border rounded-md px-2 py-1.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Time (e.g. 9:00-10:00)"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              <textarea
                className="border border-border rounded-md px-2 py-1.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Note (optional)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
              <button
                onClick={addSubject}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-primary text-primary rounded-md w-fit transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
                </svg>
                Add Subject
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="mt-auto bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
