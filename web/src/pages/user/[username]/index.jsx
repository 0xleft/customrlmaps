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
import { getAllUserInfo } from '@/utils/apiUtils';
import CustomError from '@/components/CustomError';

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

    const { username } = params;
    const currentUser = await getAllUserInfo(req);

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


    let mapsQuery = {
        where: {
            type: "MAP",
            publishStatus: {
                not: "DELETED"
            }
        },
        take: 6,
        orderBy: {
            likes: {
                _count: 'desc',
            },
        },
        include: {
            likes: true,
        },
    };

    if (!currentUser || currentUser?.dbUser.id !== dbUser.id) {
        mapsQuery.where.publishStatus = "PUBLISHED";
    }

    const topMaps = await prisma.project.findMany(
        mapsQuery
    );

    let modsQuery = {...mapsQuery, where: { type: "MOD" }};
      
    const topMods = await prisma.project.findMany(
        modsQuery
    );

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
                    description: map.description,
                    imageUrl: map.imageUrl,
                    created: `${map.createdAt.getDate()}/${map.createdAt.getMonth()}/${map.createdAt.getFullYear()}`,
                    status: map.publishStatus,
                    type: map.type
                };
            }),
            topMods: topMods.map((mod) => {
                return {
                    id: mod.id,
                    name: mod.name,
                    description: mod.description,
                    imageUrl: mod.imageUrl,
                    created: `${mod.createdAt.getDate()}/${mod.createdAt.getMonth()}/${mod.createdAt.getFullYear()}`,
                    status: mod.publishStatus,
                    type: mod.type
                };
            }),

            modCount: await prisma.project.count({
                where: {
                    userId: dbUser.id,
                    type: "MOD",
                    publishStatus: "PUBLISHED",
                }
            }),

            mapCount: await prisma.project.count({
                where: {
                    userId: dbUser.id,
                    type: "MAP",
                    publishStatus: "PUBLISHED",
                }
            })
        },
	};
};

export default function UserPage({ user, topMaps, topMods, modCount, mapCount, notFound }) {

    if (notFound) {
        return (
            <CustomError error="404">
                <h1 className='text-muted-foreground'>User not found</h1>
            </CustomError>
        );
    }

    return (
        <>
            <div className='flex flex-row justify-center p-4 min-h-screen'>
                <div className='hidden lg:flex lg:w-[20%] p-2'>
                    <Card className="w-full">
                        <CardHeader className="flex-col hidden lg:flex">
                                <CardTitle>
                                    <div className='flex flex-col space-y-2'>
                                        <img src={user.imageUrl} alt={user.username} className='w-full max-w-[350px] rounded-full self-center' />
                                        <p className='text-xl font-bold'>
                                            {user.username}
                                        </p>
                                    </div>
                                    <div className='flex flex-row items-center space-x-2'>
                                        {user.roles.map((role) => {
                                            return (
                                                <Badge key={role} className="">{role}</Badge>
                                            );
                                        })}
                                    </div>
                                </CardTitle>


                                <CardDescription className={user.description ? "" : "text-muted-foreground"}>
                                    {user.description ? user.description : "No description"}
                                </CardDescription>

                                <DateComponent text={`Joined ${user.created}`} />
                            </CardHeader>
                    </Card>
                </div>

                <div className="w-full p-2 lg:w-[66%] min-h-screen">
                    <Card className="w-full h-full">
                        <CardHeader className="flex-col flex lg:hidden">
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

                                <CardDescription className={user.description ? "" : "text-muted-foreground"}>
                                    {user.description ? user.description : "No description"}
                                </CardDescription>
                        </CardHeader>

                        <CardContent className="mt-0 lg:mt-4 min-h-screen">
                            <Tabs defaultValue='maps'>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="maps">Top Maps</TabsTrigger>
                                    <TabsTrigger value="mods">Top Mods</TabsTrigger>
                                </TabsList>
                                <TabsContent value="maps">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                        {topMaps.map((map) => {
                                            {/* // todo fix the link */}
                                            return (
                                                <ItemCard key={map.id} title={map.name} createdAt={map.created} link={`/project/${map.name}`} description={map.description} image={map.imageUrl} isPrivate={map.status === "DRAFT"} type={map.type} />
                                            );
                                        })}
                                    </div>
                                    {topMaps.length === 0 ? <div className='text-muted-foreground'>User has not published any maps</div> : ""}
                                </TabsContent>
                                <TabsContent value="mods">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                        {topMods.map((mod) => {
                                            {/* // todo fix the link */}
                                            return (
                                                <ItemCard key={mod.id} title={mod.name} description={mod.description} createdAt={mod.created} link={`/project/${mod.name}`} image={mod.imageUrl} isPrivate={mod.status === "DRAFT"} type={mod.type} />
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
                            {<div className='text-muted-foreground'>Published {modCount} mods and {mapCount} maps</div>}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
};