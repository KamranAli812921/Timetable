import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Timetable from "@/lib/models/Timetable";
import { getSessionFromRequest } from "@/lib/auth";
import { unauthorized, forbidden, notFound, badRequest } from "@/lib/apiHelpers";

export async function GET(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();

  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  await connectDB();
  const timetable = await Timetable.findById(id);
  if (!timetable) return notFound();
  if (timetable.userId.toString() !== session.userId) return forbidden();

  return NextResponse.json({ timetable });
}

export async function PUT(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();

  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  const { name } = await request.json();
  if (!name || !name.trim()) return badRequest("Timetable name is required");

  await connectDB();
  const timetable = await Timetable.findById(id);
  if (!timetable) return notFound();
  if (timetable.userId.toString() !== session.userId) return forbidden();

  timetable.name = name.trim();
  timetable.updatedAt = new Date();
  await timetable.save();

  return NextResponse.json({ timetable: { id: timetable._id, name: timetable.name } });
}

export async function DELETE(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();

  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  await connectDB();
  const timetable = await Timetable.findById(id);
  if (!timetable) return notFound();
  if (timetable.userId.toString() !== session.userId) return forbidden();

  await timetable.deleteOne();

  return NextResponse.json({ ok: true });
}
