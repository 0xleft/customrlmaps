import { ThemeProvider } from '@/components/ThemeProvider';
import NextNProgress from 'nextjs-progressbar';
import { Toaster } from 'sonner';

import Footer from './Footer';
import Navbar from './Navbar';

export default function RootLayout({ children, providers }) {
	return (
		<>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				enableSystem
				disableTransitionOnChange
          	>
				<Navbar providers={providers} />

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