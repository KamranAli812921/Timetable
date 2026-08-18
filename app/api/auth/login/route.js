import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { comparePassword, signToken, authCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signToken({
    userId: user._id.toString(),
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });

  const res = NextResponse.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword },
  });
  res.cookies.set("token", token, authCookieOptions());
  return res;
}
