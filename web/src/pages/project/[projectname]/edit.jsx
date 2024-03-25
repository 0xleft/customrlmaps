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
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { zodResolver } from '@hookform/resolvers/zod';
import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { CheckIcon, UpdateIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { z } from 'zod';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { bungySubmit } from '@/utils/bungySubmitRecaptcha';
import DangerDialog from './_DangerDialog';
import prisma from '@/lib/prisma';

export const getServerSideProps = async ({ req, res, params }) => {
    const { projectname } = params;
    const currentUser = await getAllUserInfoServer(req, res);

    if (!currentUser) {
        return {
            notFound: true,
        };
    }

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
        },
	};
};


export default function EditProjectPage ( { project }) {
    const [longDescription, setLongDescription] = useState(project.longDescription);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const formSchema = z.object({
        description: z.string().max(300),
        longDescription: z.string().max(2000),
        status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: project.description,
            longDescription: project.longDescription,
            status: project.publishStatus,
        },
    });

	const bannerRef = form.register("banner");
    const [bannerSrc, setBannerSrc] = useState("");

    const [dangerDialogOpen, setDangerDialogOpen] = useState(false);

    function onSubmit(data) {
        setUploading(true);

        fetch(`/api/project/update`, {
            method: "POST",
            body: JSON.stringify({
                name: project.name,
                description: form.getValues().description,
                longDescription: form.getValues().longDescription,
                banner: form.getValues().banner,
            }),
        }).then((res) => res.json()).then((data) => {
            if (data.error) {
                toast.dismiss();
                toast.error("An error occurred! " + data.error);
                setUploading(false);
                return;
            }

            if (data.bannerFields) {
                toast.loading("Started uploading files...", { dismissible: true });
                const secondFormData = new FormData();
                Object.keys(data.bannerFields).forEach((key) => {
                    secondFormData.append(key, data.bannerFields[key]);
                });
                secondFormData.append('file', form.getValues().banner[0]);
                fetch(data.bannerUrl, {
                    method: "POST",
                    body: secondFormData,
                }).then((res) => {
                    if (res.status !== 204) {
                        toast.dismiss();
                        toast.error("An error occurred! " + res.statusText);
                        setUploading(false);
                        return;
                    }

                    toast.dismiss();
                    toast.success("Updated project");
                    setUploading(false);
                    router.replace(router.asPath);
                }).catch((err) => {
                    toast.dismiss();
                    toast.error("An error occurred! " + err);
                    setUploading(false);
                    return;
                });
            } else {
                toast.dismiss();
                toast.success("Updated project");
                setUploading(false);
                router.replace(router.asPath);
            }
        });
    }

    function setStatus(status) {
        if (status === project.publishStatus) {
            return;
        }

        executeRecaptcha("updateProject").then((token) => {
            setStatusFinal(status, token);
        });
    }

    function setStatusFinal(status, token) {
        toast.loading("Updating status...", { dismissible: true });
        fetch(`/api/project/update`, {
            method: "POST",
            body: JSON.stringify({
                name: project.name,
                status: status,
                gRecaptchatoken: token,
            }),
        }).then((res) => res.json()).then((data) => {
            if (data.error) {
                toast.error("An error occurred! " + data.error);
                return;
            }
            toast.dismiss();
            toast.success("Status: " + data.message);
            router.replace(router.asPath);
        });
    }

    const { executeRecaptcha } = useGoogleReCaptcha();

    return (
        <>
            <div className='container pt-6'>
                <Form {...form}>
					<form onSubmit={form.handleSubmit((values) => {bungySubmit(onSubmit, executeRecaptcha, "updateProject", setUploading, values)})}>
                        <Card className="w-full">
                            <CardHeader className="w-full">
                                <CardTitle className="flex flex-row space-x-2 items-center w-full">
                                    <div className='flex flex-row space-x-2 items-center w-full justify-between'>
                                        <div className='w-full'>
                                            <h1 className='text-4xl flex md:flex-row flex-col font-bold'>
                                                <p>Editing <span className='font-normal'>{project.name}</span></p>
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
                                                        <DropdownMenuItem onSelect={() => router.push(`/project/${project.name}/version/new`)}>
                                                            New version
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                Status
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuPortal>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem onSelect={() => setStatus("PUBLISHED")}>
                                                                    {project.publishStatus === "PUBLISHED" ? <CheckIcon className="mr-2" /> : null}
                                                                    Published
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onSelect={() => setStatus("DRAFT")}>
                                                                    {project.publishStatus === "DRAFT" ? <CheckIcon className="mr-2" /> : null}
                                                                    Draft
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                            </DropdownMenuPortal>
                                                        </DropdownMenuSub>
                                                    </DropdownMenuGroup>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem onSelect={() => setDangerDialogOpen(true)}>
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    Latest version {project.latestVersion}
                                </CardDescription>
                            </CardHeader>


                            <CardContent className="space-y-10">

                                <Separator className="border-b" />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Description" {...field} onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <Tabs defaultValue="raw">
									<TabsList className="grid grid-cols-2">
										<TabsTrigger value="raw">Raw</TabsTrigger>
										<TabsTrigger value="preview">Preview</TabsTrigger>
									</TabsList>
									<TabsContent value="raw">
										<FormField
											control={form.control}
											name="longDescription"
											render={({ field }) => (
												<FormItem>
													<FormLabel>README description (supports limited markdown)</FormLabel>
													<FormControl>
														<Textarea placeholder="Long description" {...field} className="h-96" onChange={(e) => {
																setLongDescription(e.target.value);
																field.onChange(e);
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</TabsContent>
									<TabsContent value="preview">
										<Card>
											<CardContent className="mt-4">
												<article className="prose"><Markdown
													allowedElements={["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a", "strong", "em", "code", "img", "blockquote", "hr", "br"]}
												>{longDescription}</Markdown></article>
											</CardContent>
										</Card>
									</TabsContent>
								</Tabs>

                                <div className="flex flex-row space-x-4">
                                    <FormField
                                        control={form.control}
                                        name="banner"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Banner</FormLabel>
                                                <div className='flex flex-row space-x-2'>
                                                    <FormControl>
                                                        <Input type="file" {...bannerRef} accept="image/png, image/jpeg, image/jpg" onChange={(e) => {
                                                            bannerRef.onChange(e);
                                                            const reader = new FileReader();
                                                            reader.onload = function(e) {
                                                                setBannerSrc(e.target.result);
                                                            };
                                                            reader.readAsDataURL(e.target.files[0]);
                                                        }} />
                                                    </FormControl>

                                                    <Button className={"" + (bannerSrc == "" ? "hidden" : "")} onClick={() => {
                                                        form.setValue("banner", "");
                                                        setBannerSrc("")
                                                    }}
                                                    type="button">Cancel</Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
								</div>
                                <div className='max-h-[300px] overflow-clip'>
                                    <AspectRatio ratio={16 / 9} className="bg-muted overflow-clip rounded-md max-h-[300px] max-w-[533px]">
                                        <img src={bannerSrc} alt="Will not change" className="rounded-md object-cover w-full" />
                                    </AspectRatio>
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

                                <DangerDialog open={dangerDialogOpen} projectname={project.name} onClose={() => setDangerDialogOpen(false)} />
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </div>
        </>
    );
};