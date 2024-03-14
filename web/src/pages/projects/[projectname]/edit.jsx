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

    // todo installation
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
                <Card className="">
                    <CardHeader className="">
                        <CardTitle className="">
                        </CardTitle>
                        <CardDescription >
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="min-h-screen">
                    </CardContent>

                    <CardFooter>
                        <DateComponent text={`Last updated ${project.updated}`} />
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};