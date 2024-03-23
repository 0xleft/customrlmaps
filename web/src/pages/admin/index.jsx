import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllUserInfoServer, isAdmin } from "@/utils/userUtilsServer";

export const getServerSideProps = async ({ req, res }) => {
	const user = await getAllUserInfoServer(req, res);

	if (!user.session || !user.dbUser) {
		return {
			notFound: true,
		};
	}

	if (!isAdmin(user)) {
		return {
			notFound: true,
		};
	}



	return {
		props: {},
	};
}

export default function Admin() {
	return (
		<>
			<div className="container p-4">
				<Card className="w-full">

					<CardHeader className="flex flex-col">
                        <CardTitle>
							Admin console
                        </CardTitle>
                    </CardHeader>

					<CardContent>
						
					</CardContent>
				</Card>
			</div>
		</>
	);
}