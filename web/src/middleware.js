import { NextResponse } from "next/server";
import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { getUserRoles, hasRole } from "./utils/userUtils";
 
export default authMiddleware({
  afterAuth(auth, req, evt) {
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    
    return NextResponse.next();
  },
  publicRoutes: [
    "/",
    "/maps",
    "/search",
    "/mods",
    "/sign-in",
    "/sign-up",
  ]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};