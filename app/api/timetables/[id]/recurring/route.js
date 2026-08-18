import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Timetable from "@/lib/models/Timetable";
import { getSessionFromRequest } from "@/lib/auth";
import { unauthorized, forbidden, notFound, badRequest } from "@/lib/apiHelpers";
import { parseDateKey, formatDateKey } from "@/lib/dateUtils";

const MAX_RANGE_DAYS = 366 * 2;

export async function POST(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();

  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  const { name, time, note, daysOfWeek, startDate, endDate } = await request.json();

  if (!name || !name.trim()) return badRequest("Subject name is required");
  if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
    return badRequest("Select at least one day of the week");
  }
  if (daysOfWeek.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
    return badRequest("Invalid daysOfWeek");
  }

  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  if (!start || !end) return badRequest("Invalid start or end date");
  if (end < start) return badRequest("End date must be on or after start date");

  const rangeDays = Math.round((end - start) / (24 * 60 * 60 * 1000));
  if (rangeDays > MAX_RANGE_DAYS) return badRequest("Date range is too large");

  await connectDB();
  const timetable = await Timetable.findById(id);
  if (!timetable) return notFound();
  if (timetable.userId.toString() !== session.userId) return forbidden();

  const dayOfWeekSet = new Set(daysOfWeek);
  const subjectToAdd = {
    name: name.trim(),
    time: (time || "").trim(),
    note: (note || "").trim(),
  };

  const entryByKey = new Map(
    timetable.dateEntries.map((e) => [formatDateKey(e.date), e])
  );

  let matchedCount = 0;
  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    if (!dayOfWeekSet.has(cursor.getUTCDay())) continue;
    matchedCount++;
    const key = formatDateKey(cursor);
    const existing = entryByKey.get(key);
    if (existing) {
      existing.subjects.push(subjectToAdd);
    } else {
      const created = { date: new Date(cursor), subjects: [subjectToAdd] };
      timetable.dateEntries.push(created);
      entryByKey.set(key, timetable.dateEntries[timetable.dateEntries.length - 1]);
    }
  }

  timetable.updatedAt = new Date();
  await timetable.save();

  return NextResponse.json({ ok: true, datesFilled: matchedCount });
}
