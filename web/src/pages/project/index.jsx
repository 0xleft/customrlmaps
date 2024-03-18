import CustomError from '@/components/CustomError';
import { useRouter } from 'next/router';

export default function VersionIndex() {
    const router = useRouter();
    router.replace(`/`);
    return (
        <CustomError error="200">
            <h1 className='text-muted-foreground'>Redirecting...</h1>
        </CustomError>
    );
}