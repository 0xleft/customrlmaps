import RecaptchaNotice from '@/components/RecapchaNotice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { RocketIcon } from '@radix-ui/react-icons';
import { getCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast } from 'sonner';

export default function Whitelist() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { executeRecaptcha } = useGoogleReCaptcha();

    return (
        <div className='flex flex-col items-center justify-center w-full min-h-screen'>
            <Card className="min-w-[300px]">
                <CardHeader className="flex-col flex items-center space-y-4">
                    <CardTitle>Whitelist pin</CardTitle>
                    <CardDescription>Enter pin to activate whitelist signin flow</CardDescription>
                </CardHeader>
                <CardContent className="max-w-[300px]">
                    <div className='flex flex-col'> 
                        <InputOTP maxLength={6} disabled={loading} onComplete={(value) => {
                            if (!executeRecaptcha) return;
                            setLoading(true);
                            executeRecaptcha("whitelist").then(async (token) => {
                                fetch("/api/whitelist", {
                                    method: "POST",
                                    body: JSON.stringify({
                                        gRecaptchatoken: token,
                                        otp: value,
                                    }),
                                }).then(async (res) => res.json()).then((data) => {
                                    if (data.error) {
                                        toast.error(data.error);
                                        setLoading(false);
                                        return;
                                    }

                                    setCookie("whitelist", value, {
                                        maxAge: 60 * 60 * 24 * 30,
                                    });

                                    router.push("/auth/signin");
                                
                                }).catch((error) => {
                                    toast.error("An error occurred");
                                    setLoading(false);
                                }).finally(() => {
                                    setLoading(false);
                                });
                            }).catch((error) => {
                                toast.error("An error occurred");
                                setLoading(false);
                            });
                        }}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <RecaptchaNotice className="text-center mt-2" />
                </CardContent>
            </Card>
        </div>
    )
}