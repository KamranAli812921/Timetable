const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(key) {
  return typeof key === "string" && DATE_KEY_RE.test(key);
}

// Parse a "YYYY-MM-DD" string into a Date at UTC midnight, so the same
// calendar date is stored consistently regardless of server timezone.
export function parseDateKey(key) {
  if (!isValidDateKey(key)) return null;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

// Format a Date (or date string) back into "YYYY-MM-DD" using UTC fields.
export function formatDateKey(date) {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatFullDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
