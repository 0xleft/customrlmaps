import { ThemeProvider } from '@/components/ThemeProvider';
import NextNProgress from 'nextjs-progressbar';
import { Toaster } from 'sonner';

import Footer from './Footer';
import Navbar from './Navbar';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import ThemedProgressBar from './ThemedProgressBar';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import CookieBanner from './CookieBanner';

export default function RootLayout({ children }) {
		
	return (
		<>
			<GoogleReCaptchaProvider
				reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					disableTransitionOnChange
				>
					<Navbar />

					<main className="min-h-screen">
						<>
							<ThemedProgressBar />
							{children}
						</>
					</main>
					
					<Footer />

					<CookieBanner />
					<Toaster />
				</ThemeProvider>
			</GoogleReCaptchaProvider>
		</>
 );
};