import { useRouter } from 'next/router';

export const getServerSideProps = async ({ req, res }) => {


	return {
		props: {},
	};
};


export default function MapsPage () {
    const router = useRouter();
    const { id } = router.query;

    return (
        <div>
            <h1>Maps ID: {id}</h1>
        </div>
    );
};