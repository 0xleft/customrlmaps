import { NextResponse } from "next/server";
import { withAuth } from 'next-auth/middleware';

const publicPaths = ["/", "/api*", "/user/*", "/search*", "/project/*"];
 
const isPublic = (path) => {
	return publicPaths.find((x) =>
		path.match(new RegExp(`^${x}$`.replace("*$", "(.*)$")))
	);
};

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

export default withAuth({
	callbacks: {
		authorized: async ({ req }) => {
			const path = req.url;

			if (isPublic(path)) {
				return NextResponse.next();
			}

			return NextResponse.rewrite(new URL("/api/auth/signin", req.url));
		},
	}
})