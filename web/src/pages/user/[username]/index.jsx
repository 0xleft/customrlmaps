import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';
import { getAuth } from "@clerk/nextjs/server";
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { ItemCard } from '@/components/ItemCard';
import DateComponent from '@/components/DateComponent';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=0'
    )

    const { username } = params;
    

    const dbUser = await prisma.user.findUnique({
        where: {
            username: username,
        }
    });

    if (!dbUser) {
        return {
            props: {
                notFound: true,
            },
        };
    }


    const topMaps = await prisma.map.findMany({
        where: {
            publishStatus: "PUBLISHED"
        },
        take: 3,
        orderBy: {
            likes: {
                _count: 'desc',
            },
        },
        include: {
            likes: true,
        },
    });
      
    const topMods = await prisma.mod.findMany({
        where: {
            publishStatus: "PUBLISHED"
        },
        take: 3,
        orderBy: {
            likes: {
                _count: 'desc',
            },
        },
        include: {
            likes: true,
        },
    });

	return {
		props: {
            user: {
                username: dbUser.username,
                imageUrl: dbUser.imageUrl,
                created: `${dbUser.createdAt.getDate()}/${dbUser.createdAt.getMonth()}/${dbUser.createdAt.getFullYear()}`,
                roles: dbUser.roles,
                isOwner: dbUser.clerkId === getAuth(req).userId,
            },
            topMaps: topMaps.map((map) => {
                return {
                    id: map.id,
                    name: map.name,
                    created: map.createdAt.getDate(),
                };
            }),
            topMods: topMods.map((mod) => {
                return {
                    id: mod.id,
                    name: mod.name,
                    description: mod.description,
                    created: mod.createdAt.getDate(),
                };
            }),

            modCount: await prisma.mod.count({
                where: {
                    userId: dbUser.id,
                }
            }),

            mapCount: await prisma.mod.count({
                where: {
                    userId: dbUser.id,
                }
            })
        },
	};
};


export default function UserPage({ user, topMaps, topMods, modCount, mapCount, notFound }) {

    if (notFound) {
        return (
            <>
                <div className="container p-4">
                    <h1>User not found</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="container p-4">
                <Card className="w-full">
                    <CardHeader className="flex flex-col">
                        <CardTitle>
                            <div className='flex flex-row items-center space-x-2'>
                                <Avatar>
                                    <AvatarImage src={user.imageUrl} alt={user.username} />
                                </Avatar>
                                <div>
                                    {user.username}
                                </div>
                                {user.roles.map((role) => {
                                    return (
                                        <Badge key={role} className="ml-2">{role}</Badge>
                                    );
                                })}
                            </div>
                        </CardTitle>

                        <DateComponent text={`Joined ${user.created}`} />

                        {/* description */}
                        <CardDescription>
                            <div className="flex items-center space-x-2">
                                {/*user.description ? <div>{user.description}</div> : <div className='text-muted-foreground'>No description</div>*/}
                            </div>
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue='maps'>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="maps">Maps</TabsTrigger>
                                <TabsTrigger value="mods">Mods</TabsTrigger>
                            </TabsList>
                            <TabsContent value="maps">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                    {topMaps.map((map) => {
                                        return (
                                            <ItemCard key={map.id} title={map.name} createdAt={map.created} link={`/map/${map.id}`} />
                                        );
                                    })}
                                </div>
                                {topMaps.length === 0 ? <div className='text-muted-foreground'>User has not published any maps</div> : ""}
                            </TabsContent>
                            <TabsContent value="mods">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                    {topMods.map((mod) => {
                                        return (
                                            <ItemCard key={mod.id} title={mod.name} description={mod.description} createdAt={mod.created} link={`/mod/${mod.id}`} />
                                        );
                                    })}
                                </div>
                                {topMods.length === 0 ? <div className='text-muted-foreground'>User has not published any mods</div> : ""}
                            </TabsContent>
                        </Tabs>
                        
                        
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button asChild>
                            {user.isOwner ? <Link href="/user">Settings</Link> : ""}
                        </Button>
                        {/*<div className='text-muted-foreground'>Published {modCount} mods and {mapCount} maps</div>*/}
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};