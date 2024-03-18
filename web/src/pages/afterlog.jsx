import prisma from "@/lib/prisma";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAllUserInfoServer } from "@/utils/userUtilsServer";
import { getServerSession } from "next-auth";
import CustomError from "@/components/CustomError";

export const getServerSideProps = async ({ req, res }) => {
    const user = await getAllUserInfoServer(req, res);

    if (!user.session) {
        return {
            props: {
                message: "Session not found",
            },
        };
    }

    if (user.dbUser || user.dbUser?.deleted) {
        return {
            props: {
                message: "Success",
            },
        };
    }

    await prisma.user.create({
        data: {
            username: user.session.user.name.replace(/\s/g, ''),
            fullname: user.session.user.name,
            description: "",
            email: user.session.user.email,
            imageUrl: user.session.user.image,
        },
    });

    return {
        props: {
            message: "Success",
        },
    };
}

export default function AfterLog({ message }) {
    const router = useRouter();

    useEffect(() => {
        if (message === "Success") {
            router.push('/user');
        }
    }, []);

    return (
        <>
            <CustomError error={message === "Success" ? "200" : "500"}>
                <h2 className='text-muted-foreground'>{message}</h2>
            </CustomError>
        </>
    );
}