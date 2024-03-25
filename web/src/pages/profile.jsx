import { getAllUserInfoServer } from "@/utils/userUtilsServer";

export const getServerSideProps = async ({ req, res, params }) => {
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
