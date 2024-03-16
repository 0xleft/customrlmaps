import { Combobox } from '@/components/Combobox';
import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllUserInfo } from '@/utils/apiUtils';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Markdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { CheckIcon, CircleIcon, ReloadIcon, UpdateIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog"
import { Select } from '@/components/ui/select';
import { Toaster, toast } from 'sonner';

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

    if (project.publishStatus === "DELETED") {
        return {
            props: {
                notFound: true,
            },
        };
    }

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


export default function NewVersionProject({ project, notFound, canEdit }) {
    if (notFound) {
        return (
            <CustomError error="404">
                <h1 className='text-muted-foreground'>Map not found</h1>
            </CustomError>
        );
    }

    if (!canEdit) {
        return (
            <CustomError error="403">
                <h1 className='text-muted-foreground'>You do not have permission to edit this map</h1>
            </CustomError>
        );
    }

    const [versionDialogOpen, setVersionDialogOpen] = useState(false);
    const [dangerDialogOpen, setDangerDialogOpen] = useState(false);

    const [uploading, setUploading] = useState(false);

    const form = useForm({
        defaultValues: {
            changes: "",
            files: "",
        }
    });

    const filesRef = form.register("files");    

    function onSubmit(data) {
        console.log(data);
    }

    return (
        <>
            <div className='container pt-6'>
                <Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card className="w-full">
                            <CardHeader className="w-full">
                                <CardTitle className="flex flex-row space-x-2 items-center w-full">
                                    <div className='flex flex-row space-x-2 items-center w-full justify-between'>
                                        <div className='w-full'>
                                            <h1 className='text-4xl flex md:flex-row flex-col font-bold'>
                                                <p>
                                                    New version for <span className='font-normal'>{project.name}</span>
                                                </p>
                                                <div className='flex flex-row space-x-2 md:mt-1'>
                                                    <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.type}</Badge>
                                                    <Badge className='md:ml-2 h-6 mt-2 w-max'>{project.publishStatus}</Badge>
                                                </div>
                                            </h1>
                                        </div>
                                        <div>
                                            <DropdownMenu className="">
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="">
                                                        Settings
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56">
                                                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem onSelect={() => {
                                                            setLatestVersionDialogOpen(true);
                                                        }}>
                                                            Select latest version
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem onSelect={() => setVersionDeleteDialogOpen(true)}>
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                </CardDescription>
                            </CardHeader>


                            <CardContent className="space-y-10">
                                <Separator className="border-b" />

                                <FormField
                                    control={form.control}
                                    name="changes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Changes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Changes" {...field} onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-row space-x-4">
                                    <FormField
                                        control={form.control}
                                        name="files"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Project files</FormLabel>
                                                <div className='flex flex-row space-x-2'>
                                                    <FormControl>
                                                        <Input type="file" {...filesRef} accept="image/png, image/jpeg, image/jpg" onChange={(e) => {
                                                            filesRef.onChange(e);
                                                            const reader = new FileReader();
                                                            reader.onload = function(e) {
                                                            };
                                                            reader.readAsDataURL(e.target.files[0]);
                                                        }} />
                                                    </FormControl>

                                                    <Button className={"" + (filesRef.name == "" ? "hidden" : "")} onClick={() => {
                                                        form.setValue("files", "");
                                                    }}
                                                    type="button">Cancel</Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
								</div>

                                <div className='flex flex-row justify-between'>
                                    <div></div>
                                    <Button type="submit" className="md:w-[33%] w-full" disabled={uploading}>
                                        <UpdateIcon className={"animate-spin " + (uploading ? "block" : "hidden")} />
                                        {uploading ? "" : "Save"}
                                    </Button>
                                </div>
                            </CardContent>

                            <CardFooter>
                                <DateComponent text={`Last updated ${project.updated}`} />

                                {/* <VersionDialog open={versionDialogOpen} projectname={project.name} versions={versions.map((version) => {
                                    return {
                                        value: version.version,
                                        label: version.version,
                                    };
                                })} onClose={() => setVersionDialogOpen(false)} />

                                <DangerDialog open={dangerDialogOpen} projectname={project.name} onClose={() => setDangerDialogOpen(false)} /> */}
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </div>
        </>
    );
};