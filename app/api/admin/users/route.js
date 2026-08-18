import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getSessionFromRequest } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/apiHelpers";

export async function GET(request) {
  const session = await getSessionFromRequest(request);
  if (!session) return unauthorized();
  if (session.role !== "admin") return forbidden();

  await connectDB();
  const users = await User.find({}).select("name email role createdAt").sort({ createdAt: -1 });

  return NextResponse.json({ users });
}
