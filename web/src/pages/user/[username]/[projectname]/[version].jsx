import { useRouter } from 'next/router';

export const getServerSideProps = async ({ req, res }) => {


	return {
		props: {},
	};
};


export default function MapsPage () {
    const router = useRouter();
    const { mapname, version } = router.query;

    return (
        <div>
            <h1>Maps name: {mapname} version {version}</h1>
        </div>
    );
};