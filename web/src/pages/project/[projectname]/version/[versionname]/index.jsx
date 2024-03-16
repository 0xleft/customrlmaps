import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import { getAllUserInfo } from '@/utils/apiUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

    const { projectname, versionname } = params;
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

    if (project.publishStatus === "DELETED") {
        return {
            props: {
                notFound: true,
            },
        };
    }

    const version = await prisma.version.findFirst({
        where: {
            projectId: project.id,
            version: versionname,
        }
    });

    if (!version) {
        return {
            props: {
                notFound: true,
            },
        };
    }

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
                latestVersion: project.latestVersion,
            },
            version: {
                changes: version.changes,
                version: version.version,
                downloadUrl: version.downloadUrl,
            }
        },
	};
};


export default function VersionIndexView({ project, notFound, version }) {
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
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <div className='flex flex-row space-x-2 items-center w-full justify-between'>
                                <div className='w-full'>
                                    <h1 className='text-4xl flex md:flex-row flex-col'>
                                        <p>
                                            {project.name} - {version.version}
                                        </p>
                                        <div className='flex flex-row space-x-2 md:mt-1'>
                                            <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.type}</Badge>
                                            <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.publishStatus}</Badge>
                                        </div>
                                    </h1>
                                </div>
                            </div>
                        </CardTitle>

                        <CardDescription>
                            {project.latestVersion === version.version ? "This is the latest version" : ""}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        
                    </CardContent>

                    <CardFooter>
                        <DateComponent text={`Last updated ${project.updated}`} />
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};