import '@/styles/globals.css';

import RootLayout from '@/components/Layout';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps }) {
	return (
		<SessionProvider session={pageProps.session}>
			<RootLayout>
				<Component {...pageProps} />
			</RootLayout>
		</SessionProvider>
	)
}