import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getSessionFromRequest, hashPassword, signToken, authCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newPassword } = await request.json();
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  user.passwordHash = await hashPassword(newPassword);
  user.mustChangePassword = false;
  await user.save();

  const token = await signToken({
    userId: user._id.toString(),
    role: user.role,
    mustChangePassword: false,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, authCookieOptions());
  return res;
}
