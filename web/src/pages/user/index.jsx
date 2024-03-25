import DateComponent from '@/components/DateComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getAllUserInfoServer, isAdmin } from '@/utils/userUtilsServer';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { z } from 'zod';
import CustomError from '@/components/CustomError';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { bungySubmit } from '@/utils/bungySubmitRecaptcha';
import DangerDialog from './_DangerDialog';
import prisma from '@/lib/prisma';

export const getServerSideProps = async ({ req, res }) => {
    const currentUser = await getAllUserInfoServer(req, res);


    if (!currentUser || !currentUser.session || !currentUser.dbUser || currentUser.dbUser.deleted) {
        return {
            notFound: true,
        };
    }

    const id = parseInt(new URL(req.url, "https://localhost").searchParams.get('id')) || undefined;

    if (id && isAdmin(currentUser)) {
        const dbUser = await prisma.user.findUnique({
            where: {
                id: id,
            }
        });

        if (!dbUser) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                user: {
                    id: dbUser.id,
                    username: dbUser.username,
                    imageUrl: dbUser.imageUrl,
                    updated: `${dbUser.updatedAt.getDay()}/${dbUser.updatedAt.getMonth()}/${dbUser.updatedAt.getFullYear()}`,
                    roles: dbUser.roles
                }
            },
        };
    }

    return {
		props: {
            user: {
                username: currentUser.dbUser.username,
                imageUrl: currentUser.dbUser.imageUrl,
                updated: `${currentUser.dbUser.updatedAt.getDay()}/${currentUser.dbUser.updatedAt.getMonth()}/${currentUser.dbUser.updatedAt.getFullYear()}`,
                roles: currentUser.dbUser.roles
            }
        },
	};
};

export default function User({ user }) {

    if (!user) {
        return (
            <CustomError error="404">
                <h1 className='text-muted-foreground'>User not found</h1>
            </CustomError>
        );
    }

	const formSchema = z.object({
        id: z.number().optional(),
		username: z.string().max(20).min(1, "Username is required"),
		description: z.string().max(300).optional(),
	})

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
			username: user.username,
			description: user.description,
			roles: user.roles
        },
    });

	const [uploading, setUploading] = useState(false);
	const [dangerDialogOpen, setDangerDialogOpen] = useState(false);

	const imageRef = form.register("image");
    const [imageSrc, setImageSrc] = useState(user.imageUrl);

	const router = useRouter();

    const { executeRecaptcha } = useGoogleReCaptcha();

	function onSubmit(data, token) {
		let submitData = {
			username: data.username,
			description: data.description,
			image: imageSrc != user.imageUrl,
            gRecaptchatoken: token,
            id: user.id
		}

		toast.loading("Saving...", { dismissible: true });
		fetch("/api/user/update", {
			method: "POST",
			body: JSON.stringify(submitData),
		}).then((res) => res.json()).then((data) => {
			if (data.error) {
				toast.dismiss();
				toast.error(data.error);
				setUploading(false);
				return;
			}

			if (data.url) {
				toast.loading("Started uploading files...", { dismissible: true });
				const secondFormData = new FormData();
				Object.keys(data.fields).forEach((key) => {
					secondFormData.append(key, data.fields[key]);
				});
				secondFormData.append('file', form.getValues().image[0]);
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
					toast.dismiss();
					toast.success("Updated user");
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
				toast.success("Updated user");
				setUploading(false);
				router.replace(router.asPath);
			}
		}).catch((e) => {
			toast.dismiss();
			toast.error("An error occurred " + e);
			setUploading(false);
			return;
		});
	}

	return (
		<>
			<div className='container pt-6'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit((values) => {bungySubmit(onSubmit, executeRecaptcha, "updateUser", setUploading, values)})}>
                        <Card className="w-full">
                            <CardHeader className="w-full">
                                <CardTitle className="flex flex-row space-x-2 items-center w-full">
                                    <div className='flex flex-row space-x-2 items-center w-full justify-between'>
                                        <div className='w-full'>
                                            <h1 className='text-4xl flex md:flex-row flex-col font-bold'>
                                                <p>
                                                    Profile settings
                                                </p>
                                                <div className='flex flex-row space-x-2 md:mt-1'>
                                                </div>
                                            </h1>
                                        </div>
                                        <div className='flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0'>
											<Button asChild>
												<Link href="/user/[username]" as={`/user/${user.username}`}>
													View profile
												</Link>
											</Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild >
                                                    <Button variant="outline">
                                                        Settings
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56">
                                                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem
                                                        onSelect={() => {if (user.id !== undefined) { return; } setDangerDialogOpen(true)}}>
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>


                            <CardContent className="space-y-10">

                                <Separator />

								<FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Username" {...field} onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

								<FormField
                                    name="roles"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Roles</FormLabel>
                                                <Input {...field} disabled />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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


                                <div className="flex flex-row space-x-4">
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Profile image</FormLabel>
                                                <div className='flex flex-row space-x-2'>
                                                    <FormControl>
                                                        <Input type="file" {...imageRef} accept="image/png, image/jpeg, image/jpg" onChange={(e) => {
                                                            imageRef.onChange(e);
                                                            const reader = new FileReader();
                                                            reader.onload = function(e) {
                                                                setImageSrc(e.target.result);
                                                            };
                                                            reader.readAsDataURL(e.target.files[0]);
                                                        }} />
                                                    </FormControl>

                                                    <Button className={"" + (imageSrc == user.imageUrl ? "hidden" : "")} onClick={() => {
                                                        form.setValue("image", "");
                                                        setImageSrc(user.imageUrl);
                                                    }}
                                                    type="button">Cancel</Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
								</div>
                                <div className='max-h-[300px] overflow-clip max-w-[300px]'>
									<img src={imageSrc} alt="Profile image" className="rounded-md object-cover w-full aspect-square" />
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
                                <DateComponent text={`Last updated ${user.updated}`} />

								<DangerDialog username={user.username} open={dangerDialogOpen} onClose={() => setDangerDialogOpen(false)} />
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
			</div>
		</>
	);
}