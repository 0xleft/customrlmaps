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
    "/sign-in",
    "/sign-up",
	"/search",
	"/search/maps",
	"/search/mods",
	"/user/[[username]]",
	"/user/[[username]]/mods",
	"/user/[[username]]/mods/[id]",
	"/user/[[username]]/maps",
	"/user/[[username]]/maps/[id]",
],
  
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};