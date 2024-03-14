import "@/styles/globals.css";
import { ClerkProvider, currentUser, useAuth } from "@clerk/nextjs";
import RootLayout from "@/components/Layout";
import { StrictMode } from "react";

export default function App({ Component, pageProps }) {
  return (
	<StrictMode>
		<ClerkProvider {...pageProps}>
			<RootLayout>
				<Component {...pageProps} />
			</RootLayout>
		</ClerkProvider>
	</StrictMode>
    
  )
}