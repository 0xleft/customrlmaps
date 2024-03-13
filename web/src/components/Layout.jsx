import { Router, useRouter } from "next/router";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { ThemeProvider } from "@/components/ThemeProvider"
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress"

function progressBar() {

}

const RootLayout = ({ children }) => {

	let router = useRouter();
	const [progress, setProgress] = useState(100);

	let progressInterval;

	useEffect(() => {
		const start = (url) => {
			if (url !== router.pathname) {
				setProgress(0);
			}

			progressInterval = setInterval(() => {
				setProgress((oldProgress) => {
					if (oldProgress >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return oldProgress + 10;
				});
			}, 100);
		};
		const end = () => {
			clearInterval(progressInterval);
			setProgress(100);
		};

		Router.events.on('routeChangeStart', start);
		Router.events.on('routeChangeComplete', end);
		Router.events.on('routeChangeError', end);
	
		return () => {
			Router.events.off('routeChangeStart', start);
			Router.events.off('routeChangeComplete', end);
			Router.events.off('routeChangeError', end);
		};
	}, []);


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
						{(progress < 100) ? <>
							<div className="fixed top-0 z-50 w-full">
								<Progress value={progress} className="h-1 rounded-none" />
							</div>
						</> : null}
						{children}
					</>
				</main>
				
				<Footer />
			</ThemeProvider>
		</>
 );
};

export default RootLayout;