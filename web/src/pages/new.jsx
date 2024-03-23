import CustomError from '@/components/CustomError';
import RecaptchaNotice from '@/components/RecapchaNotice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { bungySubmit } from '@/utils/bungySubmitRecaptcha';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { set, useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { z } from 'zod';


function checkFileType(file, type) {
	if (!file) {
		return true;
	}

	const fileType = file[0]?.name?.split(".").pop();
	if (fileType === "zip") {
		return true;
	}
    return false;
}

function checkBannerType(file) {
	if (!file) {
		return true;
	}

	const fileType = file[0]?.name?.split(".").pop();
	if (fileType === "png" || fileType === "jpg" || fileType === "jpeg") {
		return true;
	}
    return false;
}

export default function NewProject() {

	const router = useRouter();
	const type = router.query.type;

	if (type !== "mod" && type !== "map") {
		return (
			<CustomError error="404">
				<h1 className='text-muted-foreground'>Invalid type</h1>
			</CustomError>
		);
	}

    const formSchema = z.object({
		file: z.any()
		.refine((file) => file?.length !== 0, "File is required")
		.refine((file) => checkFileType(file, type), "Only .zip formats are supported."),
		name: z.string().max(20).min(1, {
			message: "Name must not be empty",
		}).regex(/^[a-zA-Z0-9-_]+$/, {
			message: "Only alphanumeric characters are allowed (a-z, A-Z, 0-9, - and _)",
		}),
		description: z.string().max(300).min(1, {
			message: "Description must not be empty",
		}).regex(/^[a-zA-Z0-9-_]+$/, {
			message: "Only alphanumeric characters are allowed (a-z, A-Z, 0-9, - and _)",
		}),
		longDescription: z.string().max(2000).min(1, {
			message: "Long description must not be empty",
		}),
		banner: z.any()
		.refine((file) => file?.length !== 0, "Banner is required")
		.refine((file) => checkBannerType(file), "Only .png, .jpg, .jpeg formats are supported."),
	})
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
			file: "",
			name: "",
			description: "",
			longDescription: "",
        },
    });

	const fileRef = form.register("file");
	const bannerRef = form.register("banner");

	const [uploading, setUploading] = useState(false);
    
	const { executeRecaptcha } = useGoogleReCaptcha();

    function onSubmit(values, token) {
		fetch(`/api/new`, {
			method: "POST",
			body: JSON.stringify({
				...values,
				type: type,
				gRecaptchatoken: token,
			}),
		}).then((res) => res.json()).then((data) => {
			if (data.error) {
				toast.error("An error occurred! " + data.error);
				setUploading(false);
				return;
			}
			toast.success("Started uploading files...");
			const { fileUrl, fileFields, bannerUrl, bannerFields } = data;
			const secondFormData = new FormData();
			Object.keys(fileFields).forEach((key) => {
				secondFormData.append(key, fileFields[key]);
			});
			secondFormData.append('file', values.file[0]);
			fetch(fileUrl, {
				method: "POST",
				body: secondFormData,
			}).then((res) => {
				if (res.status !== 204) {
					toast.error("An error occurred! " + res.statusText);
					setUploading(false);
					return;
				}
			}).catch((err) => {
				toast.error("An error occurred! " + err);
				setUploading(false);
				return;
			});

			const thirdFormData = new FormData();
			
			Object.keys(bannerFields).forEach((key) => {
				thirdFormData.append(key, bannerFields[key]);
			});
			thirdFormData.append('file', values.banner[0]);

			fetch(bannerUrl, {
				method: "POST",
				body: thirdFormData,
			}).then((res) => {
				if (res.status !== 204) {
					toast.error("An error occurred! " + res.statusText);
					setUploading(false);
					return;
				}

				toast.success("Uploaded successfully!");
				router.push(`/project/${values.name}`);
			}).catch((err) => {
				toast.error("An error occurred! " + err);
				setUploading(false);
				return;
			});

			setUploading(false);
		}).catch((err) => {
			toast.error("An error occurred! " + err);
			setUploading(false);
			return;
		});
    }

	const [longDescription, setLongDescription] = useState("");

	return (
		<>
			<div className="container p-4">
				<Card className="w-full">

					<CardHeader className="flex flex-col">
                        <CardTitle>
                            Upload new {type}
                        </CardTitle>
                    </CardHeader>

					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit((values) => {bungySubmit(onSubmit, executeRecaptcha, "new", setUploading, values)})} className="flex flex-col space-y-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name of {type}</FormLabel>
											<FormControl>
												<Input placeholder="Name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Short description</FormLabel>
											<FormControl>
												<Input placeholder="Description" {...field} />
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
												<article class="prose"><Markdown
													allowedElements={["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "a", "strong", "em", "code", "img", "blockquote", "hr", "br"]}
												>{longDescription}</Markdown></article>
											</CardContent>
										</Card>
									</TabsContent>
								</Tabs>
								<div className="flex flex-row space-x-4 justify-between">
									<div className="flex flex-row space-x-4 justify-between">
										<FormField
											control={form.control}
											name="file"
											onChange={(event) => {
												field.onChange(event.target?.files?.[0] ?? undefined);
											}}
											render={({ field }) => (
												<FormItem>
													<FormLabel>{type === "mod" ? "Mod" : "Map"} file</FormLabel>
													<FormControl>
														<Input type="file" {...fileRef} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="banner"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Banner</FormLabel>
													<FormControl>
														<Input type="file" {...bannerRef} accept="image/png, image/jpeg, image/jpg" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
								<div className="w-full justify-between flex flex-row">
									<div className=""></div>
									<Button type="submit" className="md:w-[33%] w-full" disabled={uploading}>
											<UpdateIcon className={"animate-spin " + (uploading ? "block" : "hidden")} />
											{uploading ? "" : "Upload"}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
