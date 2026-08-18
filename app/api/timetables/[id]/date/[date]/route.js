import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Timetable from "@/lib/models/Timetable";
import { getSessionFromRequest } from "@/lib/auth";
import { unauthorized, forbidden, notFound, badRequest } from "@/lib/apiHelpers";
import { parseDateKey, formatDateKey } from "@/lib/dateUtils";

async function loadOwnedTimetable(request, id) {
  const session = await getSessionFromRequest(request);
  if (!session) return { error: unauthorized() };
  if (!mongoose.isValidObjectId(id)) return { error: notFound() };

  await connectDB();
  const timetable = await Timetable.findById(id);
  if (!timetable) return { error: notFound() };
  if (timetable.userId.toString() !== session.userId) return { error: forbidden() };

  return { timetable };
}

export async function PUT(request, { params }) {
  const { id, date } = params;
  const parsedDate = parseDateKey(date);
  if (!parsedDate) return badRequest("Invalid date");

  const { timetable, error } = await loadOwnedTimetable(request, id);
  if (error) return error;

  const { subjects } = await request.json();
  if (!Array.isArray(subjects)) return badRequest("subjects must be an array");
  for (const s of subjects) {
    if (!s.name || !s.name.trim()) return badRequest("Each subject requires a name");
  }

  const cleanSubjects = subjects.map((s) => ({
    name: s.name.trim(),
    time: (s.time || "").trim(),
    note: (s.note || "").trim(),
  }));

  const existing = timetable.dateEntries.find((e) => formatDateKey(e.date) === date);

  if (cleanSubjects.length === 0) {
    if (existing) {
      timetable.dateEntries.pull({ _id: existing._id });
    }
  } else if (existing) {
    existing.subjects = cleanSubjects;
  } else {
    timetable.dateEntries.push({ date: parsedDate, subjects: cleanSubjects });
  }

  timetable.updatedAt = new Date();
  await timetable.save();

  const saved = timetable.dateEntries.find((e) => formatDateKey(e.date) === date);
  return NextResponse.json({ date, subjects: saved ? saved.subjects : [] });
}

export async function DELETE(request, { params }) {
  const { id, date } = params;
  if (!parseDateKey(date)) return badRequest("Invalid date");

  const { timetable, error } = await loadOwnedTimetable(request, id);
  if (error) return error;

  const existing = timetable.dateEntries.find((e) => formatDateKey(e.date) === date);
  if (existing) {
    timetable.dateEntries.pull({ _id: existing._id });
    timetable.updatedAt = new Date();
    await timetable.save();
  }

  return NextResponse.json({ ok: true });
}
