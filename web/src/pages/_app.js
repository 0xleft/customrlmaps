import "@/styles/globals.css";
import { ClerkProvider, currentUser, useAuth } from "@clerk/nextjs";
import RootLayout from "@/components/Layout";

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps}>
        <RootLayout>
            <Component {...pageProps} />
        </RootLayout>
    </ClerkProvider>
  )
}