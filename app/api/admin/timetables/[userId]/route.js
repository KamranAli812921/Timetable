import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Timetable from "@/lib/models/Timetable";
import { getSessionFromRequest } from "@/lib/auth";
import { unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

export async function GET(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();
  if (session.role !== "admin") return forbidden();

  const { userId } = params;
  if (!mongoose.isValidObjectId(userId)) return notFound();

  await connectDB();
  const user = await User.findById(userId).select("name email");
  if (!user) return notFound();

  const timetables = await Timetable.find({ userId }).select("name createdAt updatedAt dateEntries").sort({ updatedAt: -1 });

  const result = timetables.map((t) => ({
    id: t._id,
    name: t.name,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    entryCount: t.dateEntries.length,
  }));

  return NextResponse.json({
    user: { id: user._id, name: user.name, email: user.email },
    timetables: result,
  });
}
