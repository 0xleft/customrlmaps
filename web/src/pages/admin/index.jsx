import { getAllUserInfoServer, isAdmin } from "@/utils/userUtilsServer";

export const getServerSideProps = async ({ req, res }) => {
	const user = await getAllUserInfoServer(req, res);

	if (!user.session || !user.dbUser) {
		return {
			notFound: true,
		};
	}

	if (isAdmin(user)) {
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
			<h1>Admin</h1>
		</>
	);
}