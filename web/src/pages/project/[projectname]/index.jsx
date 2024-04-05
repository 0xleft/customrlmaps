import { Combobox } from '@/components/Combobox';
import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import RatingButton from '@/components/RatingButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import prisma from '@/lib/prisma';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useState } from 'react';
import Markdown from 'react-markdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export const getServerSideProps = async ({ req, res, params }) => {
    const { projectname } = params;
    const currentUser = await getAllUserInfoServer(req, res);

    const project = await prisma.project.findUnique({
        where: {
            name: projectname,
        }
    });

    if (!project) {
        return {
            notFound: true,
        };
    }

    // check if project is published
    if (project.publishStatus === "DRAFT" && !isAdmin(currentUser)) {
        // check if the current user owns the project
        if (!currentUser || currentUser.dbUser?.id !== project.userId) {
            return {
                notFound: true,
            };
        }
    }

    if (project.deleted && !isAdmin(currentUser)) {
        return {
            notFound: true,
        };
    }

    await prisma.project.update({
        where: {
            id: project.id,
        },
        data: {
            views: {
                increment: 1,
            },
        }
    });

    // get versions
    const versions = await prisma.version.findMany({
        where: {
            projectId: project.id,
            deleted: false,
            checkedStatus: (isAdmin(currentUser) || currentUser.dbUser?.id === project.userId) ? undefined : "APPROVED",
        }
    });

    const creator = await prisma.user.findUnique({
        where: {
            id: project.userId,
        }
    });

	return {
		props: {
            project: {
                projectId: project.id,
                name: project.name,
                description: project.description,
                longDescription: project.longDescription,
                imageUrl: project.imageUrl,
                created: `${project.createdAt.getDate()}/${project.createdAt.getMonth()}/${project.createdAt.getFullYear()}`,
                updated: `${project.updatedAt.getDate()}/${project.updatedAt.getMonth()}/${project.updatedAt.getFullYear()}`,
                downloads: project.downloads,
                publishStatus: project.publishStatus,
                type: project.type,
                views: project.views,
                latestVersion: project.latestVersion,
                rating: project.averageRating,
            },
            creator: {
                username: creator.username
            },
            versions: versions.map(version => {
                return {
                    version: version.version,
                    changes: version.changes,
                    downloadUrl: version.downloadUrl,
                };
            }),
            canEdit: currentUser && currentUser.dbUser?.id === project.userId || isAdmin(currentUser),
        },
	};
};

export default function ProjectIndex ( { project, versions, canEdit, creator }) {
    // todo install
    const router = useRouter();
    const [selectedVersion, setSelectedVersion] = useState("");

    // maybe a better method to make the latest version the first in the list
    let versionsList = [];
    versionsList = versions.map(version => {
        if (version.version === project.latestVersion) {
            return {
                value: version.version,
                label: `${version.version} (latest)`,
            };
        }
        
        return {
            value: version.version,
            label: version.version,
        };
    }).reverse();

    return (
        <>
            <div className='container pt-6'>
                <Card className="w-full">
                    <CardHeader className="flex-col flex">
                        <CardTitle className="flex flex-row justify-between items-center mb-2">
                            <div className='w-full'>
                                <h1 className='text-4xl flex md:flex-row flex-col'>
                                    <p>
                                        {project.name}
                                    </p>
                                    <div className='flex flex-row space-x-2 md:mt-1'>
                                        <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.type}</Badge>
                                        <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.publishStatus}</Badge>
                                    </div>
                                </h1>
                            </div>

                            <div className="items-end flex-row space-x-2 sm:flex hidden">
                                <Combobox values={versionsList} title="version"
                                onSelect={(value) => {
                                    setSelectedVersion(value);
                                }}
                                />
                                <Button onClick={() => {
                                    router.push(`/project/${project.name}/version/${selectedVersion}`);
                                }} className='mt-4' disabled={!selectedVersion}>
                                    View
                                </Button>
                                {canEdit && <Button asChild>
                                    <Link href={`/project/${project.name}/edit`} className='mt-4' variant='outline'>Edit</Link>
                                </Button>}
                                <Button
                                    onClick={() => {
                                        let version = versions.find(version => version.version === project.latestVersion);

                                        if (!version) {
                                            toast.error("No latest version found");
                                            return;
                                        }
                                        fetch(version.downloadUrl).then(res => res.json()).then(data => {
                                            if (data.error) {
                                                toast.error(data.error);
                                                return;
                                            }
    
                                            open(data.downloadUrl, "_blank");
                                        });
                                    }}
                                    className='mt-4'
                                >
                                    Download
                                </Button>
                            </div>

                            <div className="flex sm:hidden">
                                <DropdownMenu className="">
                                    <DropdownMenuTrigger asChild>
                                        <Button className='mt-4'>Actions</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Download</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onSelect={() => {
                                                let version = versions.find(version => version.version === project.latestVersion);

                                                if (!version) {
                                                    toast.error("No latest version found");
                                                    return;
                                                }
                                                fetch(version.downloadUrl).then(res => res.json()).then(data => {
                                                    if (data.error) {
                                                        toast.error(data.error);
                                                        return;
                                                    }
    
                                                    open(data.downloadUrl, "_blank");
                                                });
                                            }}>
                                                Download latest
                                            </DropdownMenuItem>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    Select version
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    {versionsList.map(version => {
                                                        return (
                                                            <DropdownMenuItem key={version.value} onSelect={() => {
                                                                router.push(`/project/${project.name}/version/${version.value}`);
                                                            }}>
                                                                {version.label}
                                                            </DropdownMenuItem>
                                                        );
                                                    })}                                                   
                                                </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={() => {
                                                router.push(`/project/${project.name}/edit`);
                                            }}>
                                                Edit
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardTitle>
                        <Separator />
                        
                    </CardHeader>

                    <CardContent className="min-h-screen">

                            
                        <div className='flex md:flex-row flex-col'>
                            <div className='md:w-[55%] overflow-clip'>
                                <AspectRatio ratio={16 / 9} className="bg-muted overflow-clip">
                                    <img src={project.imageUrl} alt={`Unable to load image for ${project.name}`} className="rounded-md object-cover w-full" />
                                </AspectRatio>
                            </div>

                            <div className='md:w-[45%] md:pl-10 mt-2 flex flex-col md:space-y-2 space-y-4'>

                                <h2 className='text-xl md:text-xl font-bold'>Creator: <span className='text-muted-foreground font-normal'>
                                    <Link href={`/user/${creator.username}`} className='hover:underline'>
                                        @{creator.username}
                                    </Link></span>
                                </h2>

                                <div className='flex md:flex-row md:space-x-10 flex-col'>
                                    <div>
                                        <div className='flex flex-row items-center space-x-2'>
                                            <h2 className='md:text-xl'>Created: </h2>
                                            <DateComponent text={`${project.created}`} />
                                        </div>
                                        <div className='flex flex-row items-center space-x-2'>
                                            <h2 className='md:text-xl'>Average rating: </h2>
                                            <Badge>{project.rating === 0 ? "No rating" : project.rating.toFixed(1)}</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className='md:text-xl'>Downloads: <span className='text-muted-foreground font-normal'>{project.downloads}</span></h2>
                                        <h2 className='md:text-xl'>Views: <span className='text-muted-foreground font-normal'>{project.views}</span></h2>
                                    </div>
                                </div>

                                <div className='py-4 md:py-10 lg:py-10 space-y-2'>
                                    <h2 className='text-xl md:text-2xl font-bold'>Submit rating:</h2>
                                    <RatingButton project={project} />
                                    <p className='text-muted-foreground text-sm'>You can only submit rating once.</p>
                                </div>

                                <div>
                                    <h2 className='text-xl md:text-2xl font-bold'>Description:</h2>
                                    <p className='text-muted-foreground break-words'>
                                        {project.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='mt-4'>
                            <h2 className='text-xl md:text-2xl font-bold'>Long description:</h2>
                            <article className="prose break-words"><Markdown
                                allowedElements={["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a", "strong", "em", "code", "img", "blockquote", "hr", "br"]}
                            >{project.longDescription}</Markdown></article>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <DateComponent text={`Last updated ${project.updated}`} />
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};