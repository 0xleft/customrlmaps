import CustomError from "@/components/CustomError";
import { useRouter } from "next/router";
import { use, useEffect } from "react";

export default function VersionIndex() {
    const router = useRouter();
    const { projectname } = router.query;

    useEffect(() => {
        router.replace(`/project/${projectname}`);
    }, []);
    return (
        <CustomError error="200">
            <h1 className='text-muted-foreground'>Redirecting...</h1>
        </CustomError>
    );
}