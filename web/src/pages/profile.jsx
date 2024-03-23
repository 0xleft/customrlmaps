import { getAllUserInfoServer } from "@/utils/userUtilsServer";

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

    const currentUser = await getAllUserInfoServer(req, res);

    if (!currentUser.session || !currentUser.dbUser) {
        return {
            notFound: true,
        };
    }

    return {
        redirect: {
            destination: `/user/${currentUser.dbUser.username}`,
            permanent: false,
        },
    }
}

export default function Profile() {
    return (
        <>
        </>
    );
}
