"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function CookieBanner() {
    const [cookieBanner, setCookieBanner] = useState("");
    
    useEffect(() => {
        setCookieBanner(localStorage.getItem("cookieConsent"));
    }, []);

    useEffect(() => {
        localStorage.setItem("cookieConsent", cookieBanner);
    }, [cookieBanner]);

    if (cookieBanner !== "") {
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
                        setCookieBanner("accepted");
                    }} className="bg-accent text-primary hover:bg-accent">Accept</Button>
                    <Button onClick={() => {
                        setCookieBanner("declined");
                    }} className="bg-accent text-primary hover:bg-accent">Decline</Button>
                </div>
            </div>
        </>
    );
};