import { Router, useRouter } from "next/router";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { ThemeProvider } from "@/components/ThemeProvider"
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress"
import { Toaster } from "sonner";
import NextNProgress from 'nextjs-progressbar';

const RootLayout = ({ children }) => {
	return (
		<>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				enableSystem
				disableTransitionOnChange
          	>
				<Navbar />

				<main className="min-h-screen">
					<>
						<NextNProgress color="#000" startPosition={0.3} stopDelayMs={200} height={3} showOnShallow={true} options={
							{ showSpinner: false }
						} />
						{children}
					</>
				</main>
				
				<Footer />
				<Toaster />
			</ThemeProvider>
		</>
 );
};

export default RootLayout;