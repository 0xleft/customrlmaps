import { NextResponse } from "next/server";
import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { getUserRoles, hasRole } from "./utils/userUtils";

const publicPaths = ["/", "/sign-in*", "/sign-up*", "/api*", "/user/*", "/search*", "/projects/*"];
 
const isPublic = (path) => {
	return publicPaths.find((x) =>
		path.match(new RegExp(`^${x}$`.replace("*$", "(.*)$")))
	);
};

export default authMiddleware({
  	afterAuth(auth, req, evt) {
		if (!auth.userId && !isPublic(req.nextUrl.pathname)) {
			return redirectToSignIn({ returnBackUrl: req.url });
		}
		
		return NextResponse.next();
  	},
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};