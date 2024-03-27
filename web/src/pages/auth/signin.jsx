import RecaptchaNotice from '@/components/RecapchaNotice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { signIn, getProviders } from 'next-auth/react'
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { toast } from 'sonner';

export async function getServerSideProps() {
    const providers = await getProviders();

    return {
        props: {
            providers,
        },
    }
}

export default function Signin({ providers }) {
    const [loading, setLoading] = useState(false);

    return (
        <div className='flex flex-col items-center justify-center w-full min-h-screen'>
            <Card className="min-w-[300px]">
                <CardHeader className="flex-col flex items-center space-y-4">
                    <CardTitle>Sign in </CardTitle>
                    <CardDescription>Sign in or register to your account</CardDescription>
                </CardHeader>
                <CardContent className="max-w-[300px]">
                    <div className='flex flex-col space-y-2'>
                        {Object.values(providers).map((provider) => { 
                            if (provider.name === "Credentials") return null;
                            return (
                                <div key={provider.name}>
                                    <Button className="w-full" disabled={loading}
                                    onClick={async () => {
                                        try {
                                            setLoading(true);

                                            let res = await signIn(provider.id, {
                                                redirect: false,
                                                callbackUrl: "/",
                                            })
                                            if (res?.error) {
                                                toast.error(res.error);
                                            }
                                            setLoading(false);
                                        } catch (error) {
                                            console.error(error);
                                            setLoading(false);
                                            toast.error("An error occurred");
                                        }
                                        
                                        }}>Sign in with {provider.name}</Button>
                                </div>
                            )
                        })}
                    </div>

                    <RecaptchaNotice className="text-center mt-2" />
                </CardContent>
            </Card>
        </div>
    )
}