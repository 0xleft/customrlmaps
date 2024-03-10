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

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=100'
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
                created: dbUser.createdAt.getDate(),
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
    console.log(user.roles)

    return (
        <>
            <div className="container p-4">
                <Card className="w-full">
                    <CardHeader className="flex flex-row space-x-4 items-center">
                        <CardTitle>
                            {user.username}
                            {user.roles.map((role) => {
                                return (
                                    <Badge key={role} className="ml-2">{role}</Badge>
                                );
                            })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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