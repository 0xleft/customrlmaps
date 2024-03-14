import { Combobox } from '@/components/Combobox';
import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUserInfo } from '@/utils/apiUtils';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Markdown from 'react-markdown';

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

    const { projectname } = params;
    const currentUser = await getAllUserInfo(req);

    const project = await prisma.project.findUnique({
        where: {
            name: projectname,
        }
    });

    if (!project || project.publishStatus !== "PUBLISHED" && (!currentUser || currentUser.dbUser?.id !== project.userId)) {
        return {
            props: {
                notFound: true,
            },
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
        }
    });

	return {
		props: {
            project: {
                name: project.name,
                description: project.description,
                longDescription: project.longDescription,
                imageUrl: project.imageUrl,
                created: `${project.createdAt.getDate()}/${project.createdAt.getMonth()}/${project.createdAt.getFullYear()}`,
                updated: `${project.updatedAt.getDate()}/${project.updatedAt.getMonth()}/${project.updatedAt.getFullYear()}`,
                downloads: project.downloads,
                tags: project.tags,
                publishStatus: project.publishStatus,
                type: project.type,
                views: project.views,
            },
            versions: versions.map(version => {
                return {
                    version: version.version,
                    changes: version.changes,
                    downloadUrl: version.downloadUrl,
                };
            }),
            canEdit: currentUser && currentUser.dbUser?.id === project.userId,
        },
	};
};


export default function MapsPage ( { project, notFound, versions, canEdit }) {
    if (notFound) {
        return (
            <CustomError error="404">
                <h1 className='text-muted-foreground'>Map not found</h1>
            </CustomError>
        );
    }

    const router = useRouter();
    const [selectedVersion, setSelectedVersion] = useState("");

    // maybe a better method to make the latest version the first in the list
    let versionsList = [];
    versionsList = versionsList.concat([{
        value: "latest",
        label: "Latest",
    }]);
    versionsList = versionsList.concat(versions.map(version => {
        return {
            value: version.version,
            label: version.version,
        };
    }));

    return (
        <>
            <div className='container pt-6'>
                <Card className="w-full p-4">
                    <CardHeader className="flex-col flex">
                        <CardTitle className="flex md:flex-row justify-between flex-col">
                            <div className='w-full'>
                                <h1 className='text-4xl font-bold underline flex md:flex-row flex-col'>
                                    <p>
                                        {project.name}
                                    </p>
                                    <div className='flex flex-row space-x-2 md:mt-1'>
                                        <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.type}</Badge>
                                        <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.publishStatus}</Badge>
                                    </div>
                                </h1>
                            </div>

                            <div className="items-end flex flex-row space-x-2">
                                <Combobox values={versionsList} title="version"
                                onSelect={(value) => {
                                    setSelectedVersion(value);
                                }}
                                />
                                <Button onClick={() => {
                                    // todo
                                }} className='mt-4' disabled={!selectedVersion}>
                                    Install
                                </Button>
                                {canEdit && <Button asChild>
                                    <Link href={`/projects/${project.name}/edit`} className='mt-4' variant='outline'>Edit</Link>
                                </Button>}
                            </div>
                            
                        </CardTitle>


                        <CardDescription >
                        </CardDescription>

                    </CardHeader>

                    <CardContent className="min-h-screen">
                        <div className='flex md:flex-row flex-col'>
                            <div className='md:w-[55%]'>
                                <AspectRatio ratio={16 / 9} className="bg-muted overflow-clip">
                                    <img src={project.imageUrl} alt={`Unable to load image for ${project.name}`} className="rounded-lg object-cover w-full" />
                                </AspectRatio>
                            </div>

                            <div className='md:w-[45%] md:pl-10 mt-2 flex flex-col md:space-y-2 space-y-4'>
                                <h2 className='text-xl md:text-2xl font-bold'>Info:</h2>
                                <div className='flex md:flex-row md:space-x-10 flex-col'>
                                    <div>
                                        <div className='flex flex-row items-center space-x-2'>
                                            <h2 className='md:text-xl'>Created: </h2>
                                            <DateComponent text={`${project.created}`} />
                                        </div>
                                        <div className='flex flex-row items-center space-x-2'>
                                            <h2 className='md:text-xl'>Last update: </h2>
                                            <DateComponent text={`${project.updated}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className='md:text-xl'>Downloads: <span className='text-muted-foreground font-normal'>{project.downloads}</span></h2>
                                        <h2 className='md:text-xl'>Views: <span className='text-muted-foreground font-normal'>{project.views}</span></h2>
                                    </div>
                                </div>

                                <div>
                                    <h2 className='text-xl md:text-2xl font-bold'>Description:</h2>
                                    <Card className='mt-4'>
                                        <CardContent className="mt-4">
                                            {project.description}
                                        </CardContent>
                                    </Card>
                                </div>
                                
                            </div>
                        </div>
                        

                        <div className='mt-4'>
                            <h2 className='text-xl md:text-2xl font-bold'>Long description:</h2>
                            <Card className='mt-4'>
                                <CardContent className="mt-4">
                                    <article class="prose"><Markdown
                                        allowedElements={["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a", "strong", "em", "code", "img", "blockquote", "hr", "br"]}
                                    >{project.longDescription}</Markdown></article>
                                </CardContent>
                            </Card>
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