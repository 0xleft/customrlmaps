import Footer from "./Footer";
import Navbar from "./Navbar";

const RootLayout = ({ children }) => {
	return (
		<>
			<Navbar />
			<main className="min-h-screen">
				{children}
			</main>
			<Footer />
		</>
 );
};

export default RootLayout;