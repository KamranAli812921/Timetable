import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();

async function verifyToken(token) {
  try {
    const secret = encoder.encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const session = token ? await verifyToken(token) : null;

  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isChangePasswordRoute = pathname === "/change-password";

  if ((isAdminRoute || isDashboardRoute || isChangePasswordRoute) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute && session.mustChangePassword) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/change-password"],
};
