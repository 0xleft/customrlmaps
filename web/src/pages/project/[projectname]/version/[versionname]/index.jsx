import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'sonner';
import DangerDialog from './_DangerDialog';
import prisma from '@/lib/prisma';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export const getServerSideProps = async ({ req, res, params }) => {
    const { projectname, versionname } = params;
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

    const version = await prisma.version.findFirst({
        where: {
            projectId: project.id,
            version: versionname,
            deleted: isAdmin(currentUser) ? undefined : false,
            checkedStatus: (isAdmin(currentUser) || currentUser.dbUser?.id === project.userId) ? undefined : "APPROVED",
        }
    });

    if (!version) {
        return {
            notFound: true,
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
                publishStatus: project.publishStatus,
                type: project.type,
                views: project.views,
                latestVersion: project.latestVersion,
            },
            version: {
                checkedStatus: version.checkedStatus,
                changes: version.changes,
                version: version.version,
                downloadUrl: version.downloadUrl,
                updated: `${version.updatedAt.getDate()}/${version.updatedAt.getMonth()}/${version.updatedAt.getFullYear()}`,
                checkedMessage: version.checkedMessage,
            },
            canEdit: currentUser && currentUser.dbUser?.id === project.userId || isAdmin(currentUser),
        },
	};
};


export default function VersionIndexView({ project, version, canEdit }) {
    const [dangerDialogOpen, setDangerDialogOpen] = useState(false);
    const router = useRouter();

    function setAsLatest() {
        toast.loading("Setting as latest", { dismissible: true });
        fetch("/api/project/version/setlatest", {
            method: "POST",
            body: JSON.stringify({
                name: project.name,
                versionString: version.version,
            }),
        }).then(res => res.json()).then(data => {
            if (data.error) {
                toast.dismiss();
                toast.error(data.error);
                return;
            }
            toast.dismiss();
            toast.success("Version set as latest");
            router.push(`/project/${project.name}`);
        }).catch(e => {
            toast.dismiss();
            toast.error("An error occurred: " + e);
        });
    }

    return (
        <>
            <div className='container pt-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <div className='flex flex-col md:flex-row space-x-2 items-center w-full justify-between'>
                                <div className='w-full'>
                                    <h1 className='text-4xl flex md:flex-row flex-col'>
                                        <p>
                                            {project.name} ({version.version})
                                        </p>
                                        <div className='flex flex-row space-x-2 md:mt-1'>
                                            <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.type}</Badge>
                                            <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.publishStatus}</Badge>
                                            <Badge className='md:ml-2 h-6 mt-2 w-max'
                                                variant={version.checkedStatus === "APPROVED" ? "default" : "destructive"}
                                            >{version.checkedStatus}</Badge>
                                        </div>
                                    </h1>
                                </div>
                                <div className='flex flex-row space-x-2 md:mt-0 mt-2'>
                                <Button onClick={() => {
                                    fetch(version.downloadUrl).then(res => res.json()).then(data => {
                                        if (data.error) {
                                            toast.error(data.error);
                                            return;
                                        }

                                        open(data.downloadUrl, "_blank");
                                    });
                                }} className='md:mt-0'>
                                    {project.type === "MOD" ? "Install" : "Download"}
                                </Button>
                                    {canEdit && (
                                            <DropdownMenu className="">
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                    Settings
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>Manage</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem onSelect={() => {
                                                        setAsLatest();
                                                    }}>
                                                        Set as latest
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => {
                                                        setDangerDialogOpen(true);
                                                    }}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>

                        </CardTitle>

                        <CardDescription>
                            {project.latestVersion === version.version ? "This is the latest version" : ""}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {version.checkedMessage && (
                            <Alert variant="destructive" className="mb-4">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    {version.checkedMessage}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Separator />
                        <div className='mt-2 mb-2'>
                            <h1 className='text-2xl'>Changes</h1>
                            <p className=''>{version.changes}</p>
                        </div>

                    </CardContent>

                    <CardFooter>
                        <DateComponent text={`Last updated ${version.updated}`} />

                        <DangerDialog projectname={project.name} open={dangerDialogOpen} onClose={() => {
                            setDangerDialogOpen(false);
                        }} version={version.version} />
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};