"use client";

import { formatDateKey } from "@/lib/dateUtils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function todayKey() {
  const now = new Date();
  return formatDateKey(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export default function CalendarGrid({ year, month, entriesByDateKey, onSelectDate }) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekday = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const today = todayKey();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs font-semibold text-muted-foreground py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} className="aspect-square" />;
          }
          const dateKey = formatDateKey(new Date(Date.UTC(year, month, day)));
          const subjects = entriesByDateKey.get(dateKey) || [];
          const isToday = dateKey === today;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={`aspect-square rounded-md border p-1 flex flex-col items-center justify-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${isToday ? "border-primary ring-1 ring-primary" : "border-border"}
                hover:bg-primary/10 hover:border-primary/50`}
            >
              <span className={`font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day}</span>
              {subjects.length > 0 && (
                <span className="mt-1 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  <span className="text-[10px] text-muted-foreground">{subjects.length}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
