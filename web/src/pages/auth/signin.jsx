import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, getProviders } from 'next-auth/react'

export async function getServerSideProps() {
    const providers = await getProviders();

    return {
        props: {
            providers,
        },
    }
}

export default function Signin({ providers }) {
    return (
        <div className='flex flex-col items-center justify-center w-full min-h-screen'>
            <Card className="min-w-[300px]">
                <CardHeader className="flex-col flex items-center space-y-4">
                    <CardTitle>Sign in </CardTitle>
                    <CardDescription>Sign in or register to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col space-y-2'>
                        {Object.values(providers).map((provider) => (
                            <div key={provider.name}>
                                <Button className="w-full"
                                onClick={() => signIn(provider.id, {
                                    callbackUrl: "/",
                                })}>Sign in with {provider.name}</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}