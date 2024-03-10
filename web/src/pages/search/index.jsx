import { Inter } from "next/font/google";
import prisma from "@/lib/prisma";
import { useUser } from "@clerk/clerk-react";

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