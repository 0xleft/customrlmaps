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

    const users = await prisma.user.findMany({
        take: PER_PAGE,
        skip: (page - 1) * PER_PAGE,
    });

    return {
		props: {
            users: users.map((user) => ({
                id: user.id,
                username: user.username,
                email: user.email,
                roles: user.roles,
                banned: user.banned,
                deleted: user.deleted,
            })),
            page,
        },
	};
}



export default function AdminUsers({ users, page }) {
	return (
		<>
			<div className="container p-4">
				<Card className="w-full">

					<CardHeader className="flex flex-col">
                        <CardTitle>
							Users
                        </CardTitle>
                    </CardHeader>

					<CardContent>
                        <AdminUserTable users={users} page={page} />
					</CardContent>
				</Card>
			</div>
		</>
	);
}