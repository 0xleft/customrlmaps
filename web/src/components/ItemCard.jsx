import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockClosedIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import DateComponent from './DateComponent';
import { Badge } from './ui/badge';

export function ItemCard({title, description, image, createdAt, link, isPrivate, type}) {

    const router = useRouter();

    if (!description) {
        description = "No description provided."
    }

    if (description.length > 100) {
        description = description.slice(0, 100) + "..."
    }

    if (!image) {
        image = "/rocketleague.jpg"
    }

    return (
        <Card className="relative overflow-hidden">
            <img src={image} alt={title} className="absolute top-0 left-0 w-[33%] h-full object-cover rounded-s-md hover:scale-105 hover:cursor-pointer transition-all"
            onClick={() => router.push(link || "/")} />
            <div className="ml-[33%]">
                <CardHeader>
                    <CardTitle>
                        <Link href={link || "/"} className="hover:underline flex flex-row space-x-4">
                            {title}
                            {isPrivate && <LockClosedIcon className="w-6 h-6" />}
                        </Link>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <DateComponent text={createdAt || "unknown"} />
                    <Badge className="">{type}</Badge>
                </CardFooter>
            </div>
        </Card>
    )
}