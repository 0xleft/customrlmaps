import { NextResponse } from "next/server";
import { withAuth } from 'next-auth/middleware';

const publicPaths = ["/", "/api*", "/user/*", "/search*", "/project/*"];

function isPublic(path) {
	return publicPaths.find((x) =>
		path.match(new RegExp(`^${x}$`.replace("*$", "(.*)$")))
	);
};

export default withAuth(req => {
	if (isPublic(new URL(req.url).pathname)) {
		return NextResponse.next();
	}

	if (req.nextauth.token) {
		return NextResponse.next();
	}

	const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
	return NextResponse.redirect(signInUrl);
});

export const config = {
	matcher: ['/admin/:path*', '/new', '/user/:path*', '/projects', '/profile']
};