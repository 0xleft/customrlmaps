import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function CookieBanner() {
    const [cookieBanner, setCookieBanner] = useState(false);
    
    useEffect(() => {
        if (localStorage.getItem("cookieConsent") !== "true") {
            setCookieBanner(true);
        }
    }, []);

    if (!cookieBanner) {
        return null;
    }

	return (
        <>
            <div className="fixed bottom-0 w-full bg-accent-foreground p-4">
                <div className="flex flex-row space-x-2 justify-center items-center">
                    <p className="text-center text-primary-foreground">We use cookies to ensure the best experience on our website. By continuing to use the website, we assume that you're okay with this. To find out more please click <a
                        href="/privacypolicy"
                        className='underline'
                    >here</a>.</p>
                    <Button onClick={() => {
                        localStorage.setItem("cookieConsent", "true");
                        setCookieBanner(false);
                    }} className="bg-accent text-primary hover:bg-accent">Accept</Button>
                </div>
            </div>
        </>
    );
};