import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/router';

import DateComponent from './DateComponent';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export default function UserLeftCom({ user }) {
    const router = useRouter();

    return (
        <Card className="w-full">
            <CardHeader className="flex-col hidden lg:flex">
                <CardTitle>
                    <div className='flex flex-col space-y-2'>
                        <img src={user.imageUrl} alt={user.username} className='w-full max-w-[350px] rounded-full self-center aspect-square' />
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

            <CardContent className="flex flex-col space-y-4">
                <Button asChild variant="secondary">
                    {router.asPath == `/user/${user.username}` ? <Link href={`/user/${user.username}/projects`}>Projects</Link> : <Link href={`/user/${user.username}`}>Profile</Link>}
                </Button>
                <Button asChild variant="secondary">
                    {user.isOwner ? <Link href="/user">Settings</Link> : ""}
                </Button>
            </CardContent>
        </Card>
    );
}