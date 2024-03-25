import '@/styles/globals.css';

import RootLayout from '@/components/Layout';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
	return (
		<SessionProvider session={pageProps.session}>
			<RootLayout>
				<Head>
					<title>CustomRLMaps</title>
				</Head>
				<Component {...pageProps} />
			</RootLayout>
		</SessionProvider>
	)
}