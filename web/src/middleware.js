import { NextResponse } from "next/server";
import { withAuth } from 'next-auth/middleware';

const publicPaths = ["/", "/api*", "/user/*", "/search*", "/project/*"];
 
const isPublic = (path) => {
	return publicPaths.find((x) =>
		path.match(new RegExp(`^${x}$`.replace("*$", "(.*)$")))
	);
};

export default withAuth({
	callbacks: {
		authorized({ req, token }) {
			const path = new URL(req.url).pathname;

			if (isPublic(path) || token) {
				return NextResponse.next();
			}

			return NextResponse.redirect(new URL("/api/auth/signin", req.url));
		},
	},
})

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}