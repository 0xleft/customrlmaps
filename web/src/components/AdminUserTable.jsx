"use client"

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
import Link from "next/link"

function banUser(id, banned = true) {
    fetch(`/api/admin/user/ban`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, banned: banned }),
    }).then((res) => {
        if (res.status !== 200) {
            console.error("An error occurred! " + res.statusText)
            return
        }
        console.log("Deleted user")
    }).catch((err) => {
        console.error("An error occurred! " + err)
    });
}
function deleteUser(id, deleted = true) {
    fetch(`/api/admin/user/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, deleted: deleted }),
    }).then((res) => {
        if (res.status !== 200) {
            console.error("An error occurred! " + res.statusText)
            return
        }
        console.log("Deleted user")
    }).catch((err) => {
        console.error("An error occurred! " + err)
    });
}

export const columns = [
{
    id: "select",
    header: ({ table }) => (
    <Checkbox
        checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
    />
    ),
    cell: ({ row }) => (
    <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
    />
    ),
    enableSorting: false,
    enableHiding: false,
},
{
    accessorKey: "id",
    header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Id
            <CaretSortIcon className="h-4 w-4" />
            </Button>
        )
    },
    cell: ({ row }) => (
    <div className="capitalize">{row.getValue("id")}</div>
    ),
},
{
    accessorKey: "email",
    header: ({ column }) => {
    return (
        <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
        Email
        <CaretSortIcon className="h-4 w-4" />
        </Button>
    )
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
},
{
    accessorKey: "roles",
    header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Roles
            <CaretSortIcon className="h-4 w-4" />
            </Button>
        )
        },
    cell: ({ row }) => {
        return <div className="text-left font-medium">{row.getValue("roles").join(", ")}</div>
    },
},
{
    accessorKey: "username",
    header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Username
            <CaretSortIcon className="h-4 w-4" />
            </Button>
        )
    },
    cell: ({ row }) => <div>{row.getValue("username")}</div>,
},
{
    accessorKey: "banned",
    header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Banned
            <CaretSortIcon className="h-4 w-4" />
            </Button>
        )
    },
    cell: ({ row }) => (
    <div>{row.getValue("banned") ? "Yes" : "No"}</div>
    ),
},
{
    accessorKey: "deleted",
    header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Deleted
            <CaretSortIcon className="h-4 w-4" />
            </Button>
        )
    },
    cell: ({ row }) => (
    <div>{row.getValue("deleted") ? "Yes" : "No"}</div>
    ),
},
{
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
    const user = row.original

    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => 
                window.location.href = `/user?id=${user.id}`
            }>
            Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={() => {
                    user.banned ? banUser(user.id, false) : banUser(user.id)
                }}
            >
                {user.banned ? "Unban" : "Ban"}
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => {
                    user.deleted ? deleteUser(user.id, false) : deleteUser(user.id)
                }}
            >
                {user.deleted ? "Undelete" : "Delete"}
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    )
    },
},
]

export default function AdminUserTable({ users, page }) {
    let data = users;

    const [sorting, setSorting] = React.useState([])
    const [columnFilters, setColumnFilters] = React.useState([])
    const [columnVisibility, setColumnVisibility] = React.useState({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
        <div className="flex items-center py-4">
            <Input
            placeholder="Filter usernames..."
            value={(table.getColumn("username")?.getFilterValue()) ?? ""}
            onChange={(event) =>
                table.getColumn("username")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                    return (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                        }
                    >
                        {column.id}
                    </DropdownMenuCheckboxItem>
                    )
                })}
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    )
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                    >
                    No results.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
            <Button asChild
                variant="outline"
                size="sm"
            >
                <Link href={`/admin/users?page=${page - 1}`}>Previous</Link>
            </Button>
            <Button
                variant="outline"
                size="sm"
                asChild
            >
                <Link href={`/admin/users?page=${page + 1}`}>Next</Link>
            </Button>

            <Button disabled={!table.getSelectedRowModel().rows.length}
                size="sm"
                onClick={() => {
                    let selected = table.getSelectedRowModel().rows.map((row) => row.original.id)
                    selected.forEach((id) => {
                        deleteUser(id)
                    })
                }}
            >
                Delete
            </Button>
            </div>
        </div>
        </div>
    )
}