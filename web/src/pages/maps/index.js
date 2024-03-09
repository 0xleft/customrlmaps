import { Inter } from "next/font/google";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const getServerSideProps = async ({ req, res }) => {
	const user = await currentUser(req, res);

	return {
		props: {},
	};
};

export default function Maps() {

	return (
		<>
			<h1>Maps</h1>
		</>
	);
}