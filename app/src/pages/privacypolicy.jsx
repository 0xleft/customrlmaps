import { useEffect, useState } from "react";
import Markdown from "react-markdown"

export default function Privacy() {

    const [markdown, setMarkdown] = useState("");

    useEffect(() => {
        fetch("/privacy.txt")
            .then((res) => res.text())
            .then((text) => {
                setMarkdown(text);
            });
    }, []);

    return (
        <>
            <div className="p-4 container">
                <Markdown className="w-full prose">
                    {markdown}
                </Markdown>
            </div>
        </>
    );
};