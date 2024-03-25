import CustomError from '@/components/CustomError';
import { useRouter } from 'next/router';

export default function AuthError() {
    // get error from query

    const router = useRouter();
    const { error } = router.query;
    
    return (
        <CustomError error="401">
            <h1 className='text-muted-foreground'>{error}</h1>
        </CustomError>
    );
}