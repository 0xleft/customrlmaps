import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUserInfo } from '@/utils/apiUtils';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Markdown from 'react-markdown';

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

    console.log(params);

    const { username, projectname } = params;
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

    console.log(projectname)

    const project = await prisma.project.findUnique({
        where: {
            name: projectname,
        }
    });

    console.log(project);

    if (!project || project.publishStatus !== "PUBLISHED" && (!currentUser || currentUser.dbUser.id !== dbUser.id)) {
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
            },
        },
	};
};


export default function MapsPage ( { project, notFound }) {
    const router = useRouter();
    const { username, projectname } = router.query;

    if (notFound) {
        return (
            <CustomError error="404">
                <h1 className='text-muted-foreground'>Map not found</h1>
            </CustomError>
        );
    }

    return (
        <>
            <div className='container pt-6'>
                <Card className="w-full p-4">
                    <CardHeader className="flex-col flex">
                            <CardTitle className="flex flex-row justify-between">
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

                                    <div className='flex flex-row justify-between'>
                                        <p className='text-muted-foreground md:text-xl text-sm'>
                                            by <span className=''>{username}</span>
                                        </p>
                                    </div>                                    
                                </div>

                                <div className="items-end">
                                    <Button onClick={() => {
                                        // todo
                                    }} className='mt-4'>
                                        Install
                                    </Button>
                                </div>
                                
                            </CardTitle>


                            <CardDescription >
                            </CardDescription>

                        </CardHeader>

                        <CardContent className="min-h-screen">
                            <div className='flex md:flex-row flex-col'>
                                <div className='md:w-[55%]'>
                                    <AspectRatio ratio={16 / 9} className="bg-muted overflow-clip">
                                        <img src={project.imageUrl} alt={`Banner for project: ${project.name}`} className="rounded-lg object-cover w-full" />
                                    </AspectRatio>
                                </div>

                                <div className='md:w-[45%] md:pl-10 mt-2'>
                                    <div>
                                        <h2 className='text-2xl font-bold'>Description:</h2>
                                    </div>

                                    <CardDescription>
                                        {project.description}
                                    </CardDescription>
                                </div>
                            </div>
                            

                            <div className='mt-4'>
                                <CardContent className="mt-4">
                                    <article class="prose"><Markdown
                                        allowedElements={["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a", "strong", "em", "code", "img", "blockquote", "hr", "br"]}
                                    >{project.longDescription}</Markdown></article>
                                </CardContent>
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