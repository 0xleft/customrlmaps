import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const getServerSideProps = async ({ req, res }) => {


	return {
		props: {},
	};
};

export default function Mods() {

	return (
		<>
			<h1>Mods</h1>
		</>
	);
}