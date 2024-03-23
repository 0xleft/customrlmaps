import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import Link from "next/link";

const Hero = () => {
    return (
        <>
            <div className="container">
                <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 pt-32 pb-24 md:py-24 lg:py-24 lg:pb-20">
                    <h1 className="text-center lg:text-6xl md:text-5xl text-3xl font-bold">CustomRLMaps</h1>
                    <p className="text-center lg:text-2xl md:text-xl text-sm text-muted-foreground break-words md:max-w-[400px] max-w-[300px]">Platform for Rocket League projects. Best when paired with CustomRLMaps bakkes mod plugin.</p>

                    <div className="flex flex-row md:flex-row gap-4">
                        <Button className="mt-4 h-9 block md:hidden lg:hidden" asChild>
                            <Link href="/explore">Explore</Link>
                        </Button>
                        <Button className="mt-4 h-9 space-x-2 hidden md:block lg:block" asChild>
                            <Link href="/explore">Explore public projects</Link>
                        </Button>
                        <Button className="mt-4 h-9 space-x-2" variant="outline" asChild>
                            <a href="https://github.com/pageuplt" target="_blank" rel="noreferrer"
                            ><GitHubLogoIcon className="mr-2" /> GitHub</a>
                        </Button>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Hero;