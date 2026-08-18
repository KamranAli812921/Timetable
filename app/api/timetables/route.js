import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Timetable from "@/lib/models/Timetable";
import { getSessionFromRequest } from "@/lib/auth";
import { unauthorized, badRequest } from "@/lib/apiHelpers";

export async function GET(request) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();

  await connectDB();
  const timetables = await Timetable.find({ userId: session.userId })
    .select("name createdAt updatedAt dateEntries")
    .sort({ updatedAt: -1 });

  const result = timetables.map((t) => ({
    id: t._id,
    name: t.name,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    entryCount: t.dateEntries.length,
  }));

  return NextResponse.json({ timetables: result });
}

export async function POST(request) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();

  const { name } = await request.json();
  if (!name || !name.trim()) {
    return badRequest("Timetable name is required");
  }

  await connectDB();
  const timetable = await Timetable.create({
    userId: session.userId,
    name: name.trim(),
    dateEntries: [],
  });

  return NextResponse.json({ timetable: { id: timetable._id, name: timetable.name } }, { status: 201 });
}
