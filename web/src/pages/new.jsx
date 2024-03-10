import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });
import ReactDOMServer from 'react-dom/server';
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

function checkFileType(file, type) {
	if (!file) {
		return true;
	}

	const fileType = file[0]?.name?.split(".").pop();
	if (fileType === "dll" && type === "mod") {
		return true;
	}
	if (fileType === "upk" && type === "map") {
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

export default function New() {
	const router = useRouter();
	const type = router.query.type;

    const formSchema = z.object({
		file: z.any()
		.refine((file) => file?.length !== 0, "File is required")
		.refine((file) => checkFileType(file, type), type === "mod" ? "Only .dll formats are supported." : "Only .upk formats are supported."),
		name: z.string().min(1, {
			message: "Name must not be empty",
		}),
		description: z.string().min(1, {
			message: "Description must not be empty",
		}),
		longDescription: z.string().min(1, {
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
    
    function onSubmit(values) {
		setUploading(true);
		const formData = new FormData();
		formData.append('file', values.file[0]);
		formData.append('name', values.name);
		formData.append('description', values.description);
		formData.append('longDescription', values.longDescription);
		formData.append('banner', values.banner[0]);
		formData.append('type', type);

		fetch(`/api/new`, {
			method: "POST",
			body: formData,
		}).then((res) => res.json()).then((data) => {
			if (data.error) {
				toast.error("An error occurred! " + data.error);
			}
			toast.success("Message: " + data.message);
			setUploading(false);
		}).catch((err) => {
			toast.error("An error occurred! " + err);
			setUploading(false);
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
							<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
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
													<FormLabel>README description (supports some markdown)</FormLabel>
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
												<article class="prose"><Markdown>{longDescription}</Markdown></article>
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
														<Input type="file" {...bannerRef} />
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
											{uploading ? "Uploading..." : "Upload"}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
			<Toaster />
		</>
	);
}
