import { Inter } from "next/font/google";
import { getAllUserInfo } from "@/utils/apiUtils";
import { Badge } from "@/components/ui/badge";
import DateComponent from "@/components/DateComponent";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { UpdateIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { DangerDialog } from "./_DangerDialog";

const inter = Inter({ subsets: ["latin"] });

export const getServerSideProps = async ({ req, res, params }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=60'
    )

    const currentUser = await getAllUserInfo(req);

	return {
		props: {
            user: {
                username: currentUser.dbUser.username,
                imageUrl: currentUser.dbUser.imageUrl,
                created: `${currentUser.dbUser.createdAt.getDate()}/${currentUser.dbUser.createdAt.getMonth()}/${currentUser.dbUser.createdAt.getFullYear()}`,
                roles: currentUser.dbUser.roles.join(", "),
				updated: `${currentUser.dbUser.updatedAt.getDate()}/${currentUser.dbUser.updatedAt.getMonth()}/${currentUser.dbUser.updatedAt.getFullYear()}`
            },
        },
	};
};

export default function User({ user }) {

	const formSchema = z.object({
		username: z.string().min(1, "Username is required"),
		description: z.string().optional(),
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

	function onSubmit(data) {
		setUploading(true);
		let submitData = {
			username: data.username,
			description: data.description,
			image: imageSrc != user.imageUrl
		}

		toast.loading("Saving...");
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
				toast.loading("Started uploading files...");
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
					<form onSubmit={form.handleSubmit(onSubmit)}>
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
                                        <div className='flex flex-row space-x-2'>
											<Button asChild>
												<Link href="/user/[username]" as={`/user/${user.username}`}>
													View profile
												</Link>
											</Button>
                                            <DropdownMenu className="">
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline">
                                                        Settings
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56">
                                                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
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