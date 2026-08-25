import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtectedAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedAdminRoute && req.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
