import RecaptchaNotice from '@/components/RecapchaNotice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from 'next-auth/react'
import { useState } from 'react';

export default function Signin() {

    const [loading, setLoading] = useState(false);

    return (
        <>
            <div className='flex flex-col items-center justify-center w-full min-h-screen'>
            <Card className="min-w-[300px]">
                <CardHeader className="flex-col flex items-center space-y-4">
                    <CardTitle>Sign out</CardTitle>
                    <CardDescription>Are you sure you want to sign out?</CardDescription>
                </CardHeader>
                <CardContent className="max-w-[300px]">
                    <div className='flex flex-col space-y-2'>
                            <Button className="w-full" disabled={loading}
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    await signOut({ callbackUrl: `/`, redirect: true })
                                    setLoading(false);
                                } catch (error) {
                                    console.error(error);
                                    setLoading(false);
                                    toast.error("An error occurred");
                                }
                                
                            }}>Sign out</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        </>
    )
}