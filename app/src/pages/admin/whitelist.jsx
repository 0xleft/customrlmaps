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
import AdminWhitelistTable from "@/components/AdminWhitelistTable";
import { toast } from "sonner";
import { useRouter } from "next/router";

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

	const page = parseInt(new URL(req.url, "https://localhost").searchParams.get('page')) || 1;

	const whitelists = await prisma.whitelist.findMany({
		take: PER_PAGE,
		skip: (page - 1) * PER_PAGE,
	});

  	return {
		props: {
            whitelists: whitelists.map((whitelist) => ({
                id: whitelist.id,
                otp: whitelist.otp,
            })),
            page,
		},
	};
}

export default function AdminWhitelist({ whitelists, page }) {
    const router = useRouter();

	return (
		<>
			<div className="container p-4">
				<Card className="w-full">

					<CardHeader className="flex flex-col">
                        <CardTitle>
							Whitelist
                        </CardTitle>

                        <div className="flex flex-row space-x-2">
                            <Button onClick={() => {
                                fetch("/api/admin/whitelist/create", {
                                    method: "POST",
                                }).then(async (res) => res.json()).then((data) => {
                                    if (data.error) {
                                        toast.error(data.error);
                                        return;
                                    }

                                    toast.success("Whitelist created " + data.otp);
                                    router.reload();
                                }).catch((error) => {
                                    toast.error("An error occurred");
                                });
                            }}>
                                Create new
                            </Button>
                        </div>
                    </CardHeader>

					<CardContent>
                        <AdminWhitelistTable whitelists={whitelists} page={page} />
					</CardContent>
				</Card>
			</div>
		</>
	);
}