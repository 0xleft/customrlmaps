import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const getServerSideProps = async ({ req, res }) => {


	return {
		props: {},
	};
};

export default function Search() {

	return (
		<>
			<h1>Search</h1>
		</>
	);
}