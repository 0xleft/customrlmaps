import { NextResponse } from "next/server";
import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

const publicPaths = ["/", "/sign-in*", "/sign-up*", "/api*", "/user/*", "/search*", "/project/*"];
 
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
	ignoredRoutes: [`/((?!api|trpc|project))(_next.*|.+\\.[\\w]+$)`],
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc|project)(.*)"],
};