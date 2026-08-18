import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { hashPassword, signToken, authCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  await connectDB();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: isFirstAccount ? "admin" : "user",
  });

  const token = await signToken({
    userId: user._id.toString(),
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });

  const res = NextResponse.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set("token", token, authCookieOptions());
  return res;
}
