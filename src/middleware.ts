import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthEnabled } from "@/lib/auth-config";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/deploy-debug",
]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export default function middleware(request: NextRequest, event: Parameters<typeof clerk>[1]) {
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }
  return clerk(request, event);
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
