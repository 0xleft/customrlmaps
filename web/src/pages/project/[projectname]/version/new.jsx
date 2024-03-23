import CustomError from '@/components/CustomError';
import DateComponent from '@/components/DateComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getAllUserInfoServer } from '@/utils/userUtilsServer';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

    const { projectname } = params;
    const currentUser = await getAllUserInfoServer(req, res);

    if (!currentUser) {
        return {
            props: {
                notFound: true,
            },
        };
    }

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

    if (project.deleted) {
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
                publishStatus: project.publishStatus,
                type: project.type,
                views: project.views,
                latestVersion: project.latestVersion,
            },
            canEdit: currentUser && currentUser.dbUser?.id === project.userId, // todo admin
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

    const [uploading, setUploading] = useState(false);

    const [projectFiles, setProjectFiles] = useState(false);

    const schema = z.object({
        changes: z.string().min(1, {
			message: "Changes are required",
		}).max(300),
        files: z.any().refine((file) => file?.length !== 0, "File is required"),
        versionString: z.string().regex(/^\d{1,4}\.\d{1,4}\.\d{1,4}$/, "Invalid version number format. Use x.x.x"),
        latest: z.boolean(),
    });

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            versionString: project.latestVersion,
            changes: "",
            files: "",
            latest: false,
        }
    });

    const filesRef = form.register("files");

    function parseVersion(version) {
        return version.split(".").map((v) => {
            return parseInt(v);
        });
    }

    const router = useRouter();

    function onSubmit(data) {
        setUploading(true);
        toast.loading("Uploading...");

        fetch(`/api/project/version/new`, {
            method: 'POST',
            body: JSON.stringify({
                name: project.name,
                versionString: data.versionString,
                changes: data.changes,
                files: true,
                latest: data.latest,
            }),
        }).then((res) => res.json()).then((data) => {
            if (data.error) {
                toast.dismiss();
                toast.error(data.error);
                setUploading(false);
                return;
            }
            if (data.url) {
                const secondFormData = new FormData();
                Object.keys(data.fields).forEach((key) => {
                    secondFormData.append(key, data.fields[key]);
                });
                secondFormData.append('file', form.getValues().files[0]);
                fetch(data.url, {
                    method: "POST",
                    body: secondFormData,
                }).then((res) => {
                    if (res.status !== 204) {
                        toast.dismiss();
                        toast.error("An error occurred! " + res.statusText);
                        setUploading(false);
                        return;
                    }

                    toast.success("Created new version");
                    toast.dismiss();
                    setUploading(false);
                    router.push(`/project/${project.name}/version/${form.getValues().versionString}`);
                }).catch((err) => {
                    toast.dismiss();
                    toast.error("An error occurred! " + err);
                    setUploading(false);
                    return;
                });
            } else {
                toast.dismiss();
                toast.success("Version uploaded!");
                setUploading(false);
            }
        });
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
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                </CardDescription>
                            </CardHeader>


                            <CardContent className="space-y-10">
                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="versionString"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Version number</FormLabel>
                                            <div className='flex flex-row space-x-2'>
                                                <FormControl>
                                                    <Input placeholder="Version" {...field} onChange={(e) => {
                                                            field.onChange(e);
                                                        }}
                                                    />
                                                </FormControl>
                                                <DropdownMenu className="">
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline">
                                                            Auto asign version
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56">
                                                        <DropdownMenuLabel>Type</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onSelect={() => {
                                                                let latestVersion = project.latestVersion;
                                                                let newVersion = parseVersion(latestVersion);
                                                                newVersion[0] += 1;

                                                                form.setValue("versionString", newVersion.join("."));
                                                            }}>
                                                                Major update
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => {
                                                                let latestVersion = project.latestVersion;
                                                                let newVersion = parseVersion(latestVersion);
                                                                newVersion[1] += 1;

                                                                form.setValue("versionString", newVersion.join("."));
                                                            }}>
                                                                Minor update
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => {
                                                                let latestVersion = project.latestVersion;
                                                                let newVersion = parseVersion(latestVersion);
                                                                newVersion[2] += 1;

                                                                form.setValue("versionString", newVersion.join("."));
                                                            }}>
                                                                Bugfix
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                                        <Input type="file" {...filesRef} accept={project.type == ".zip"} onChange={(e) => {
                                                            filesRef.onChange(e);
                                                            const reader = new FileReader();
                                                            reader.onload = function(e) {
                                                                setProjectFiles(true);
                                                            };
                                                            reader.readAsDataURL(e.target.files[0]);
                                                        }} />
                                                    </FormControl>

                                                    <Button className={"" + (projectFiles ? "" : "hidden")} onClick={() => {
                                                        form.setValue("files", "");
                                                        setProjectFiles(false);
                                                    }}
                                                    type="button">Cancel</Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
								</div>

                                <div className='flex flex-row justify-between'>
                                    <div className='w-full flex flex-col space-y-4'>
                                        <div className="flex items-center space-x-2 ml-auto">
                                            <Checkbox id="latest" onClick={() => {
                                                form.setValue("latest", !form.watch("latest"));
                                            }} />
                                            <label
                                                htmlFor="latest"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                This is the latest version
                                            </label>
                                        </div>
                                        <Button type="submit" className="md:w-[33%] w-full ml-auto" disabled={uploading}>
                                            <UpdateIcon className={"animate-spin " + (uploading ? "block" : "hidden")} />
                                            {uploading ? "" : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>

                            

                            <CardFooter>
                                <DateComponent text={`Last updated ${project.updated}`} />
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </div>
        </>
    );
};