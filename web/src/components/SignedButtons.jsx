import { auth } from "@/auth";

export function SignedIn({ session, children }) {
    if (!session) {
        return null;
    }

    if (session.status === "authenticated") {
        return <>
            {children}
        </>
    }

    return null;
}

export function SignedOut({ session, children }) {
    if (!session) {
        return null;
    }

    if (session.status === "unauthenticated" ) {
        return <>
            {children}
        </>;
    }

    return null;
}