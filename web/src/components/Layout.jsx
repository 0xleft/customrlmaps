import { ThemeProvider } from '@/components/ThemeProvider';
import NextNProgress from 'nextjs-progressbar';
import { Toaster } from 'sonner';

import Footer from './Footer';
import Navbar from './Navbar';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import ThemedProgressBar from './ThemedProgressBar';

export default function RootLayout({ children }) {
		
	return (
		<>
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
				<Toaster />
			</ThemeProvider>
		</>
 );
};