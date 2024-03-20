export const getServerSideProps = async ({ req, res, params }) => {

	const { query, page, order, tags, username } = new URL(req.url, "https://localhost").searchParams;
	
	

	return {
		props: {},
	};
};

export default function Search() {

	return (
		<>
		</>
	);
}