import CustomError from '@/components/CustomError';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AuthIndex() {
    const router = useRouter();

    useEffect(() => {
        router.replace(`/`);
    }, []);
    
    return (
        <CustomError error="200">
            <h1 className='text-muted-foreground'>Redirecting...</h1>
        </CustomError>
    );
}