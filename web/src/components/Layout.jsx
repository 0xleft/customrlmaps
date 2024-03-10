import Footer from "./Footer";
import Navbar from "./Navbar";
import { ThemeProvider } from "@/components/ThemeProvider"

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
					{children}
				</main>
				<Footer />
			</ThemeProvider>
		</>
 );
};

export default RootLayout;