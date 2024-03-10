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

    const topMaps = await prisma.map.findMany({
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


export default function UserPage({ user, topMaps, topMods, modCount, mapCount }) {
    return (
        <>
            <div className="container p-4">
                <Card className="w-full">
                    <CardHeader className="flex flex-col">
                        <CardTitle>
                            {user.username}
                            {user.roles.map((role) => {
                                return (
                                    <Badge key={role} className="ml-2">{role}</Badge>
                                );
                            })}
                        </CardTitle>

                        <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                            <span className="text-xs text-muted-foreground">
                                Joined {user.created}
                            </span>
                        </div>         
                    </CardHeader>
                    <CardContent>
                        <div>
                        </div>
                        <div>
                        </div>
                        <div>

                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between">
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};