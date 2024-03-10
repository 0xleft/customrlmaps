import { useRouter } from 'next/router';

export const getServerSideProps = async ({ req, res }) => {


	return {
		props: {},
	};
};


export default function ModPage() {
    const router = useRouter();
    const { modname } = router.query;

    return (
		<div>
			<h1>Mod name: {modname}</h1>
		</div>
    );
};