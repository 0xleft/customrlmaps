"use client"

import * as React from "react"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/router"
import { BoxIcon, MagicWandIcon, RocketIcon } from "@radix-ui/react-icons"

export function AddButton() {
    const router = useRouter();

  	return (
		<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="outline">
				<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent className="w-56">
			<DropdownMenuLabel>Create</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem value="map" onSelect={() => router.push("/new?type=map")}>
				<RocketIcon className="mr-2" />
				Map
			</DropdownMenuItem>
			<DropdownMenuItem value="mod" onSelect={() => router.push("/new?type=mod")}>
				<MagicWandIcon className="mr-2" />
				Mod
			</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
  	)
}