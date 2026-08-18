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

  const { userId, timetableId } = params;
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(timetableId)) return notFound();

  await connectDB();
  const user = await User.findById(userId).select("name email");
  if (!user) return notFound();

  const timetable = await Timetable.findById(timetableId);
  if (!timetable || timetable.userId.toString() !== userId) return notFound();

  return NextResponse.json({
    user: { id: user._id, name: user.name, email: user.email },
    timetable,
  });
}
