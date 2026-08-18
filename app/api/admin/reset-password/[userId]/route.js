import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getSessionFromRequest, hashPassword, generateTempPassword } from "@/lib/auth";
import { unauthorized, forbidden, notFound } from "@/lib/apiHelpers";

export async function POST(request, { params }) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();
  if (session.role !== "admin") return forbidden();

  const { userId } = params;
  if (!mongoose.isValidObjectId(userId)) return notFound();

  await connectDB();
  const user = await User.findById(userId);
  if (!user) return notFound();

  const tempPassword = generateTempPassword();
  user.passwordHash = await hashPassword(tempPassword);
  user.mustChangePassword = true;
  await user.save();

  return NextResponse.json({ tempPassword });
}
