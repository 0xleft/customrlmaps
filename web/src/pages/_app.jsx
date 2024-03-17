import "@/styles/globals.css";
import RootLayout from "@/components/Layout";
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth";

export default function App({ Component, session, ...pageProps }) {
	return (
		<SessionProvider session={session}>
			<RootLayout>
				<Component {...pageProps} />
			</RootLayout>
		</SessionProvider>
	)
}