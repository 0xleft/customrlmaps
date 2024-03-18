import '@/styles/globals.css';

import RootLayout from '@/components/Layout';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, session, ...pageProps }) {
	return (
		<SessionProvider session={session}>
			<RootLayout>
				<Component {...pageProps} />
			</RootLayout>
		</SessionProvider>
	)
}