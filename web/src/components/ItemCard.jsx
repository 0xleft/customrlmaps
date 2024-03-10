import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import DateComponent from "./DateComponent"
import { useRouter } from "next/router"

export function ItemCard( { title, description, image, id, createdAt, link } ) {

    const router = useRouter();

    if (!title) {
        title = "Title"
    }

    if (!description) {
        description = "grujeagregnaoiengoierang orngoanerg oineragi oingernaoi geroi ngaoier nger ngerng erin goierang oieran oigneraoig noag nerog ner"
    }

    if (description.length > 100) {
        description = description.slice(0, 100) + "..."
    }

    if (!image) {
        image = "/rocketleague.jpg"
    }

    return (
        <Card className="relative overflow-hidden">
            {/* on hover make it expand */}
            <img src={image} alt={title} className="absolute top-0 left-0 w-[33%] h-full object-cover rounded-s-md hover:cursor-pointer hover:w-[66%] transition-all"
            onClick={() => router.push(link || "/")} />
            <div className="ml-[33%]">
                <CardHeader>
                    <CardTitle>
                        <Link href={link || "/"} className="hover:underline">
                            {title}
                        </Link>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    
                </CardContent>
                <CardFooter className="flex justify-between">
                    <DateComponent text={createdAt || "never"} />
                </CardFooter>
            </div>
        </Card>
    )
}