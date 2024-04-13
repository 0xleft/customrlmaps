import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllUserInfoServer, isAdmin } from "@/utils/userUtilsServer";
 
import * as React from "react"
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
 
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AdminUserTable from "@/components/AdminUserTable";
import prisma from "@/lib/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

const PER_PAGE = 100;

export const getServerSideProps = async ({ req, res }) => {
	const user = await getAllUserInfoServer(req, res);

	if (!user.session || !user.dbUser) {
		return {
			notFound: true,
		};
	}

	if (!isAdmin(user)) {
		return {
			notFound: true,
		};
	}


  	return {
		props: {
		},
	};
}



export default function AdminMisc() {

    const projectSchema = z.object({
		name: z.string(),
		limit: z.number(),
	});

	const userSchema = z.object({
		name: z.string(),
		limit: z.number(),
	});

	const projectForm = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
			name: "",
			limit: 0,
		},
    });

	const userForm = useForm({
		resolver: zodResolver(userSchema),
		defaultValues: {
			name: "",
			limit: 0,
		},
	});

	return (
		<>
			<div className="container p-4">
				<Card className="w-full">

					<CardHeader className="flex flex-col">
                        <CardTitle>
							Misc console
                        </CardTitle>
                    </CardHeader>

					<CardContent>
                        <div className="flex flex-row">
                            <div className="flex flex-row w-full space-x-2">
								<Form {...projectForm} className="w-full flex flex-row">
									<form onSubmit={(e) => {
										e.preventDefault();
									}}
										className="w-full flex flex-row"
									>
										<FormField
											control={projectForm.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Project name</FormLabel>
													<FormControl>
														<Input
															onChange={field.onChange}
															{...field}
															placeholder="Project Name"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={projectForm.control}
											name="limit"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Project version limit</FormLabel>
													<FormControl>
														<Input
															type="number"
															onChange={field.onChange}
															{...field}
															placeholder="Project limit"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button className="ml-2"
											onClick={() => {
												fetch("/api/admin/project/setVersionLimit", {
													method: "POST",
													body: JSON.stringify(projectForm.getValues()),
												}).then((res) => res.json()).then((data) => {
													if (data.error) {
														toast.error(data.error);
														return;
													}

													toast.success("Project limit updated");
												}).catch((e) => {
													toast.error("Failed to update project limit");
												});
											}}
										>Update</Button>
									</form>
								</Form>
                            </div>
                        </div>

						<div className="flex flex-row mt-4">
							<div className="flex flex-row w-full space-x-2">

								<Form {...userForm} className="w-full flex flex-row">
									<form onSubmit={(e) => {
										e.preventDefault();
									}}
										className="w-full flex flex-row"
									>
										<FormField
											control={userForm.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>User name</FormLabel>
													<FormControl>
														<Input
															onChange={field.onChange}
															{...field}
															placeholder="User Name"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={userForm.control}
											name="limit"
											render={({ field }) => (
												<FormItem>
													<FormLabel>User project limit</FormLabel>
													<FormControl>
														<Input
															type="number"
															onChange={field.onChange}
															{...field}
															placeholder="User limit"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button className="ml-2"
											onClick={() => {
												fetch("/api/admin/user/setProjectLimit", {
													method: "POST",
													body: JSON.stringify(userForm.getValues()),
												}).then((res) => res.json()).then((data) => {
													if (data.error) {
														toast.error(data.error);
														return;
													}

													toast.success("User limit updated");
												}).catch((e) => {
													toast.error("Failed to update user limit");
												});
											}}
										>Update</Button>
									</form>
								</Form>
								
							</div>
						</div>

                            
					</CardContent>
				</Card>
			</div>
		</>
	);
}