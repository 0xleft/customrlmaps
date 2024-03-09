import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Maps() {
	// get query params
	const router = useRouter();
	const { query } = router.query;

	return (
		<>
			<h1>Maps</h1>
			<p>Query: {query}</p>
		</>
	);
}